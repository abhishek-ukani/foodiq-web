-- ====================================================================
-- FoodIQ (FoodIQ) - Complete Database Schema Migration Script
-- Run this script in your new Supabase SQL Editor (Database -> SQL Editor)
-- ====================================================================

-- 1. ENUMS
CREATE TYPE public.user_role AS ENUM ('customer', 'admin', 'delivery_boy');
CREATE TYPE public.meal_type AS ENUM ('breakfast', 'lunch', 'dinner');
CREATE TYPE public.item_kind AS ENUM ('single', 'thali');
CREATE TYPE public.food_type AS ENUM ('veg', 'jain', 'vegan', 'egg', 'non_veg');
CREATE TYPE public.order_status AS ENUM (
  'pending', 'accepted', 'rejected', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'
);
CREATE TYPE public.payment_method AS ENUM ('cash', 'upi');
CREATE TYPE public.payment_status AS ENUM ('pending', 'awaiting_verification', 'paid', 'failed', 'refunded');
CREATE TYPE public.address_label AS ENUM ('home', 'work', 'other');
CREATE TYPE public.notification_type AS ENUM ('order_update', 'offer', 'announcement', 'maintenance', 'system');
CREATE TYPE public.notification_audience AS ENUM ('all', 'customers', 'single_user');
CREATE TYPE public.review_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.contact_status AS ENUM ('new', 'in_progress', 'resolved', 'archived');
CREATE TYPE public.policy_slug AS ENUM ('privacy', 'terms', 'refund', 'about', 'shipping');
CREATE TYPE public.banner_placement AS ENUM ('hero', 'promo_strip', 'menu_top', 'popup');

-- 2. TABLES

-- Branches
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_default BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Profiles (links to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role DEFAULT 'customer'::public.user_role NOT NULL,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  is_active BOOLEAN DEFAULT true NOT NULL,
  total_orders INT DEFAULT 0 NOT NULL,
  total_spent NUMERIC DEFAULT 0 NOT NULL,
  last_order_at TIMESTAMPTZ,
  marketing_opt_in BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Delivery Areas
CREATE TABLE public.delivery_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  pincode TEXT NOT NULL,
  city TEXT,
  state TEXT,
  delivery_charge NUMERIC DEFAULT 0 NOT NULL,
  min_order_amount NUMERIC DEFAULT 0 NOT NULL,
  free_delivery_above NUMERIC,
  estimated_minutes INT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Delivery Slots
CREATE TABLE public.delivery_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  meal_type public.meal_type NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  cutoff_time TIME NOT NULL,
  max_orders INT,
  display_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Customer Addresses
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  delivery_area_id UUID REFERENCES public.delivery_areas(id) ON DELETE SET NULL,
  label public.address_label DEFAULT 'home'::public.address_label NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  landmark TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_default BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  icon TEXT,
  display_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Food Items
CREATE TABLE public.food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  kind public.item_kind DEFAULT 'single'::public.item_kind NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  ingredients TEXT[],
  food_type public.food_type DEFAULT 'veg'::public.food_type NOT NULL,
  price NUMERIC NOT NULL,
  offer_price NUMERIC,
  unit_label TEXT,
  serves INT,
  prep_minutes INT,
  spice_level INT,
  calories INT,
  nutrition JSONB,
  image_url TEXT,
  gallery_urls TEXT[],
  is_available BOOLEAN DEFAULT true NOT NULL,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  track_stock BOOLEAN DEFAULT false NOT NULL,
  stock_quantity INT DEFAULT 0 NOT NULL,
  rating_average NUMERIC(3,2) DEFAULT 0 NOT NULL,
  rating_count INT DEFAULT 0 NOT NULL,
  total_sold INT DEFAULT 0 NOT NULL,
  display_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Thali Items Breakdown
CREATE TABLE public.thali_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thali_id UUID REFERENCES public.food_items(id) ON DELETE CASCADE NOT NULL,
  food_item_id UUID REFERENCES public.food_items(id) ON DELETE SET NULL,
  custom_name TEXT,
  quantity INT DEFAULT 1 NOT NULL,
  display_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Item Customizations / Add-ons
CREATE TABLE public.item_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_item_id UUID REFERENCES public.food_items(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price_delta NUMERIC DEFAULT 0 NOT NULL,
  is_default BOOLEAN DEFAULT false NOT NULL,
  display_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Daily Menus
CREATE TABLE public.daily_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  menu_date DATE NOT NULL,
  meal_type public.meal_type NOT NULL,
  title TEXT,
  note TEXT,
  is_published BOOLEAN DEFAULT false NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(branch_id, menu_date, meal_type)
);

-- Daily Menu Items
CREATE TABLE public.daily_menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_menu_id UUID REFERENCES public.daily_menus(id) ON DELETE CASCADE NOT NULL,
  food_item_id UUID REFERENCES public.food_items(id) ON DELETE CASCADE NOT NULL,
  price_override NUMERIC,
  available_quantity INT,
  sold_quantity INT DEFAULT 0 NOT NULL,
  is_available BOOLEAN DEFAULT true NOT NULL,
  is_special BOOLEAN DEFAULT false NOT NULL,
  display_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(daily_menu_id, food_item_id)
);

