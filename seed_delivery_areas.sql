-- ====================================================================
-- FoodIQ - Seed Delivery Areas
-- Run this script in Supabase SQL Editor (Database -> SQL Editor)
-- ====================================================================

DO $$
DECLARE
  v_branch_id UUID;
BEGIN
  -- Get default branch ID
  SELECT id INTO v_branch_id FROM public.branches WHERE is_default = true LIMIT 1;
  IF v_branch_id IS NULL THEN
    SELECT id INTO v_branch_id FROM public.branches LIMIT 1;
  END IF;

  IF v_branch_id IS NULL THEN
    RAISE EXCEPTION 'No active branch found in public.branches table.';
  END IF;

  -- Insert sample delivery areas for Surat
  INSERT INTO public.delivery_areas (branch_id, name, pincode, city, state, delivery_charge, min_order_amount, free_delivery_above, estimated_minutes, is_active)
  VALUES
    (v_branch_id, 'Adajan', '395009', 'Surat', 'Gujarat', 20, 100, 300, 25, true),
    (v_branch_id, 'Vesu', '395007', 'Surat', 'Gujarat', 25, 100, 350, 30, true),
    (v_branch_id, 'Pal', '395009', 'Surat', 'Gujarat', 20, 100, 300, 25, true),
    (v_branch_id, 'Piplod', '395007', 'Surat', 'Gujarat', 25, 120, 350, 30, true),
    (v_branch_id, 'City Light', '395007', 'Surat', 'Gujarat', 25, 100, 300, 25, true),
    (v_branch_id, 'VIP Road', '395007', 'Surat', 'Gujarat', 20, 100, 300, 20, true),
    (v_branch_id, 'Althan', '395017', 'Surat', 'Gujarat', 30, 150, 400, 35, true),
    (v_branch_id, 'Varachha', '395006', 'Surat', 'Gujarat', 30, 150, 400, 40, true);

  RAISE NOTICE 'Successfully seeded delivery areas for branch %', v_branch_id;
END $$;
