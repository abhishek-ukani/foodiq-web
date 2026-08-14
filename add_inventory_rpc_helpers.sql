-- ======================================================================
-- FoodIQ: Inventory enforcement helpers for the place_order RPC
-- Run this in Supabase SQL Editor (Database → SQL Editor)
-- ======================================================================

-- -----------------------------------------------------------------------
-- 1. check_and_reserve_inventory
--    Call this inside your place_order function for EACH cart item.
--    Raises an exception (which aborts the whole transaction) if the item
--    is sold out or past its cutoff time.
--    On success: increments sold_quantity atomically.
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

  -- If no menu row found, skip inventory check (item may be a Thali sold globally)
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
  'Validates and reserves inventory for one food item. Call inside place_order for each cart item.';


-- -----------------------------------------------------------------------
-- 2. release_inventory
--    Call this when an order is cancelled or rejected to free up capacity.
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
    -- Find matching daily_menu_items row
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
  'Decrements sold_quantity for all items in an order. Call on order cancel or reject.';


-- -----------------------------------------------------------------------
-- HOW TO WIRE INTO YOUR EXISTING place_order FUNCTION
-- -----------------------------------------------------------------------
-- Inside your existing place_order function body, for each cart item loop,
-- add ONE line per item before inserting the order:
--
--   PERFORM public.check_and_reserve_inventory(
--     v_cart_item.food_item_id,
--     p_delivery_date,
--     v_cart_item.quantity
--   );
--
-- Example snippet to add inside your cart item loop:
--
--   FOR v_cart_item IN (SELECT * FROM cart_items WHERE user_id = auth.uid()) LOOP
--     -- ↓ ADD THIS LINE:
--     PERFORM public.check_and_reserve_inventory(v_cart_item.food_item_id, p_delivery_date, v_cart_item.quantity);
--     -- ... rest of your existing logic
--   END LOOP;
--
-- This keeps your existing function intact and adds inventory enforcement.
-- -----------------------------------------------------------------------
