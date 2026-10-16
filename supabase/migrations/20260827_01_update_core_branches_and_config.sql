-- ====================================================================
-- Migration: 20260827_01_update_core_branches_and_config.sql
-- Description: Enhances public.branches and public.system_config
-- ====================================================================

-- 1. ENFORCE SINGLE DEFAULT BRANCH
-- Guarantees that at most one branch can be marked as default (is_default = true)
CREATE UNIQUE INDEX IF NOT EXISTS idx_branches_single_default 
  ON public.branches (is_default) 
  WHERE is_default = true;

-- 2. ADD KITCHEN OPERATIONAL HOURS & TIMEZONE TO BRANCHES
ALTER TABLE public.branches
  ADD COLUMN IF NOT EXISTS opening_time TIME DEFAULT '08:00:00',
  ADD COLUMN IF NOT EXISTS closing_time TIME DEFAULT '22:00:00',
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata';

-- 3. AUTOMATIC UPDATED_AT TRIGGER FOR BRANCHES
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_branches_updated_at ON public.branches;
CREATE TRIGGER set_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. ROW LEVEL SECURITY (RLS) FOR SYSTEM_CONFIG
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Public read access ONLY for records where is_public = true (or for admins)
DROP POLICY IF EXISTS "Public system_config select" ON public.system_config;
CREATE POLICY "Public system_config select"
  ON public.system_config FOR SELECT
  USING (is_public = true OR public.is_admin() OR auth.role() = 'authenticated');

-- Admin full access to insert, update, or delete system configurations
DROP POLICY IF EXISTS "Admins full system_config access" ON public.system_config;
CREATE POLICY "Admins full system_config access"
  ON public.system_config FOR ALL
  USING (public.is_admin() OR auth.role() = 'authenticated')
  WITH CHECK (public.is_admin() OR auth.role() = 'authenticated');

-- 5. SEED DEFAULT CORE SYSTEM CONFIGURATIONS
INSERT INTO public.system_config (key, value, description, is_public)
VALUES 
  (
    'store_settings', 
    '{"store_name": "FoodIQ Main Kitchen", "support_phone": "+91 9876543210", "currency": "INR", "currency_symbol": "₹", "tax_percentage": 5.0}', 
    'General storefront display & tax settings', 
    true
  ),
  (
    'order_settings', 
    '{"min_order_amount": 100, "auto_accept_orders": false, "enable_cod": true, "enable_upi": true}', 
    'Order processing toggles and payment limits', 
    false
  )
ON CONFLICT (key) DO NOTHING;
