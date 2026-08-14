-- ====================================================================
-- FoodIQ - Add category_type Enum and target_category_type to Database
-- Run this script in your Supabase SQL Editor (Database -> SQL Editor)
-- ====================================================================

-- 1. Create category_type Enum
DO $$ BEGIN
  CREATE TYPE public.category_type AS ENUM (
    'thali',
    'sabji',
    'bread',
    'sweet',
    'snack',
    'beverage',
    'general'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Add category_type to categories table
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS category_type public.category_type DEFAULT 'general'::public.category_type NOT NULL;

-- Auto-tag existing categories based on name & slug
UPDATE public.categories 
  SET category_type = 'thali'::public.category_type 
  WHERE slug LIKE '%thali%' OR LOWER(name) LIKE '%thali%';

UPDATE public.categories 
  SET category_type = 'sabji'::public.category_type 
  WHERE slug LIKE '%sabji%' OR slug LIKE '%shabji%' OR slug LIKE '%sabzi%' OR LOWER(name) LIKE '%sabji%' OR LOWER(name) LIKE '%shabji%' OR LOWER(name) LIKE '%sabzi%' OR LOWER(name) LIKE '%shaak%';

UPDATE public.categories 
  SET category_type = 'sweet'::public.category_type 
  WHERE slug LIKE '%sweet%' OR LOWER(name) LIKE '%sweet%' OR LOWER(name) LIKE '%dessert%' OR LOWER(name) LIKE '%mithai%';

-- 3. Add target_category_type to thali_option_groups table
ALTER TABLE public.thali_option_groups
  ADD COLUMN IF NOT EXISTS target_category_type public.category_type DEFAULT 'sabji'::public.category_type NOT NULL;
