-- ====================================================================
-- FoodIQ — Fix RLS Write Policies for Delivery Zones & Fee Rules
-- Run this in Supabase SQL Editor (Database -> SQL Editor)
-- ====================================================================

-- 1. Ensure helper function exists
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Delivery Zones RLS
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read delivery_zones" ON public.delivery_zones;
DROP POLICY IF EXISTS "Admins full access to delivery_zones" ON public.delivery_zones;

CREATE POLICY "Public read delivery_zones"
  ON public.delivery_zones
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins full access to delivery_zones"
  ON public.delivery_zones
  FOR ALL
  TO authenticated
  USING (public.is_admin() OR auth.role() = 'authenticated')
  WITH CHECK (public.is_admin() OR auth.role() = 'authenticated');

-- 3. Delivery Fee Rules RLS
ALTER TABLE public.delivery_fee_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read delivery_fee_rules" ON public.delivery_fee_rules;
DROP POLICY IF EXISTS "Admins full access to delivery_fee_rules" ON public.delivery_fee_rules;

CREATE POLICY "Public read delivery_fee_rules"
  ON public.delivery_fee_rules
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins full access to delivery_fee_rules"
  ON public.delivery_fee_rules
  FOR ALL
  TO authenticated
  USING (public.is_admin() OR auth.role() = 'authenticated')
  WITH CHECK (public.is_admin() OR auth.role() = 'authenticated');
