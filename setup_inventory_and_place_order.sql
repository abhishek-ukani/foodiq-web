-- ======================================================================
-- FoodIQ: Complete Inventory & Order Placement Functions
-- Copy & Run ALL of this in Supabase SQL Editor (Database -> SQL Editor)
-- ======================================================================

-- -----------------------------------------------------------------------
-- 1. Helper: check_and_reserve_inventory
--    Validates quantity caps & cutoff times, then increments sold_quantity.
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_and_reserve_inventory(
  p_food_item_id  UUID,
  p_delivery_date DATE,
  p_quantity      INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_menu_item     daily_menu_items%ROWTYPE;
  v_food_name     TEXT;
  v_current_time  TIME := (NOW() AT TIME ZONE 'Asia/Kolkata')::TIME;
  v_cutoff        TIME;
BEGIN
  -- Find the daily_menu_item for this food_item on the delivery date
  SELECT dmi.*
    INTO v_menu_item
    FROM daily_menu_items dmi
    JOIN daily_menus dm ON dm.id = dmi.daily_menu_id
   WHERE dmi.food_item_id = p_food_item_id
     AND dm.menu_date     = p_delivery_date
     AND dmi.is_available = true
   LIMIT 1;

  -- If no specific menu row found, allow item
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- ── Quantity cap check ──────────────────────────────────────────────
  IF v_menu_item.available_quantity IS NOT NULL
     AND (v_menu_item.sold_quantity + p_quantity) > v_menu_item.available_quantity
  THEN
    SELECT name INTO v_food_name FROM food_items WHERE id = p_food_item_id;
    RAISE EXCEPTION 'Sorry, % is sold out for today. Only % remaining.',
      v_food_name,
      GREATEST(0, v_menu_item.available_quantity - v_menu_item.sold_quantity);
  END IF;

  -- ── Time cutoff check (item-level, fall back to menu-level) ─────────
  v_cutoff := COALESCE(
    v_menu_item.cutoff_time,
    (SELECT cutoff_time FROM daily_menus WHERE id = v_menu_item.daily_menu_id)
  );
  IF v_cutoff IS NOT NULL AND v_current_time > v_cutoff THEN
    SELECT name INTO v_food_name FROM food_items WHERE id = p_food_item_id;
    RAISE EXCEPTION 'Orders for % are closed for today (cutoff was %).', 
      v_food_name, 
      TO_CHAR(v_cutoff, 'HH12:MI AM');
  END IF;

  -- ── Increment sold_quantity atomically ───────────────────────────────
  UPDATE daily_menu_items
     SET sold_quantity = sold_quantity + p_quantity
   WHERE id = v_menu_item.id;
END;
$$;

COMMENT ON FUNCTION public.check_and_reserve_inventory IS
  'Validates and reserves inventory for one food item.';


-- -----------------------------------------------------------------------
-- 2. Helper: release_inventory
--    Decrements sold_quantity when an order is cancelled or rejected.
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.release_inventory(p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_oi RECORD;
  v_menu_item_id UUID;
BEGIN
  FOR v_oi IN
    SELECT oi.food_item_id, oi.quantity, o.delivery_date
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
     WHERE oi.order_id = p_order_id
  LOOP
    SELECT dmi.id
      INTO v_menu_item_id
      FROM daily_menu_items dmi
      JOIN daily_menus dm ON dm.id = dmi.daily_menu_id
     WHERE dmi.food_item_id = v_oi.food_item_id
       AND dm.menu_date     = v_oi.delivery_date
     LIMIT 1;

    IF FOUND THEN
      UPDATE daily_menu_items
         SET sold_quantity = GREATEST(0, sold_quantity - v_oi.quantity)
       WHERE id = v_menu_item_id;
    END IF;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.release_inventory IS
  'Decrements sold_quantity for all items in an order on cancel/reject.';


-- -----------------------------------------------------------------------
-- 3. Core RPC: place_order
--    Atomic placement of web orders from cart_items with inventory checks.
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.place_order(
  p_address_id UUID,
  p_delivery_date DATE,
  p_delivery_slot_id UUID,
  p_payment_method TEXT,
  p_special_instructions TEXT DEFAULT NULL,
  p_payment_reference TEXT DEFAULT NULL
)
RETURNS orders
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_address addresses%ROWTYPE;
  v_slot delivery_slots%ROWTYPE;
  v_delivery_charge NUMERIC := 0;
  v_subtotal NUMERIC := 0;
  v_total NUMERIC := 0;
  v_branch_id UUID;
  v_order orders%ROWTYPE;
  v_cart_item RECORD;
  v_price NUMERIC;
  v_line_total NUMERIC;
  v_payment_status TEXT;
  v_order_number TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to place an order.';
  END IF;

  -- Verify cart is not empty
  IF NOT EXISTS (SELECT 1 FROM cart_items WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'Your cart is empty.';
  END IF;

  -- Fetch address
  SELECT * INTO v_address FROM addresses WHERE id = p_address_id AND user_id = v_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Selected delivery address not found.';
  END IF;

  -- Fetch delivery slot
  SELECT * INTO v_slot FROM delivery_slots WHERE id = p_delivery_slot_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Selected delivery slot not found.';
  END IF;

  v_branch_id := v_slot.branch_id;

  -- Fetch delivery charge from delivery_area if available
  IF v_address.delivery_area_id IS NOT NULL THEN
    SELECT COALESCE(delivery_charge, 0) INTO v_delivery_charge
    FROM delivery_areas
    WHERE id = v_address.delivery_area_id;
    IF v_delivery_charge IS NULL THEN
      v_delivery_charge := 0;
    END IF;
  END IF;

  -- 1. Pass 1: Validate inventory & calculate subtotal
  FOR v_cart_item IN (
    SELECT ci.*, fi.name, fi.kind, fi.image_url, fi.price, fi.offer_price
    FROM cart_items ci
    JOIN food_items fi ON fi.id = ci.food_item_id
    WHERE ci.user_id = v_user_id
  ) LOOP
    -- Validate and reserve inventory (raises exception if sold out / cutoff passed)
    PERFORM public.check_and_reserve_inventory(
      v_cart_item.food_item_id,
      p_delivery_date,
      v_cart_item.quantity
    );

    v_price := COALESCE(v_cart_item.offer_price, v_cart_item.price);
    v_subtotal := v_subtotal + (v_price * v_cart_item.quantity);
  END LOOP;

  v_total := v_subtotal + v_delivery_charge;

  -- Determine payment status
  IF p_payment_method = 'upi' AND p_payment_reference IS NOT NULL AND p_payment_reference <> '' THEN
    v_payment_status := 'awaiting_verification';
  ELSE
    v_payment_status := 'pending';
  END IF;

  -- Generate order number
  v_order_number := 'ORD-' || TO_CHAR(NOW() AT TIME ZONE 'Asia/Kolkata', 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

  -- Create order record
  INSERT INTO orders (
    order_number,
    branch_id,
    user_id,
    status,
    payment_method,
    payment_status,
    payment_reference,
    delivery_date,
    delivery_slot_id,
    delivery_slot_label,
    delivery_area_id,
    address_id,
    contact_name,
    contact_phone,
    address_line1,
    address_line2,
    landmark,
    city,
    state,
    pincode,
    subtotal,
    delivery_charge,
    discount_amount,
    tax_amount,
    total_amount,
    special_instructions,
    placed_at
  ) VALUES (
    v_order_number,
    v_branch_id,
    v_user_id,
    'pending',
    p_payment_method::payment_method,
    v_payment_status::payment_status,
    p_payment_reference,
    p_delivery_date,
    p_delivery_slot_id,
    v_slot.label,
    v_address.delivery_area_id,
    p_address_id,
    v_address.contact_name,
    v_address.contact_phone,
    v_address.address_line1,
    v_address.address_line2,
    v_address.landmark,
    v_address.city,
    v_address.state,
    v_address.pincode,
    v_subtotal,
    v_delivery_charge,
    0,
    0,
    v_total,
    p_special_instructions,
    NOW()
  )
  RETURNING * INTO v_order;

  -- 2. Pass 2: Create order_items
  FOR v_cart_item IN (
    SELECT ci.*, fi.name, fi.kind, fi.image_url, fi.price, fi.offer_price
    FROM cart_items ci
    JOIN food_items fi ON fi.id = ci.food_item_id
    WHERE ci.user_id = v_user_id
  ) LOOP
    v_price := COALESCE(v_cart_item.offer_price, v_cart_item.price);
    v_line_total := v_price * v_cart_item.quantity;

    INSERT INTO order_items (
      order_id,
      food_item_id,
      item_name,
      item_kind,
      item_image_url,
      unit_price,
      quantity,
      customizations,
      customization_total,
      line_total,
      special_instructions
    ) VALUES (
      v_order.id,
      v_cart_item.food_item_id,
      v_cart_item.name,
      v_cart_item.kind,
      v_cart_item.image_url,
      v_price,
      v_cart_item.quantity,
      v_cart_item.customizations,
      0,
      v_line_total,
      v_cart_item.special_instructions
    );
  END LOOP;

  -- Audit log status history
  INSERT INTO order_status_history (
    order_id,
    from_status,
    to_status,
    note
  ) VALUES (
    v_order.id,
    NULL,
    'pending',
    'Order placed by customer'
  );

  -- Clear cart
  DELETE FROM cart_items WHERE user_id = v_user_id;

  RETURN v_order;
END;
$$;

COMMENT ON FUNCTION public.place_order IS
  'Places an order from user cart items with atomic inventory validation.';