-- Price History Log
CREATE TABLE public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_item_id UUID REFERENCES public.food_items(id) ON DELETE CASCADE NOT NULL,
  old_price NUMERIC,
  new_price NUMERIC NOT NULL,
  old_offer_price NUMERIC,
  new_offer_price NUMERIC,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Favorites
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  food_item_id UUID REFERENCES public.food_items(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, food_item_id)
);

-- Cart Items
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  food_item_id UUID REFERENCES public.food_items(id) ON DELETE CASCADE NOT NULL,
  daily_menu_item_id UUID REFERENCES public.daily_menu_items(id) ON DELETE SET NULL,
  quantity INT DEFAULT 1 NOT NULL,
  customizations JSONB DEFAULT '[]'::jsonb NOT NULL,
  special_instructions TEXT,
  delivery_date DATE,
  delivery_slot_id UUID REFERENCES public.delivery_slots(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Coupons
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
  discount_value NUMERIC NOT NULL,
  max_discount NUMERIC,
  min_order_amount NUMERIC DEFAULT 0 NOT NULL,
  usage_limit INT,
  usage_limit_per_user INT,
  used_count INT DEFAULT 0 NOT NULL,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status public.order_status DEFAULT 'pending'::public.order_status NOT NULL,
  payment_method public.payment_method NOT NULL,
  payment_status public.payment_status DEFAULT 'pending'::public.payment_status NOT NULL,
  payment_reference TEXT,
  payment_proof_url TEXT,
  paid_at TIMESTAMPTZ,
  delivery_date DATE NOT NULL,
  delivery_slot_id UUID REFERENCES public.delivery_slots(id) ON DELETE SET NULL,
  delivery_slot_label TEXT,
  delivery_area_id UUID REFERENCES public.delivery_areas(id) ON DELETE SET NULL,
  address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  landmark TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  subtotal NUMERIC NOT NULL,
  delivery_charge NUMERIC DEFAULT 0 NOT NULL,
  discount_amount NUMERIC DEFAULT 0 NOT NULL,
  tax_amount NUMERIC DEFAULT 0 NOT NULL,
  total_amount NUMERIC NOT NULL,
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
  coupon_code TEXT,
  special_instructions TEXT,
  cancellation_reason TEXT,
  rejection_reason TEXT,
  placed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  accepted_at TIMESTAMPTZ,
  prepared_at TIMESTAMPTZ,
  dispatched_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Order Items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  food_item_id UUID REFERENCES public.food_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  item_kind public.item_kind NOT NULL,
  item_image_url TEXT,
  item_snapshot JSONB,
  unit_price NUMERIC NOT NULL,
  quantity INT NOT NULL,
  customizations JSONB DEFAULT '[]'::jsonb NOT NULL,
  customization_total NUMERIC DEFAULT 0 NOT NULL,
  line_total NUMERIC NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Order Status History Audit
CREATE TABLE public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  from_status public.order_status,
  to_status public.order_status NOT NULL,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- UPI QR Codes
CREATE TABLE public.upi_qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  upi_id TEXT,
  payee_name TEXT,
  qr_image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  food_item_id UUID REFERENCES public.food_items(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title TEXT,
  comment TEXT,
  image_urls TEXT[],
  status public.review_status DEFAULT 'pending'::public.review_status NOT NULL,
  admin_response TEXT,
  responded_at TIMESTAMPTZ,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type public.notification_type DEFAULT 'system'::public.notification_type NOT NULL,
  audience public.notification_audience DEFAULT 'single_user'::public.notification_audience NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  image_url TEXT,
  action_url TEXT,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  read_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Contact Messages
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status public.contact_status DEFAULT 'new'::public.contact_status NOT NULL,
  admin_note TEXT,
  handled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  handled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Policies
CREATE TABLE public.policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug public.policy_slug UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_description TEXT,
  is_published BOOLEAN DEFAULT true NOT NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- FAQs
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  display_order INT DEFAULT 0 NOT NULL,
  is_published BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Banners
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
  placement public.banner_placement DEFAULT 'hero'::public.banner_placement NOT NULL,
  title TEXT,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  cta_label TEXT,
  cta_url TEXT,
  display_order INT DEFAULT 0 NOT NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Testimonials
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_role TEXT,
  author_avatar_url TEXT,
  quote TEXT NOT NULL,
  rating INT,
  display_order INT DEFAULT 0 NOT NULL,
  is_published BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- System Config
CREATE TABLE public.system_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false NOT NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Audit Logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. AUTOMATIC USER PROFILE TRIGGER
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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active food items, categories & menus
CREATE POLICY "Public categories read" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public food items read" ON public.food_items FOR SELECT USING (is_available = true);
CREATE POLICY "Public daily menus read" ON public.daily_menus FOR SELECT USING (is_published = true);
CREATE POLICY "Public daily menu items read" ON public.daily_menu_items FOR SELECT USING (is_available = true);
CREATE POLICY "Public branches read" ON public.branches FOR SELECT USING (is_active = true);

-- User specific security policies
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can read own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own cart" ON public.cart_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id);

-- Default Branch Insert for initial setup
INSERT INTO public.branches (name, slug, city, state, is_active, is_default)
VALUES ('FoodIQ Main Kitchen', 'main-kitchen', 'Surat', 'Gujarat', true, true)
ON CONFLICT (slug) DO NOTHING;
