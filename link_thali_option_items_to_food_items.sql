-- ====================================================================
-- Link Static Thali Option Items to Food Items Catalog
-- Automatically resolves hardcoded option labels to food_items table
-- ====================================================================

DO $$
DECLARE
    v_salad_id UUID;
    v_gud_id UUID;
    v_aachar_id UUID;
    v_fryums_id UUID;
    v_chewdo_id UUID;
    v_papad_id UUID;
    v_roti_id UUID;
    v_bhakhri_id UUID;
BEGIN
    -- 1. Find Food Item IDs from Catalog
    SELECT id INTO v_salad_id FROM public.food_items WHERE slug = 'fresh-salad' OR LOWER(name) LIKE '%salad%' LIMIT 1;
    SELECT id INTO v_gud_id FROM public.food_items WHERE slug = 'gud' OR LOWER(name) LIKE '%gud%' LIMIT 1;
    SELECT id INTO v_aachar_id FROM public.food_items WHERE slug = 'aachar' OR LOWER(name) LIKE '%aachar%' OR LOWER(name) LIKE '%pickle%' LIMIT 1;
    SELECT id INTO v_fryums_id FROM public.food_items WHERE slug = 'fryums' OR LOWER(name) LIKE '%fryums%' LIMIT 1;
    SELECT id INTO v_chewdo_id FROM public.food_items WHERE slug = 'mamra-no-chewdo' OR LOWER(name) LIKE '%chewdo%' OR LOWER(name) LIKE '%mamra%' LIMIT 1;
    SELECT id INTO v_papad_id FROM public.food_items WHERE slug = 'papad' OR LOWER(name) LIKE '%papad%' LIMIT 1;
    SELECT id INTO v_roti_id FROM public.food_items WHERE slug = 'extra-roti' OR LOWER(name) LIKE '%roti%' LIMIT 1;
    SELECT id INTO v_bhakhri_id FROM public.food_items WHERE slug = 'extra-bhakhri' OR LOWER(name) LIKE '%bhakhri%' LIMIT 1;

    -- 2. Update thali_option_items with Catalog Foreign Keys
    IF v_salad_id IS NOT NULL THEN
        UPDATE public.thali_option_items SET linked_food_item_id = v_salad_id WHERE linked_food_item_id IS NULL AND LOWER(label) LIKE '%salad%';
    END IF;

    IF v_gud_id IS NOT NULL THEN
        UPDATE public.thali_option_items SET linked_food_item_id = v_gud_id WHERE linked_food_item_id IS NULL AND (LOWER(label) LIKE '%gud%' OR LOWER(label) LIKE '%jaggery%');
    END IF;

    IF v_aachar_id IS NOT NULL THEN
        UPDATE public.thali_option_items SET linked_food_item_id = v_aachar_id WHERE linked_food_item_id IS NULL AND (LOWER(label) LIKE '%aachar%' OR LOWER(label) LIKE '%pickle%');
    END IF;

    IF v_fryums_id IS NOT NULL THEN
        UPDATE public.thali_option_items SET linked_food_item_id = v_fryums_id WHERE linked_food_item_id IS NULL AND LOWER(label) LIKE '%fryums%';
    END IF;

    IF v_chewdo_id IS NOT NULL THEN
        UPDATE public.thali_option_items SET linked_food_item_id = v_chewdo_id WHERE linked_food_item_id IS NULL AND (LOWER(label) LIKE '%chewdo%' OR LOWER(label) LIKE '%mamra%');
    END IF;

    IF v_papad_id IS NOT NULL THEN
        UPDATE public.thali_option_items SET linked_food_item_id = v_papad_id WHERE linked_food_item_id IS NULL AND LOWER(label) LIKE '%papad%';
    END IF;

    IF v_roti_id IS NOT NULL THEN
        UPDATE public.thali_option_items SET linked_food_item_id = v_roti_id WHERE linked_food_item_id IS NULL AND LOWER(label) LIKE '%roti%';
    END IF;

    IF v_bhakhri_id IS NOT NULL THEN
        UPDATE public.thali_option_items SET linked_food_item_id = v_bhakhri_id WHERE linked_food_item_id IS NULL AND LOWER(label) LIKE '%bhakhri%';
    END IF;

END $$;
