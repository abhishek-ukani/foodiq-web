-- ====================================================================
-- FoodIQ - Authentication Uniqueness, Profile Triggers & Validation
-- Run this script in your Supabase SQL Editor (Database -> SQL Editor)
-- ====================================================================

-- 1. Ensure unique index on profiles email (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_unique_email 
  ON public.profiles (LOWER(TRIM(email))) 
  WHERE email IS NOT NULL AND email <> '';

-- 2. Ensure unique index on profiles phone
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_unique_phone 
  ON public.profiles (phone) 
  WHERE phone IS NOT NULL AND phone <> '';

-- 3. Function to check individual credential availability (Email and Phone)
--    Used by registration form and API to ensure no duplicate accounts
CREATE OR REPLACE FUNCTION public.check_credential_availability(
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_clean_email TEXT := LOWER(TRIM(COALESCE(p_email, '')));
  v_clean_phone TEXT := RIGHT(REGEXP_REPLACE(COALESCE(p_phone, ''), '\D', '', 'g'), 10);
  v_email_exists BOOLEAN := FALSE;
  v_phone_exists BOOLEAN := FALSE;
BEGIN
  -- 1. Check if Email already exists in auth.users or public.profiles
  IF v_clean_email <> '' THEN
    SELECT EXISTS (
      SELECT 1 FROM auth.users 
      WHERE LOWER(TRIM(email)) = v_clean_email
    ) OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE LOWER(TRIM(email)) = v_clean_email
    ) INTO v_email_exists;
  END IF;

  -- 2. Check if Mobile Number already exists in public.profiles or auth.users meta
  IF v_clean_phone <> '' THEN
    SELECT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE phone = v_clean_phone
    ) OR EXISTS (
      SELECT 1 FROM auth.users 
      WHERE RIGHT(REGEXP_REPLACE(COALESCE(raw_user_meta_data->>'phone', phone, ''), '\D', '', 'g'), 10) = v_clean_phone
    ) INTO v_phone_exists;
  END IF;

  RETURN jsonb_build_object(
    'emailAvailable', NOT v_email_exists,
    'phoneAvailable', NOT v_phone_exists
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to anon, authenticated and service_role
GRANT EXECUTE ON FUNCTION public.check_credential_availability(TEXT, TEXT) TO anon, authenticated, service_role;

-- 4. Automatic User Profile Creation Trigger
--    Ensures that when a user signs up via auth.signUp or Google OAuth,
--    their profile row in public.profiles is created/updated immediately.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_phone TEXT;
BEGIN
  v_phone := RIGHT(REGEXP_REPLACE(COALESCE(new.raw_user_meta_data->>'phone', new.phone, ''), '\D', '', 'g'), 10);
  IF v_phone = '' THEN
    v_phone := NULL;
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    role,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    LOWER(TRIM(new.email)),
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    v_phone,
    'customer',
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE 
      WHEN EXCLUDED.full_name IS NOT NULL AND EXCLUDED.full_name <> '' THEN EXCLUDED.full_name 
      ELSE public.profiles.full_name 
    END,
    phone = CASE 
      WHEN EXCLUDED.phone IS NOT NULL AND EXCLUDED.phone <> '' THEN EXCLUDED.phone 
      ELSE public.profiles.phone 
    END,
    updated_at = NOW();

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. RLS Policies on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop prior duplicate policies if any
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon and users to check phone and email uniqueness" ON public.profiles;
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;

-- Anyone can query profiles to check if phone or email exists
CREATE POLICY "Allow public credential check" ON public.profiles
  FOR SELECT
  USING (true);

-- Authenticated users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Authenticated users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
