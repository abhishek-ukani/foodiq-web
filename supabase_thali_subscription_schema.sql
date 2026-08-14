-- ====================================================================
-- FoodIQ (Thakar Rasoi) - Thali Option Groups, Overnight Cutoffs & Subscriptions
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

-- 2. Extend User Profiles for Admin Subscription Eligibility Whitelist
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_subscription_eligible BOOLEAN DEFAULT false NOT NULL;

-- 3. Global Feature Flag for Subscriptions (Default Disabled)
INSERT INTO public.system_config (key, value, description, is_public)
VALUES ('feature_subscriptions_enabled', 'false'::jsonb, 'Global feature flag for subscription visibility', true)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 4. Dynamic Thali Option Groups Table
CREATE TABLE IF NOT EXISTS public.thali_option_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_item_id UUID REFERENCES public.food_items(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  group_type TEXT CHECK (group_type IN ('static_choice', 'daily_menu_choice', 'optional_addon')) DEFAULT 'static_choice' NOT NULL,
  min_select INT DEFAULT 1 NOT NULL,
  max_select INT DEFAULT 1 NOT NULL,
  is_required BOOLEAN DEFAULT true NOT NULL,
  display_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. Option Items Table
CREATE TABLE IF NOT EXISTS public.thali_option_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.thali_option_groups(id) ON DELETE CASCADE NOT NULL,
  linked_food_item_id UUID REFERENCES public.food_items(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  price_delta NUMERIC DEFAULT 0 NOT NULL,
  is_default BOOLEAN DEFAULT false NOT NULL,
  display_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. Extend Daily Menu Items with Item-Level Cutoff Timestamps
ALTER TABLE public.daily_menu_items 
  ADD COLUMN IF NOT EXISTS cutoff_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cutoff_note TEXT;

-- 7. Subscription Master Plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  thali_food_item_id UUID REFERENCES public.food_items(id) ON DELETE CASCADE NOT NULL,
  duration_days INT NOT NULL,
  total_meals INT NOT NULL,
  meal_type_allowed TEXT CHECK (meal_type_allowed IN ('lunch_only', 'dinner_only', 'both')) NOT NULL,
  price NUMERIC NOT NULL,
  discount_percentage NUMERIC DEFAULT 0 NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 8. Customer Active Subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE RESTRICT NOT NULL,
  address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  default_delivery_slot_id UUID REFERENCES public.delivery_slots(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_meals INT NOT NULL,
  meals_remaining INT NOT NULL,
  status TEXT CHECK (status IN ('active', 'paused', 'cancelled', 'expired')) DEFAULT 'active' NOT NULL,
  paused_from DATE,
  paused_until DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 9. Subscription Daily Deliveries Log
CREATE TABLE IF NOT EXISTS public.subscription_daily_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  delivery_date DATE NOT NULL,
  meal_type public.meal_type NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'customized', 'auto_fulfilled', 'skipped', 'delivered', 'cancelled')) DEFAULT 'scheduled' NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  selected_customizations JSONB DEFAULT '{}'::jsonb,
  customized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES & ADMIN FULL ACCESS
ALTER TABLE public.thali_option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thali_option_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_daily_deliveries ENABLE ROW LEVEL SECURITY;

-- Drop existing restricted policies if present
DROP POLICY IF EXISTS "Public daily menus read" ON public.daily_menus;
DROP POLICY IF EXISTS "Public daily menu items read" ON public.daily_menu_items;
DROP POLICY IF EXISTS "Public option groups read" ON public.thali_option_groups;
DROP POLICY IF EXISTS "Public option items read" ON public.thali_option_items;
DROP POLICY IF EXISTS "Public subscription plans read" ON public.subscription_plans;

-- Public Read Policies
CREATE POLICY "Public daily menus read" ON public.daily_menus FOR SELECT USING (is_published = true OR public.is_admin());
CREATE POLICY "Public daily menu items read" ON public.daily_menu_items FOR SELECT USING (is_available = true OR public.is_admin());
CREATE POLICY "Public option groups read" ON public.thali_option_groups FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Public option items read" ON public.thali_option_items FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Public subscription plans read" ON public.subscription_plans FOR SELECT USING (is_active = true OR public.is_admin());

-- Admin Full Management Policies (Insert, Update, Delete)
DROP POLICY IF EXISTS "Admins full access to daily_menus" ON public.daily_menus;
CREATE POLICY "Admins full access to daily_menus" ON public.daily_menus FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access to daily_menu_items" ON public.daily_menu_items;
CREATE POLICY "Admins full access to daily_menu_items" ON public.daily_menu_items FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access to thali_option_groups" ON public.thali_option_groups;
CREATE POLICY "Admins full access to thali_option_groups" ON public.thali_option_groups FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access to thali_option_items" ON public.thali_option_items;
CREATE POLICY "Admins full access to thali_option_items" ON public.thali_option_items FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access to subscription_plans" ON public.subscription_plans;
CREATE POLICY "Admins full access to subscription_plans" ON public.subscription_plans FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access to profiles" ON public.profiles;
CREATE POLICY "Admins full access to profiles" ON public.profiles FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access to orders" ON public.orders;
CREATE POLICY "Admins full access to orders" ON public.orders FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access to order_items" ON public.order_items;
CREATE POLICY "Admins full access to order_items" ON public.order_items FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access to addresses" ON public.addresses;
CREATE POLICY "Admins full access to addresses" ON public.addresses FOR ALL USING (public.is_admin());

-- User Policies for Subscriptions & Deliveries
DROP POLICY IF EXISTS "Users can read own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can read own daily deliveries" ON public.subscription_daily_deliveries;
DROP POLICY IF EXISTS "Users can update own daily deliveries" ON public.subscription_daily_deliveries;

CREATE POLICY "Users can read own subscriptions" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own subscriptions" ON public.user_subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can read own daily deliveries" ON public.subscription_daily_deliveries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own daily deliveries" ON public.subscription_daily_deliveries FOR UPDATE USING (auth.uid() = user_id);


