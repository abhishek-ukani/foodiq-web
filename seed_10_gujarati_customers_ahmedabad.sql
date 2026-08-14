-- ==============================================================================
-- SEED SCRIPT: 10 Gujarati Customers with 2-3 Ahmedabad Addresses Each
-- Copy & Run this script in your Supabase SQL Editor.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. AUTH USERS (Satisfies foreign key constraint profiles_id_fkey)
-- ------------------------------------------------------------------------------
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
VALUES
('c0a80102-0000-4000-8000-000000000002'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'parthiv.patel@example.com', '$2a$10$wN9aL9u1vC0u5xZ.q3y6eO8R1Wb3S8g7X2K4N5M6P7Q8R9S0T1U2V', now(), '{"provider":"email"}'::jsonb, '{"full_name":"Parthiv Patel"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
('c0a80103-0000-4000-8000-000000000003'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'kavita.joshi@example.com', '$2a$10$wN9aL9u1vC0u5xZ.q3y6eO8R1Wb3S8g7X2K4N5M6P7Q8R9S0T1U2V', now(), '{"provider":"email"}'::jsonb, '{"full_name":"Kavita Joshi"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
('c0a80104-0000-4000-8000-000000000004'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'bhaven.mehta@example.com', '$2a$10$wN9aL9u1vC0u5xZ.q3y6eO8R1Wb3S8g7X2K4N5M6P7Q8R9S0T1U2V', now(), '{"provider":"email"}'::jsonb, '{"full_name":"Bhaven Mehta"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
('c0a80105-0000-4000-8000-000000000005'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'bhakti.trivedi@example.com', '$2a$10$wN9aL9u1vC0u5xZ.q3y6eO8R1Wb3S8g7X2K4N5M6P7Q8R9S0T1U2V', now(), '{"provider":"email"}'::jsonb, '{"full_name":"Bhakti Trivedi"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
('c0a80106-0000-4000-8000-000000000006'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'harshil.chokshi@example.com', '$2a$10$wN9aL9u1vC0u5xZ.q3y6eO8R1Wb3S8g7X2K4N5M6P7Q8R9S0T1U2V', now(), '{"provider":"email"}'::jsonb, '{"full_name":"Harshil Chokshi"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
('c0a80107-0000-4000-8000-000000000007'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'dharmesh.vora@example.com', '$2a$10$wN9aL9u1vC0u5xZ.q3y6eO8R1Wb3S8g7X2K4N5M6P7Q8R9S0T1U2V', now(), '{"provider":"email"}'::jsonb, '{"full_name":"Dharmesh Vora"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
('c0a80108-0000-4000-8000-000000000008'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'hetvi.solanki@example.com', '$2a$10$wN9aL9u1vC0u5xZ.q3y6eO8R1Wb3S8g7X2K4N5M6P7Q8R9S0T1U2V', now(), '{"provider":"email"}'::jsonb, '{"full_name":"Hetvi Solanki"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
('c0a80109-0000-4000-8000-000000000009'::uuid, '00000000-0000-0000-0000-000000000009'::uuid, 'hardik.desai@example.com', '$2a$10$wN9aL9u1vC0u5xZ.q3y6eO8R1Wb3S8g7X2K4N5M6P7Q8R9S0T1U2V', now(), '{"provider":"email"}'::jsonb, '{"full_name":"Hardik Desai"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
('c0a80110-0000-4000-8000-000000000010'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'purvi.pandya@example.com', '$2a$10$wN9aL9u1vC0u5xZ.q3y6eO8R1Wb3S8g7X2K4N5M6P7Q8R9S0T1U2V', now(), '{"provider":"email"}'::jsonb, '{"full_name":"Purvi Pandya"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
('c0a80111-0000-4000-8000-000000000011'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'chirag.sanghvi@example.com', '$2a$10$wN9aL9u1vC0u5xZ.q3y6eO8R1Wb3S8g7X2K4N5M6P7Q8R9S0T1U2V', now(), '{"provider":"email"}'::jsonb, '{"full_name":"Chirag Sanghvi"}'::jsonb, now(), now(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. PUBLIC PROFILES
-- ------------------------------------------------------------------------------
INSERT INTO public.profiles (id, full_name, email, phone, role, is_active, is_subscription_eligible, total_orders, total_spent, marketing_opt_in)
VALUES
('c0a80102-0000-4000-8000-000000000002'::uuid, 'Parthiv Patel', 'parthiv.patel@example.com', '+91 98251 23456', 'customer', true, true, 8, 1920.00, true),
('c0a80103-0000-4000-8000-000000000003'::uuid, 'Kavita Joshi', 'kavita.joshi@example.com', '+91 98252 34567', 'customer', true, true, 15, 3450.00, true),
('c0a80104-0000-4000-8000-000000000004'::uuid, 'Bhaven Mehta', 'bhaven.mehta@example.com', '+91 98253 45678', 'customer', true, true, 5, 1100.00, false),
('c0a80105-0000-4000-8000-000000000005'::uuid, 'Bhakti Trivedi', 'bhakti.trivedi@example.com', '+91 98254 56789', 'customer', true, true, 22, 5100.00, true),
('c0a80106-0000-4000-8000-000000000006'::uuid, 'Harshil Chokshi', 'harshil.chokshi@example.com', '+91 98255 67890', 'customer', true, true, 10, 2400.00, true),
('c0a80107-0000-4000-8000-000000000007'::uuid, 'Dharmesh Vora', 'dharmesh.vora@example.com', '+91 98256 78901', 'customer', true, true, 18, 4200.00, true),
('c0a80108-0000-4000-8000-000000000008'::uuid, 'Hetvi Solanki', 'hetvi.solanki@example.com', '+91 98257 89012', 'customer', true, true, 4, 850.00, false),
('c0a80109-0000-4000-8000-000000000009'::uuid, 'Hardik Desai', 'hardik.desai@example.com', '+91 98258 90123', 'customer', true, true, 14, 3150.00, true),
('c0a80110-0000-4000-8000-000000000010'::uuid, 'Purvi Pandya', 'purvi.pandya@example.com', '+91 98259 01234', 'customer', true, true, 9, 2100.00, true),
('c0a80111-0000-4000-8000-000000000011'::uuid, 'Chirag Sanghvi', 'chirag.sanghvi@example.com', '+91 98250 99887', 'customer', true, true, 30, 6800.00, true)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone;

-- ------------------------------------------------------------------------------
-- 3. AHMEDABAD ADDRESSES (2 to 3 addresses per customer)
-- ------------------------------------------------------------------------------
DELETE FROM public.addresses WHERE user_id IN (
  'c0a80102-0000-4000-8000-000000000002'::uuid, 'c0a80103-0000-4000-8000-000000000003'::uuid,
  'c0a80104-0000-4000-8000-000000000004'::uuid, 'c0a80105-0000-4000-8000-000000000005'::uuid,
  'c0a80106-0000-4000-8000-000000000006'::uuid, 'c0a80107-0000-4000-8000-000000000007'::uuid,
  'c0a80108-0000-4000-8000-000000000008'::uuid, 'c0a80109-0000-4000-8000-000000000009'::uuid,
  'c0a80110-0000-4000-8000-000000000010'::uuid, 'c0a80111-0000-4000-8000-000000000011'::uuid
);

INSERT INTO public.addresses (id, user_id, label, contact_name, contact_phone, address_line1, address_line2, landmark, city, state, pincode, is_default)
VALUES
-- Parthiv Patel (Satellite & Prahlad Nagar)
('a0a80102-0000-4000-8000-000000000002'::uuid, 'c0a80102-0000-4000-8000-000000000002'::uuid, 'home', 'Parthiv Patel', '+91 98251 23456', 'B-401, Gala Haven, Near Shivranjani Cross Roads', 'Satellite', 'Opp. Star Bazaar', 'Ahmedabad', 'Gujarat', '380015', true),
('a0a80102-0000-4000-8000-000000000022'::uuid, 'c0a80102-0000-4000-8000-000000000002'::uuid, 'work', 'Parthiv Patel', '+91 98251 23456', '302, Venus Atlantis, Corporate Road', 'Prahlad Nagar', 'Near Shell Petrol Pump', 'Ahmedabad', 'Gujarat', '380015', false),
('a0a80102-0000-4000-8000-000000000032'::uuid, 'c0a80102-0000-4000-8000-000000000002'::uuid, 'other', 'Parthiv Patel (Parents)', '+91 98251 99999', '14, Bomanji Lane, Near VS Hospital', 'Ellisbridge', 'Opp. M.J. Library', 'Ahmedabad', 'Gujarat', '380006', false),

-- Kavita Joshi (Bodakdev & Science City)
('a0a80103-0000-4000-8000-000000000003'::uuid, 'c0a80103-0000-4000-8000-000000000003'::uuid, 'home', 'Kavita Joshi', '+91 98252 34567', 'Flat 502, Orchid Elegance, Sindhu Bhavan Road', 'Bodakdev', 'Near Taj Hotel', 'Ahmedabad', 'Gujarat', '380054', true),
('a0a80103-0000-4000-8000-000000000023'::uuid, 'c0a80103-0000-4000-8000-000000000003'::uuid, 'work', 'Kavita Joshi', '+91 98252 34567', 'IT Park Tower A, Science City Road', 'Sola', 'Opp. CIMS Hospital', 'Ahmedabad', 'Gujarat', '380060', false),

-- Bhaven Mehta (Paldi, Ashram Road & Chandkheda)
('a0a80104-0000-4000-8000-000000000004'::uuid, 'c0a80104-0000-4000-8000-000000000004'::uuid, 'home', 'Bhaven Mehta', '+91 98253 45678', '15, Vishwakarma Society, Bhatta', 'Paldi', 'Behind Ananda Hall', 'Ahmedabad', 'Gujarat', '380007', true),
('a0a80104-0000-4000-8000-000000000024'::uuid, 'c0a80104-0000-4000-8000-000000000004'::uuid, 'work', 'Bhaven Mehta', '+91 98253 45678', '5th Floor, Income Tax Building', 'Ashram Road, Usmanpura', 'Near Fortune Landmark', 'Ahmedabad', 'Gujarat', '380013', false),
('a0a80104-0000-4000-8000-000000000034'::uuid, 'c0a80104-0000-4000-8000-000000000004'::uuid, 'other', 'Bhaven Mehta (Factory)', '+91 98253 88888', 'Shed 42, GIDC Industrial Estate', 'Chandkheda', 'Near Visat Petrol Pump', 'Ahmedabad', 'Gujarat', '382424', false),

-- Bhakti Trivedi (Naranpura & Law Garden)
('a0a80105-0000-4000-8000-000000000005'::uuid, 'c0a80105-0000-4000-8000-000000000005'::uuid, 'home', 'Bhakti Trivedi', '+91 98254 56789', 'C-104, Royal Apartments, Ankur Cross Roads', 'Naranpura', 'Opp. Pragatinagar Garden', 'Ahmedabad', 'Gujarat', '380013', true),
('a0a80105-0000-4000-8000-000000000025'::uuid, 'c0a80105-0000-4000-8000-000000000005'::uuid, 'work', 'Bhakti Trivedi', '+91 98254 56789', 'Design Studio, 2nd Floor, Ellisbridge Shopping Centre', 'Law Garden', 'Opp. NCC Ground', 'Ahmedabad', 'Gujarat', '380006', false),

-- Harshil Chokshi (Maninagar & C.G. Road)
('a0a80106-0000-4000-8000-000000000006'::uuid, 'c0a80106-0000-4000-8000-000000000006'::uuid, 'home', 'Harshil Chokshi', '+91 98255 67890', '8, Swastik Society, Rambaug Road', 'Maninagar', 'Near Kankaria Gate 3', 'Ahmedabad', 'Gujarat', '380008', true),
('a0a80106-0000-4000-8000-000000000026'::uuid, 'c0a80106-0000-4000-8000-000000000006'::uuid, 'work', 'Harshil Chokshi', '+91 98255 67890', 'Chokshi Jewelers, Super Mall', 'C.G. Road, Navrangpura', 'Opp. Municipal Market', 'Ahmedabad', 'Gujarat', '380009', false),

-- Dharmesh Vora (Thaltej & Prahlad Nagar)
('a0a80107-0000-4000-8000-000000000007'::uuid, 'c0a80107-0000-4000-8000-000000000007'::uuid, 'home', 'Dharmesh Vora', '+91 98256 78901', 'Bungalow 21, Sterling City', 'Thaltej', 'Near Bhaikaka Nagar', 'Ahmedabad', 'Gujarat', '380059', true),
('a0a80107-0000-4000-8000-000000000027'::uuid, 'c0a80107-0000-4000-8000-000000000007'::uuid, 'work', 'Dharmesh Vora', '+91 98256 78901', '1102, Westgate Tower, S.G. Highway', 'Prahlad Nagar', 'Opp. YMCA Club', 'Ahmedabad', 'Gujarat', '380015', false),

-- Hetvi Solanki (Ambawadi & Satellite)
('a0a80108-0000-4000-8000-000000000008'::uuid, 'c0a80108-0000-4000-8000-000000000008'::uuid, 'home', 'Hetvi Solanki', '+91 98257 89012', 'A-12, Green Park Flats, Nehru Nagar', 'Ambawadi', 'Near Parimal Garden', 'Ahmedabad', 'Gujarat', '380015', true),
('a0a80108-0000-4000-8000-000000000028'::uuid, 'c0a80108-0000-4000-8000-000000000008'::uuid, 'work', 'Hetvi Solanki', '+91 98257 89012', 'Creative Hub, Jodhpur Cross Roads', 'Satellite', 'Opp. Dhananjay Tower', 'Ahmedabad', 'Gujarat', '380015', false),

-- Hardik Desai (Gota & S.G. Highway)
('a0a80109-0000-4000-8000-000000000009'::uuid, 'c0a80109-0000-4000-8000-000000000009'::uuid, 'home', 'Hardik Desai', '+91 98258 90123', 'D-504, Godrej Garden City, Eden Block', 'Gota', 'Near Nirma University', 'Ahmedabad', 'Gujarat', '382481', true),
('a0a80109-0000-4000-8000-000000000029'::uuid, 'c0a80109-0000-4000-8000-000000000009'::uuid, 'work', 'Hardik Desai', '+91 98258 90123', 'Desai Logistics, Gota Flyover Junction', 'SG Highway', 'Near Vaishnodevi Circle', 'Ahmedabad', 'Gujarat', '382481', false),

-- Purvi Pandya (Memnagar & Thaltej)
('a0a80110-0000-4000-8000-000000000010'::uuid, 'c0a80110-0000-4000-8000-000000000010'::uuid, 'home', 'Purvi Pandya', '+91 98259 01234', 'Flat 201, Samarpan Towers, Gurukul Road', 'Memnagar', 'Behind Nilmani Society', 'Ahmedabad', 'Gujarat', '380052', true),
('a0a80110-0000-4000-8000-000000000030'::uuid, 'c0a80110-0000-4000-8000-000000000010'::uuid, 'work', 'Purvi Pandya', '+91 98259 01234', 'Pandya Consultancy, Drive-In Road', 'Thaltej', 'Opp. SAL Hospital', 'Ahmedabad', 'Gujarat', '380054', false),

-- Chirag Sanghvi (Bopal & Shela)
('a0a80111-0000-4000-8000-000000000011'::uuid, 'c0a80111-0000-4000-8000-000000000011'::uuid, 'home', 'Chirag Sanghvi', '+91 98250 99887', 'Villa 4, Applewoods Enclave', 'South Bopal', 'Near TRP Mall', 'Ahmedabad', 'Gujarat', '380058', true),
('a0a80111-0000-4000-8000-000000000031'::uuid, 'c0a80111-0000-4000-8000-000000000011'::uuid, 'work', 'Chirag Sanghvi', '+91 98250 99887', 'Sanghvi Heights Commercial, Shela Road', 'Bopal', 'Near Sky City', 'Ahmedabad', 'Gujarat', '380058', false);

-- ------------------------------------------------------------------------------
-- 4. CONFIRMATION QUERY
-- ------------------------------------------------------------------------------
SELECT p.full_name, p.phone, p.email, count(a.id) as total_addresses
FROM public.profiles p
LEFT JOIN public.addresses a ON a.user_id = p.id
WHERE p.email LIKE '%@example.com'
GROUP BY p.id, p.full_name, p.phone, p.email
ORDER BY p.full_name;
