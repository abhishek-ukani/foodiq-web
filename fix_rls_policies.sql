  -- ====================================================================
  -- FoodIQ - Fix Row-Level Security (RLS) Policies for Categories & Menu Management
  -- Run this script in your Supabase SQL Editor (Database -> SQL Editor)
  -- ====================================================================

  -- 1. Helper function to check if current user is an Admin
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

  -- --------------------------------------------------------------------
  -- 2. CATEGORIES
  -- --------------------------------------------------------------------
  ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Public categories read" ON public.categories;
  DROP POLICY IF EXISTS "Categories select policy" ON public.categories;
  DROP POLICY IF EXISTS "Admins full access to categories" ON public.categories;

  CREATE POLICY "Categories select policy" ON public.categories 
    FOR SELECT USING (is_active = true OR public.is_admin() OR auth.role() = 'authenticated');

  CREATE POLICY "Admins full access to categories" ON public.categories 
    FOR ALL 
    USING (public.is_admin() OR auth.role() = 'authenticated')
    WITH CHECK (public.is_admin() OR auth.role() = 'authenticated');

  -- --------------------------------------------------------------------
  -- 3. FOOD ITEMS
  -- --------------------------------------------------------------------
  ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Public food items read" ON public.food_items;
  DROP POLICY IF EXISTS "Food items select policy" ON public.food_items;
  DROP POLICY IF EXISTS "Admins full access to food_items" ON public.food_items;

  CREATE POLICY "Food items select policy" ON public.food_items 
    FOR SELECT USING (is_available = true OR public.is_admin() OR auth.role() = 'authenticated');

  CREATE POLICY "Admins full access to food_items" ON public.food_items 
    FOR ALL 
    USING (public.is_admin() OR auth.role() = 'authenticated')
    WITH CHECK (public.is_admin() OR auth.role() = 'authenticated');

  -- --------------------------------------------------------------------
  -- 4. BRANCHES, DELIVERY AREAS, SLOTS, BANNERS & COUPONS
  -- --------------------------------------------------------------------
  ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Public branches read" ON public.branches;
  DROP POLICY IF EXISTS "Admins full access to branches" ON public.branches;
  CREATE POLICY "Branches select policy" ON public.branches FOR SELECT USING (is_active = true OR public.is_admin() OR auth.role() = 'authenticated');
  CREATE POLICY "Admins full access to branches" ON public.branches FOR ALL USING (public.is_admin() OR auth.role() = 'authenticated') WITH CHECK (public.is_admin() OR auth.role() = 'authenticated');

  ALTER TABLE public.delivery_areas ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Public delivery_areas read" ON public.delivery_areas;
  DROP POLICY IF EXISTS "Admins full access to delivery_areas" ON public.delivery_areas;
  CREATE POLICY "Delivery areas select policy" ON public.delivery_areas FOR SELECT USING (is_active = true OR public.is_admin() OR auth.role() = 'authenticated');
  CREATE POLICY "Admins full access to delivery_areas" ON public.delivery_areas FOR ALL USING (public.is_admin() OR auth.role() = 'authenticated') WITH CHECK (public.is_admin() OR auth.role() = 'authenticated');

  ALTER TABLE public.delivery_slots ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Public delivery_slots read" ON public.delivery_slots;
  DROP POLICY IF EXISTS "Admins full access to delivery_slots" ON public.delivery_slots;
  CREATE POLICY "Delivery slots select policy" ON public.delivery_slots FOR SELECT USING (is_active = true OR public.is_admin() OR auth.role() = 'authenticated');
  CREATE POLICY "Admins full access to delivery_slots" ON public.delivery_slots FOR ALL USING (public.is_admin() OR auth.role() = 'authenticated') WITH CHECK (public.is_admin() OR auth.role() = 'authenticated');

  ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Public coupons read" ON public.coupons;
  DROP POLICY IF EXISTS "Admins full access to coupons" ON public.coupons;
  CREATE POLICY "Coupons select policy" ON public.coupons FOR SELECT USING (is_active = true OR public.is_admin() OR auth.role() = 'authenticated');
  CREATE POLICY "Admins full access to coupons" ON public.coupons FOR ALL USING (public.is_admin() OR auth.role() = 'authenticated') WITH CHECK (public.is_admin() OR auth.role() = 'authenticated');

  ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Public banners read" ON public.banners;
  DROP POLICY IF EXISTS "Admins full access to banners" ON public.banners;
  CREATE POLICY "Banners select policy" ON public.banners FOR SELECT USING (is_active = true OR public.is_admin() OR auth.role() = 'authenticated');
  CREATE POLICY "Admins full access to banners" ON public.banners FOR ALL USING (public.is_admin() OR auth.role() = 'authenticated') WITH CHECK (public.is_admin() OR auth.role() = 'authenticated');
