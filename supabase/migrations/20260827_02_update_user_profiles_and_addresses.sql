-- ====================================================================
-- Migration: 20260827_02_update_user_profiles_and_addresses.sql
-- Description: Enhances public.profiles and public.addresses tables
-- ====================================================================

-- 1. SINGLE DEFAULT ADDRESS PER CUSTOMER CONSTRAINT
-- Prevents a user from having more than one address marked as default (is_default = true)
CREATE UNIQUE INDEX IF NOT EXISTS idx_addresses_single_default_per_user 
  ON public.addresses (user_id, is_default) 
  WHERE is_default = true;

-- 2. PERFORMANCE INDEXES
-- Index for role-based admin queries and phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- Index for fetching customer addresses during checkout
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);

-- 3. AUTOMATIC UPDATED_AT TRIGGERS
-- Trigger for profiles
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for addresses
DROP TRIGGER IF EXISTS set_addresses_updated_at ON public.addresses;
CREATE TRIGGER set_addresses_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. ENHANCED NEW USER PROFILE REGISTRATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    'customer'::public.user_role,
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE WHEN profiles.full_name IS NULL OR profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END,
    phone = CASE WHEN profiles.phone IS NULL THEN EXCLUDED.phone ELSE profiles.phone END,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
