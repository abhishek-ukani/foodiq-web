-- ====================================================================
-- FoodIQ - Database Schema Cleanup
-- Drop obsolete delivery tables & detach foreign keys
--
-- Run this script in your Supabase SQL Editor (Database -> SQL Editor)
-- ====================================================================

-- --------------------------------------------------------------------
-- STEP 1: Detach foreign keys pointing to public.delivery_slots
-- --------------------------------------------------------------------

-- Automatically drop any foreign key constraints across the schema that reference delivery_slots
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT tc.table_schema, tc.table_name, tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
      AND tc.table_schema = ccu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_name = 'delivery_slots'
  ) LOOP
    EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I;', r.table_schema, r.table_name, r.constraint_name);
    RAISE NOTICE 'Dropped foreign key constraint % on %.%', r.constraint_name, r.table_schema, r.table_name;
  END LOOP;
END $$;

-- Explicitly ensure known constraint names are dropped (for cart_items, orders, user_subscriptions, subscriptions)
ALTER TABLE IF EXISTS public.cart_items DROP CONSTRAINT IF EXISTS cart_items_delivery_slot_id_fkey;
ALTER TABLE IF EXISTS public.orders DROP CONSTRAINT IF EXISTS orders_delivery_slot_id_fkey;
ALTER TABLE IF EXISTS public.user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_default_delivery_slot_id_fkey;
ALTER TABLE IF EXISTS public.user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_delivery_slot_id_fkey;
ALTER TABLE IF EXISTS public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_default_delivery_slot_id_fkey;
ALTER TABLE IF EXISTS public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_delivery_slot_id_fkey;

-- --------------------------------------------------------------------
-- STEP 2: Drop obsolete delivery tables
-- --------------------------------------------------------------------

-- 1. Drop delivery_slots table
DROP TABLE IF EXISTS public.delivery_slots CASCADE;

-- 2. Drop delivery_zones (obsolete prototype table)
DROP TABLE IF EXISTS public.delivery_zones CASCADE;

-- 3. Drop delivery_fee_rules (obsolete tier table)
DROP TABLE IF EXISTS public.delivery_fee_rules CASCADE;

-- --------------------------------------------------------------------
-- STEP 3: Optional Column Cleanup (Clean up unused references)
-- --------------------------------------------------------------------
-- In cart_items and user_subscriptions, the slot references are no longer used:
ALTER TABLE IF EXISTS public.cart_items DROP COLUMN IF EXISTS delivery_slot_id;
ALTER TABLE IF EXISTS public.user_subscriptions DROP COLUMN IF EXISTS default_delivery_slot_id;
ALTER TABLE IF EXISTS public.subscriptions DROP COLUMN IF EXISTS default_delivery_slot_id;
ALTER TABLE IF EXISTS public.subscriptions DROP COLUMN IF EXISTS delivery_slot_id;

-- Note for orders.delivery_slot_id:
-- We leave `orders.delivery_slot_id` as an unconstrained nullable column (UUID NULL)
-- so historical order records retain backwards compatibility and any legacy RPC calls succeed.
-- If you wish to drop it completely, uncomment the line below:
-- ALTER TABLE IF EXISTS public.orders DROP COLUMN IF EXISTS delivery_slot_id;

-- --------------------------------------------------------------------
-- STEP 4: Retire delivery_areas, delivery_buildings & delivery_roads
-- --------------------------------------------------------------------
-- 1. Detach foreign keys from addresses and orders
ALTER TABLE IF EXISTS public.addresses DROP CONSTRAINT IF EXISTS addresses_delivery_area_id_fkey;
ALTER TABLE IF EXISTS public.orders DROP CONSTRAINT IF EXISTS orders_delivery_area_id_fkey;

-- 2. Drop abandoned prototype building and road tables
DROP TABLE IF EXISTS public.delivery_buildings CASCADE;
DROP TABLE IF EXISTS public.delivery_roads CASCADE;

-- 3. Drop delivery_areas table
DROP TABLE IF EXISTS public.delivery_areas CASCADE;

-- 4. Clean up unused legacy foreign key columns from addresses
ALTER TABLE IF EXISTS public.addresses DROP COLUMN IF EXISTS delivery_building_id;
ALTER TABLE IF EXISTS public.addresses DROP COLUMN IF EXISTS delivery_road_id;
-- Note: addresses.delivery_area_id and orders.delivery_area_id remain as unconstrained
-- nullable UUID columns to preserve backwards compatibility for historical rows.

