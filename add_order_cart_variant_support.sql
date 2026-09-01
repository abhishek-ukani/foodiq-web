-- ====================================================================
-- FoodIQ — Migration 3: Order & Cart Variant Support + RPC Update
-- Run AFTER add_variants_and_pricing.sql
-- Run in Supabase SQL Editor (Database -> SQL Editor)
-- ====================================================================

-- ── 1. Extend cart_items with variant_id ─────────────────────────────
ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS variant_id UUID
    REFERENCES public.food_item_variants(id) ON DELETE SET NULL;

-- Unique constraint: one row per (user, food_item, variant) in cart
-- variant_id IS NULL means "item without a variant" — handled separately
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_user_food_item_variant_in_cart'
  ) THEN
    ALTER TABLE public.cart_items
      ADD CONSTRAINT unique_user_food_item_variant_in_cart
      UNIQUE NULLS NOT DISTINCT (user_id, food_item_id, variant_id);
  END IF;
END$$;

-- ── 2. Extend order_items with variant support ────────────────────────
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS variant_id       UUID
    REFERENCES public.food_item_variants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS variant_snapshot JSONB; -- freeze variant at order time

-- ── 3. Update place_order RPC ─────────────────────────────────────────
--      Key changes from the original:
--      a) fi.offer_price → fi.compare_price (column rename)
--      b) When cart item has variant_id, use the variant's price
--      c) Populate variant_id and variant_snapshot in order_items
-- ====================================================================
CREATE OR REPLACE FUNCTION public.place_order(
  p_address_id           UUID,
  p_delivery_date        DATE,
  p_delivery_slot_id     UUID    DEFAULT NULL,
  p_payment_method       public.payment_method DEFAULT 'cash',
  p_special_instructions TEXT    DEFAULT NULL,
  p_payment_reference    TEXT    DEFAULT NULL,
  p_delivery_charge      NUMERIC DEFAULT 0,
  p_zone_type            TEXT    DEFAULT NULL
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id           UUID;
  v_branch_id         UUID;
  v_address           public.addresses%ROWTYPE;
  v_slot              public.delivery_slots%ROWTYPE;
  v_subtotal          NUMERIC := 0;
  v_calculated_charge NUMERIC := 0;
  v_zone_rec          RECORD;
  v_order_number      TEXT;
  v_order             public.orders%ROWTYPE;
  v_menu_cutoff       TEXT;
  v_cart_item         RECORD;
  v_variant           public.food_item_variants%ROWTYPE;
  v_unit_price        NUMERIC;
  v_line_total        NUMERIC;
BEGIN
  -- 1. Authenticated user check
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 2. Fetch address (must belong to calling user)
  SELECT * INTO v_address
  FROM public.addresses
  WHERE id = p_address_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Address not found or does not belong to user';
  END IF;

  -- 3. Fetch delivery slot (optional)
  IF p_delivery_slot_id IS NOT NULL THEN
    SELECT * INTO v_slot
    FROM public.delivery_slots
    WHERE id = p_delivery_slot_id AND is_active = true;
  END IF;

  -- 4. Default branch
  SELECT id INTO v_branch_id FROM public.branches WHERE is_default = true LIMIT 1;
  IF v_branch_id IS NULL THEN
    SELECT id INTO v_branch_id FROM public.branches WHERE is_active = true LIMIT 1;
  END IF;
  IF v_branch_id IS NULL THEN
    RAISE EXCEPTION 'No active branch configured';
  END IF;

  -- 4b. Enforce Cutoff Time Validation for Same-Day Orders
  IF p_delivery_date = CURRENT_DATE THEN
    SELECT cutoff_time INTO v_menu_cutoff
    FROM public.daily_menus
    WHERE menu_date = CURRENT_DATE
      AND branch_id = v_branch_id
      AND cutoff_time IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_menu_cutoff IS NOT NULL AND (LOCALTIME > v_menu_cutoff::time) THEN
      RAISE EXCEPTION 'Order cutoff time (%) for today''s meal service has passed. Please order for tomorrow.', v_menu_cutoff;
    END IF;
  END IF;

  -- 5. Compute subtotal from cart
  --    If cart item has a variant_id, use variant price; otherwise use food_item price.
  --    compare_price is the MRP — the actual selling price is always `price`.
  SELECT COALESCE(SUM(
    (
      COALESCE(fiv.price, fi.price)
      + COALESCE((
          SELECT SUM((cust->>'price_delta')::NUMERIC)
          FROM jsonb_array_elements(ci.customizations) AS cust
        ), 0)
    ) * ci.quantity
  ), 0)
  INTO v_subtotal
  FROM public.cart_items ci
  JOIN public.food_items fi ON fi.id = ci.food_item_id
  LEFT JOIN public.food_item_variants fiv ON fiv.id = ci.variant_id
  WHERE ci.user_id = v_user_id;

  IF v_subtotal = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  -- 6. Server-side Delivery Charge Validation / Calculation
  SELECT * INTO v_zone_rec
  FROM public.delivery_zones
  WHERE is_active = true
    AND (
      (pincode IS NOT NULL AND pincode = v_address.pincode)
      OR (name ILIKE '%' || v_address.city || '%')
    )
  LIMIT 1;

  IF v_zone_rec IS NOT NULL THEN
    IF v_zone_rec.zone_type = 'BLOCKED' THEN
      RAISE EXCEPTION 'Delivery is unavailable for this zone';
    ELSIF v_zone_rec.zone_type = 'FREE' THEN
      v_calculated_charge := 0;
    ELSIF v_zone_rec.zone_type = 'PAID' THEN
      v_calculated_charge := v_zone_rec.fixed_fee;
    END IF;
  ELSE
    v_calculated_charge := COALESCE(p_delivery_charge, 0);
  END IF;

  -- 7. Generate decodable order number
  DECLARE
    v_has_thali BOOLEAN := FALSE;
    v_has_other BOOLEAN := FALSE;
    v_cat_code  TEXT    := 'ALA';
    v_slot_code TEXT    := 'L';
    v_date_code TEXT;
  BEGIN
    SELECT
      EXISTS(SELECT 1 FROM public.cart_items ci JOIN public.food_items fi ON fi.id = ci.food_item_id WHERE ci.user_id = v_user_id AND (fi.kind = 'thali' OR fi.name ILIKE '%thali%')),
      EXISTS(SELECT 1 FROM public.cart_items ci JOIN public.food_items fi ON fi.id = ci.food_item_id WHERE ci.user_id = v_user_id AND NOT (fi.kind = 'thali' OR fi.name ILIKE '%thali%'))
    INTO v_has_thali, v_has_other;

    IF v_has_thali AND v_has_other THEN
      v_cat_code := 'MIX';
    ELSIF v_has_thali THEN
      v_cat_code := 'THL';
    ELSE
      v_cat_code := 'ALA';
    END IF;

    IF v_slot.label ILIKE '%dinner%' OR v_slot.label ILIKE '%evening%' THEN
      v_slot_code := 'D';
    ELSE
      v_slot_code := 'L';
    END IF;

    v_date_code := TO_CHAR(p_delivery_date, 'YYMMDD');

    v_order_number := 'FIQ-' || v_cat_code || '-' || v_slot_code || v_date_code || '-' ||
                      LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');
  END;

  -- 8. Insert order
  INSERT INTO public.orders (
    order_number, branch_id, user_id, status,
    payment_method, payment_status, payment_reference,
    delivery_date, delivery_slot_id, delivery_slot_label,
    delivery_area_id, address_id,
    contact_name, contact_phone,
    address_line1, address_line2, landmark, city, state, pincode,
    subtotal, delivery_charge, discount_amount, tax_amount, total_amount,
    special_instructions, placed_at
  )
  VALUES (
    v_order_number, v_branch_id, v_user_id, 'pending'::public.order_status,
    p_payment_method,
    (CASE WHEN p_payment_method = 'upi' THEN 'awaiting_verification' ELSE 'pending' END)::public.payment_status,
    p_payment_reference,
    p_delivery_date, p_delivery_slot_id, COALESCE(v_slot.label, 'Standard Delivery'),
    NULL, p_address_id,
    v_address.contact_name, v_address.contact_phone,
    v_address.address_line1, v_address.address_line2, v_address.landmark,
    v_address.city, v_address.state, v_address.pincode,
    v_subtotal, v_calculated_charge, 0, 0, (v_subtotal + v_calculated_charge),
    p_special_instructions, now()
  )
  RETURNING * INTO v_order;

  -- 9. Copy cart items → order items
  --    Includes variant_id and variant_snapshot for variant-based items.
  FOR v_cart_item IN
    SELECT
      ci.food_item_id,
      ci.quantity,
      ci.customizations,
      ci.special_instructions,
      ci.variant_id,
      fi.name      AS food_name,
      fi.kind      AS food_kind,
      fi.image_url AS food_image_url,
      fi.price     AS food_price,
      fiv.price    AS variant_price,
      fiv.label    AS variant_label,
      fiv.sku      AS variant_sku,
      fiv.unit_type AS variant_unit_type,
      fiv.quantity  AS variant_quantity
    FROM public.cart_items ci
    JOIN public.food_items fi ON fi.id = ci.food_item_id
    LEFT JOIN public.food_item_variants fiv ON fiv.id = ci.variant_id
    WHERE ci.user_id = v_user_id
  LOOP
    -- Resolve effective unit price: variant price takes priority over food_item price
    v_unit_price := COALESCE(v_cart_item.variant_price, v_cart_item.food_price);

    v_line_total := (
      v_unit_price
      + COALESCE((
          SELECT SUM((cust->>'price_delta')::NUMERIC)
          FROM jsonb_array_elements(v_cart_item.customizations) AS cust
        ), 0)
    ) * v_cart_item.quantity;

    INSERT INTO public.order_items (
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
      special_instructions,
      variant_id,
      variant_snapshot
    )
    VALUES (
      v_order.id,
      v_cart_item.food_item_id,
      CASE
        WHEN v_cart_item.variant_label IS NOT NULL
          THEN v_cart_item.food_name || ' – ' || v_cart_item.variant_label
        ELSE v_cart_item.food_name
      END,
      v_cart_item.food_kind,
      v_cart_item.food_image_url,
      v_unit_price,
      v_cart_item.quantity,
      v_cart_item.customizations,
      COALESCE((
        SELECT SUM((cust->>'price_delta')::NUMERIC)
        FROM jsonb_array_elements(v_cart_item.customizations) AS cust
      ), 0),
      v_line_total,
      v_cart_item.special_instructions,
      v_cart_item.variant_id,
      -- Snapshot the variant details at time of order (immutable record)
      CASE
        WHEN v_cart_item.variant_id IS NOT NULL THEN
          jsonb_build_object(
            'id',        v_cart_item.variant_id,
            'sku',       v_cart_item.variant_sku,
            'label',     v_cart_item.variant_label,
            'unit_type', v_cart_item.variant_unit_type,
            'quantity',  v_cart_item.variant_quantity,
            'price',     v_cart_item.variant_price
          )
        ELSE NULL
      END
    );
  END LOOP;

  -- 10. Record status history
  INSERT INTO public.order_status_history (order_id, from_status, to_status, changed_by)
  VALUES (v_order.id, NULL, 'pending'::public.order_status, v_user_id);

  -- 11. Clear cart
  DELETE FROM public.cart_items WHERE user_id = v_user_id;

  -- 12. Update profile stats
  UPDATE public.profiles
  SET
    total_orders = total_orders + 1,
    total_spent  = total_spent + v_order.total_amount,
    last_order_at = now()
  WHERE id = v_user_id;

  RETURN v_order;
END;
$$;

GRANT EXECUTE ON FUNCTION public.place_order(
  UUID, DATE, UUID, public.payment_method, TEXT, TEXT, NUMERIC, TEXT
) TO authenticated;
