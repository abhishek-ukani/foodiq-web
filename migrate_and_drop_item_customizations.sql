-- ====================================================================
-- FoodIQ - Migrate and Drop Legacy item_customizations Table
-- Run this in your Supabase SQL Editor (Database -> SQL Editor)
--
-- What this script does:
-- 1. Checks if public.item_customizations exists.
-- 2. Migrates any existing customization rows into thali_option_groups
--    and thali_option_items (group_type = 'optional_addon') so no data is lost.
-- 3. Attempts to automatically link linked_food_item_id to the master food item.
-- 4. Safely drops public.item_customizations table.
-- ====================================================================

DO $$
DECLARE
  v_count INT := 0;
  r RECORD;
  r_item RECORD;
  v_group_id UUID;
  v_matched_food_item_id UUID;
BEGIN
  -- 1. Check if legacy table exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'item_customizations'
  ) THEN
    SELECT COUNT(*) INTO v_count FROM public.item_customizations;
    RAISE NOTICE 'Found % rows in item_customizations to evaluate for migration.', v_count;

    -- 2. Iterate through each food item that has customizations
    FOR r IN (
      SELECT DISTINCT food_item_id 
      FROM public.item_customizations
    ) LOOP
      -- Find or create an 'Extras & Add-ons' option group for this food item
      SELECT id INTO v_group_id
      FROM public.thali_option_groups
      WHERE food_item_id = r.food_item_id
        AND (group_type = 'optional_addon' OR LOWER(name) LIKE '%add-on%' OR LOWER(name) LIKE '%extra%')
      LIMIT 1;

      IF v_group_id IS NULL THEN
        INSERT INTO public.thali_option_groups (
          food_item_id,
          name,
          description,
          group_type,
          target_category_type,
          min_select,
          max_select,
          is_required,
          display_order,
          is_active
        ) VALUES (
          r.food_item_id,
          'Extras & Add-ons',
          'Optional additions to customize your meal',
          'optional_addon',
          'general',
          0,
          99,
          false,
          99,
          true
        ) RETURNING id INTO v_group_id;

        RAISE NOTICE 'Created optional_addon option group % for food_item %', v_group_id, r.food_item_id;
      END IF;

      -- Migrate all customization rows for this food item into thali_option_items
      FOR r_item IN (
        SELECT * FROM public.item_customizations 
        WHERE food_item_id = r.food_item_id
      ) LOOP
        -- Check if already exists in this group by label
        IF NOT EXISTS (
          SELECT 1 FROM public.thali_option_items 
          WHERE group_id = v_group_id AND LOWER(TRIM(label)) = LOWER(TRIM(r_item.name))
        ) THEN
          -- Attempt to match linked_food_item_id by dish name
          v_matched_food_item_id := NULL;
          SELECT id INTO v_matched_food_item_id 
          FROM public.food_items 
          WHERE LOWER(TRIM(name)) = LOWER(TRIM(r_item.name))
             OR (LENGTH(TRIM(r_item.name)) > 3 AND (
                  LOWER(TRIM(r_item.name)) LIKE '%' || LOWER(TRIM(name)) || '%' OR 
                  LOWER(TRIM(name)) LIKE '%' || LOWER(TRIM(r_item.name)) || '%'
                ))
          LIMIT 1;

          INSERT INTO public.thali_option_items (
            group_id,
            linked_food_item_id,
            label,
            price_delta,
            is_default,
            display_order,
            is_active
          ) VALUES (
            v_group_id,
            v_matched_food_item_id,
            r_item.name,
            r_item.price_delta,
            r_item.is_default,
            r_item.display_order,
            r_item.is_active
          );

          RAISE NOTICE 'Migrated customization "%" (+₹%) to option group % (linked food item: %)', 
            r_item.name, r_item.price_delta, v_group_id, v_matched_food_item_id;
        END IF;
      END LOOP;
    END LOOP;

    -- 3. Drop legacy item_customizations table
    DROP TABLE public.item_customizations CASCADE;
    RAISE NOTICE 'Successfully migrated data and dropped legacy public.item_customizations table.';
  ELSE
    RAISE NOTICE 'Table public.item_customizations does not exist. Nothing to migrate or drop.';
  END IF;
END $$;

