-- ==============================================================================
-- SEED SCRIPT: Gujarati Customer (Jignesh Shah) with 3 Ahmedabad Addresses
-- Run this script in your Supabase SQL Editor.
-- ==============================================================================

DO $$
DECLARE
  v_user_id UUID := 'c0a80101-0000-4000-8000-000000000001'::uuid;
BEGIN
  -- 0. Insert into auth.users to satisfy foreign key constraint
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'jignesh.shah@example.com',
    '$2a$10$wN9aL9u1vC0u5xZ.q3y6eO8R1Wb3S8g7X2K4N5M6P7Q8R9S0T1U2V',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Jignesh Shah"}'::jsonb,
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO NOTHING;

  -- 1. Create or update customer profile
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone,
    role,
    is_active,
    is_subscription_eligible,
    total_orders,
    total_spent,
    marketing_opt_in,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    'Jignesh Shah',
    'jignesh.shah@example.com',
    '+91 98250 12345',
    'customer',
    true,
    true,
    12,
    2850.00,
    true,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    is_active = true;

  -- 2. Clear existing dummy addresses for this user to avoid duplicates
  DELETE FROM public.addresses WHERE user_id = v_user_id;

  -- 3. Insert Address 1: Home (Navrangpura, Ahmedabad)
  INSERT INTO public.addresses (
    id,
    user_id,
    label,
    contact_name,
    contact_phone,
    address_line1,
    address_line2,
    landmark,
    city,
    state,
    pincode,
    is_default,
    created_at,
    updated_at
  ) VALUES (
    'a0a80101-0000-4000-8000-000000000001'::uuid,
    v_user_id,
    'home',
    'Jignesh Shah',
    '+91 98250 12345',
    'A-302, Shivalik Residency, Opp. H.L. Commerce College',
    'Navrangpura',
    'Near Commerce Six Roads',
    'Ahmedabad',
    'Gujarat',
    '380009',
    true,
    now(),
    now()
  );

  -- 4. Insert Address 2: Office / Work (Prahlad Nagar, Ahmedabad)
  INSERT INTO public.addresses (
    id,
    user_id,
    label,
    contact_name,
    contact_phone,
    address_line1,
    address_line2,
    landmark,
    city,
    state,
    pincode,
    is_default,
    created_at,
    updated_at
  ) VALUES (
    'a0a80101-0000-4000-8000-000000000002'::uuid,
    v_user_id,
    'work',
    'Jignesh Shah',
    '+91 98250 12345',
    '704, Mondeal Heights, Next to Novotel Hotel',
    'S.G. Highway, Prahlad Nagar',
    'Near Iscon Cross Roads',
    'Ahmedabad',
    'Gujarat',
    '380015',
    false,
    now(),
    now()
  );

  -- 5. Insert Address 3: Family / Parents' House (Vastrapur, Ahmedabad)
  INSERT INTO public.addresses (
    id,
    user_id,
    label,
    contact_name,
    contact_phone,
    address_line1,
    address_line2,
    landmark,
    city,
    state,
    pincode,
    is_default,
    created_at,
    updated_at
  ) VALUES (
    'a0a80101-0000-4000-8000-000000000003'::uuid,
    v_user_id,
    'other',
    'Jignesh Shah (Family)',
    '+91 98250 67890',
    '12, Devansh Bungalows, Behind Vastrapur Lake',
    'Vastrapur',
    'Opposite IIM Ahmedabad New Campus',
    'Ahmedabad',
    'Gujarat',
    '380054',
    false,
    now(),
    now()
  );

  RAISE NOTICE 'Successfully created auth user, profile, and 3 Ahmedabad addresses for Jignesh Shah!';
END $$;
