-- ====================================================================
-- Refactor Category Taxonomy & Dynamic Thali Option Groups Migration
-- Adds target_category_id foreign key to thali_option_groups
-- ====================================================================

-- 1. Add target_category_id column to thali_option_groups if not exists
ALTER TABLE public.thali_option_groups
ADD COLUMN IF NOT EXISTS target_category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Make category_type optional / default 'general' on categories table if constraint exists
ALTER TABLE public.categories 
ALTER COLUMN category_type DROP NOT NULL;

-- 2. Populate target_category_id for existing option groups based on name/type matching
DO $$
DECLARE
    v_cat_sabji UUID;
    v_cat_bread UUID;
    v_cat_sweet UUID;
    v_cat_snack UUID;
    v_cat_beverage UUID;
    v_cat_rice UUID;
BEGIN
    SELECT id INTO v_cat_sabji FROM public.categories WHERE category_type = 'sabji' OR LOWER(name) LIKE '%sabji%' OR LOWER(name) LIKE '%curry%' LIMIT 1;
    SELECT id INTO v_cat_bread FROM public.categories WHERE category_type = 'bread' OR LOWER(name) LIKE '%roti%' OR LOWER(name) LIKE '%bread%' OR LOWER(name) LIKE '%bhakhri%' LIMIT 1;
    SELECT id INTO v_cat_sweet FROM public.categories WHERE category_type = 'sweet' OR LOWER(name) LIKE '%sweet%' OR LOWER(name) LIKE '%dessert%' LIMIT 1;
    SELECT id INTO v_cat_snack FROM public.categories WHERE category_type = 'snack' OR LOWER(name) LIKE '%snack%' OR LOWER(name) LIKE '%farsan%' OR LOWER(name) LIKE '%accompaniment%' LIMIT 1;

    -- Update Option Groups
    IF v_cat_sabji IS NOT NULL THEN
        UPDATE public.thali_option_groups SET target_category_id = v_cat_sabji WHERE target_category_id IS NULL AND (target_category_type = 'sabji' OR LOWER(name) LIKE '%sabji%');
    END IF;

    IF v_cat_bread IS NOT NULL THEN
        UPDATE public.thali_option_groups SET target_category_id = v_cat_bread WHERE target_category_id IS NULL AND (target_category_type = 'bread' OR LOWER(name) LIKE '%bread%' OR LOWER(name) LIKE '%roti%');
    END IF;

    IF v_cat_sweet IS NOT NULL THEN
        UPDATE public.thali_option_groups SET target_category_id = v_cat_sweet WHERE target_category_id IS NULL AND (target_category_type = 'sweet' OR LOWER(name) LIKE '%sweet%');
    END IF;

    IF v_cat_snack IS NOT NULL THEN
        UPDATE public.thali_option_groups SET target_category_id = v_cat_snack WHERE target_category_id IS NULL AND (target_category_type = 'snack' OR LOWER(name) LIKE '%snack%' OR LOWER(name) LIKE '%accompaniment%');
    END IF;
END $$;
