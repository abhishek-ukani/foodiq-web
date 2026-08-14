-- ====================================================================
-- FoodIQ (Thakar Rasoi) - Complete Seed Data Script with Dynamic Option Groups
-- Run this script in your Supabase SQL Editor (Database -> SQL Editor)
-- ====================================================================

DO $$
DECLARE
    v_branch_id UUID;
    v_cat_thali_id UUID;
    v_cat_addons_id UUID;
    
    -- Thali IDs
    v_reg_thali_id UUID;
    v_classic_thali_id UUID;
    v_premium_thali_id UUID;
    v_deluxe_thali_id UUID;

    -- Group IDs
    v_grp_id UUID;
BEGIN
    -- 1. Ensure Default Branch exists
    INSERT INTO public.branches (name, slug, city, state, is_active, is_default)
    VALUES ('Thakar Rasoi Main Kitchen', 'main-kitchen', 'Surat', 'Gujarat', true, true)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_branch_id;

    IF v_branch_id IS NULL THEN
        SELECT id INTO v_branch_id FROM public.branches WHERE slug = 'main-kitchen';
    END IF;

    -- 2. Upsert Categories
    INSERT INTO public.categories (name, slug, description, icon, display_order, is_active)
    VALUES 
        ('Thalis', 'thalis', 'Delicious & Authentic Fixed Gujarati Thalis', 'Utensils', 1, true),
        ('Add-ons & Extras', 'add-ons', 'Extra Roti, Sabji, Chhash, Snacks & Sides', 'PlusCircle', 2, true)
    ON CONFLICT (slug) DO UPDATE SET 
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        icon = EXCLUDED.icon,
        display_order = EXCLUDED.display_order;

    SELECT id INTO v_cat_thali_id FROM public.categories WHERE slug = 'thalis';
    SELECT id INTO v_cat_addons_id FROM public.categories WHERE slug = 'add-ons';

    -- 3. Upsert 4 Fixed Thalis
    -- REGULAR THALI (₹80)
    INSERT INTO public.food_items (
        branch_id, category_id, kind, name, slug, description, 
        ingredients, food_type, price, unit_label, serves, prep_minutes, is_available, is_featured, display_order
    ) VALUES (
        v_branch_id, v_cat_thali_id, 'thali', 'Regular Thali', 'regular-thali', 
        'Includes 5 Roti / 2 Bhakhri, 1 Sabji, Salad/Gud/Aachar, Fryums/Mamra no Chewdo',
        ARRAY['5 Roti / 2 Bhakhri', '1 Sabji', 'Salad / Gud / Aachar', 'Fryums / Mamra no Chewdo'],
        'veg', 80.00, '1 Thali', 1, 15, true, true, 1
    ) ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, description = EXCLUDED.description RETURNING id INTO v_reg_thali_id;
    IF v_reg_thali_id IS NULL THEN SELECT id INTO v_reg_thali_id FROM public.food_items WHERE slug = 'regular-thali'; END IF;

    -- CLASSIC THALI (₹110)
    INSERT INTO public.food_items (
        branch_id, category_id, kind, name, slug, description, 
        ingredients, food_type, price, unit_label, serves, prep_minutes, is_available, is_featured, display_order
    ) VALUES (
        v_branch_id, v_cat_thali_id, 'thali', 'Classic Thali', 'classic-thali', 
        'Includes 5 Roti / 2 Bhakhri, 1 Sabji, Dal-Bhat, Salad/Gud/Aachar, Fryums/Mamra no Chewdo/Papad',
        ARRAY['5 Roti / 2 Bhakhri', '1 Sabji', 'Dal-Bhat', 'Salad / Gud / Aachar', 'Fryums / Mamra no Chewdo / Papad'],
        'veg', 110.00, '1 Thali', 1, 15, true, true, 2
    ) ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, description = EXCLUDED.description RETURNING id INTO v_classic_thali_id;
    IF v_classic_thali_id IS NULL THEN SELECT id INTO v_classic_thali_id FROM public.food_items WHERE slug = 'classic-thali'; END IF;

    -- PREMIUM THALI (₹110)
    INSERT INTO public.food_items (
        branch_id, category_id, kind, name, slug, description, 
        ingredients, food_type, price, unit_label, serves, prep_minutes, is_available, is_featured, display_order
    ) VALUES (
        v_branch_id, v_cat_thali_id, 'thali', 'Premium Thali', 'premium-thali', 
        'Includes 5 Roti / 2 Bhakhri, 2 Sabji, Salad/Gud/Aachar, Fryums/Mamra no Chewdo/Papad',
        ARRAY['5 Roti / 2 Bhakhri', '2 Sabji', 'Salad / Gud / Aachar', 'Fryums / Mamra no Chewdo / Papad'],
        'veg', 110.00, '1 Thali', 1, 15, true, true, 3
    ) ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, description = EXCLUDED.description RETURNING id INTO v_premium_thali_id;
    IF v_premium_thali_id IS NULL THEN SELECT id INTO v_premium_thali_id FROM public.food_items WHERE slug = 'premium-thali'; END IF;

    -- DELUXE THALI (₹150)
    INSERT INTO public.food_items (
        branch_id, category_id, kind, name, slug, description, 
        ingredients, food_type, price, unit_label, serves, prep_minutes, is_available, is_featured, display_order
    ) VALUES (
        v_branch_id, v_cat_thali_id, 'thali', 'Deluxe Thali', 'deluxe-thali', 
        'Includes 5 Roti / 2 Bhakhri, 2 Sabji, Dal-Bhat, Salad/Gud/Aachar, Fryums/Mamra no Chewdo/Papad, Chhash',
        ARRAY['5 Roti / 2 Bhakhri', '2 Sabji', 'Dal-Bhat', 'Salad / Gud / Aachar', 'Fryums / Mamra no Chewdo / Papad', 'Chhash'],
        'veg', 150.00, '1 Thali', 1, 20, true, true, 4
    ) ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, description = EXCLUDED.description RETURNING id INTO v_deluxe_thali_id;
    IF v_deluxe_thali_id IS NULL THEN SELECT id INTO v_deluxe_thali_id FROM public.food_items WHERE slug = 'deluxe-thali'; END IF;


    -- 4. Upsert Standalone Add-on Items
    INSERT INTO public.food_items (branch_id, category_id, kind, name, slug, description, food_type, price, unit_label, is_available, display_order)
    VALUES 
        (v_branch_id, v_cat_addons_id, 'single', 'Extra Roti (1 pc)', 'extra-roti', 'Freshly baked wheat roti', 'veg', 10.00, '1 Pc', true, 1),
        (v_branch_id, v_cat_addons_id, 'single', 'Extra Bhakhri (1 pc)', 'extra-bhakhri', 'Crispy traditional Gujarati bhakhri', 'veg', 15.00, '1 Pc', true, 2),
        (v_branch_id, v_cat_addons_id, 'single', 'Extra Sabji (Portion)', 'extra-sabji', 'Additional portion of daily special sabji', 'veg', 40.00, '1 Portion', true, 3),
        (v_branch_id, v_cat_addons_id, 'single', 'Chhash (Buttermilk)', 'chhash', 'Chilled spiced buttermilk', 'veg', 20.00, '200ml Glass', true, 4),
        (v_branch_id, v_cat_addons_id, 'single', 'Papad (1 pc)', 'papad', 'Crispy roasted papad', 'veg', 10.00, '1 Pc', true, 5),
        (v_branch_id, v_cat_addons_id, 'single', 'Aachar (Pickle)', 'aachar', 'Home-style Gujarati pickle', 'veg', 10.00, '1 Portion', true, 6),
        (v_branch_id, v_cat_addons_id, 'single', 'Fresh Green Salad', 'fresh-salad', 'Fresh cucumber, tomato, and onion salad', 'veg', 15.00, '1 Bowl', true, 7),
        (v_branch_id, v_cat_addons_id, 'single', 'Gud (Jaggery)', 'gud', 'Pure organic jaggery', 'veg', 10.00, '1 Piece', true, 8),
        (v_branch_id, v_cat_addons_id, 'single', 'Fryums', 'fryums', 'Crunchy fried snacks', 'veg', 15.00, '1 Portion', true, 9),
        (v_branch_id, v_cat_addons_id, 'single', 'Mamra no Chewdo', 'mamra-no-chewdo', 'Light savory puffed rice chevdo', 'veg', 15.00, '1 Bowl', true, 10)
    ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price;


    -- 5. POPULATE DYNAMIC OPTION GROUPS & ITEMS FOR ALL 4 THALIS
    -- Clean previous option groups to re-seed cleanly
    DELETE FROM public.thali_option_groups WHERE food_item_id IN (v_reg_thali_id, v_classic_thali_id, v_premium_thali_id, v_deluxe_thali_id);

    -- --- REGULAR THALI OPTION GROUPS ---
    -- Group 1: Breads Choice (Pick 1)
    INSERT INTO public.thali_option_groups (food_item_id, name, group_type, min_select, max_select, is_required, display_order)
    VALUES (v_reg_thali_id, 'Select Bread', 'static_choice', 1, 1, true, 1) RETURNING id INTO v_grp_id;
    INSERT INTO public.thali_option_items (group_id, label, price_delta, is_default, display_order) VALUES
        (v_grp_id, '5 Roti', 0.00, true, 1),
        (v_grp_id, '2 Bhakhri', 0.00, false, 2);

    -- Group 2: Daily Sabji Choice (Pick 1 from Daily Menu)
    INSERT INTO public.thali_option_groups (food_item_id, name, group_type, min_select, max_select, is_required, display_order)
    VALUES (v_reg_thali_id, 'Select Sabji', 'daily_menu_choice', 1, 1, true, 2);

    -- Group 3: Accompaniments (Pick 1)
    INSERT INTO public.thali_option_groups (food_item_id, name, group_type, min_select, max_select, is_required, display_order)
    VALUES (v_reg_thali_id, 'Select Accompaniment', 'static_choice', 1, 1, true, 3) RETURNING id INTO v_grp_id;
    INSERT INTO public.thali_option_items (group_id, label, price_delta, is_default, display_order) VALUES
        (v_grp_id, 'Salad', 0.00, true, 1),
        (v_grp_id, 'Gud (Jaggery)', 0.00, false, 2),
        (v_grp_id, 'Aachar (Pickle)', 0.00, false, 3);

    -- Group 4: Crunch & Snacks (Pick 1)
    INSERT INTO public.thali_option_groups (food_item_id, name, group_type, min_select, max_select, is_required, display_order)
    VALUES (v_reg_thali_id, 'Select Snack', 'static_choice', 1, 1, true, 4) RETURNING id INTO v_grp_id;
    INSERT INTO public.thali_option_items (group_id, label, price_delta, is_default, display_order) VALUES
        (v_grp_id, 'Fryums', 0.00, true, 1),
        (v_grp_id, 'Mamra no Chewdo', 0.00, false, 2);


    -- --- CLASSIC THALI OPTION GROUPS ---
    INSERT INTO public.thali_option_groups (food_item_id, name, group_type, min_select, max_select, is_required, display_order)
    VALUES (v_classic_thali_id, 'Select Bread', 'static_choice', 1, 1, true, 1) RETURNING id INTO v_grp_id;
    INSERT INTO public.thali_option_items (group_id, label, price_delta, is_default, display_order) VALUES
        (v_grp_id, '5 Roti', 0.00, true, 1),
        (v_grp_id, '2 Bhakhri', 0.00, false, 2);

    INSERT INTO public.thali_option_groups (food_item_id, name, group_type, min_select, max_select, is_required, display_order)
    VALUES (v_classic_thali_id, 'Select Sabji', 'daily_menu_choice', 1, 1, true, 2);

    INSERT INTO public.thali_option_groups (food_item_id, name, group_type, min_select, max_select, is_required, display_order)
    VALUES (v_classic_thali_id, 'Select Accompaniment', 'static_choice', 1, 1, true, 3) RETURNING id INTO v_grp_id;
    INSERT INTO public.thali_option_items (group_id, label, price_delta, is_default, display_order) VALUES
        (v_grp_id, 'Salad', 0.00, true, 1),
        (v_grp_id, 'Gud (Jaggery)', 0.00, false, 2),
        (v_grp_id, 'Aachar (Pickle)', 0.00, false, 3);

    INSERT INTO public.thali_option_groups (food_item_id, name, group_type, min_select, max_select, is_required, display_order)
    VALUES (v_classic_thali_id, 'Select Snack', 'static_choice', 1, 1, true, 4) RETURNING id INTO v_grp_id;
    INSERT INTO public.thali_option_items (group_id, label, price_delta, is_default, display_order) VALUES
        (v_grp_id, 'Fryums', 0.00, true, 1),
        (v_grp_id, 'Mamra no Chewdo', 0.00, false, 2),
        (v_grp_id, 'Papad', 0.00, false, 3);


    -- --- PREMIUM THALI OPTION GROUPS (Pick 2 Sabjis) ---
    INSERT INTO public.thali_option_groups (food_item_id, name, group_type, min_select, max_select, is_required, display_order)
    VALUES (v_premium_thali_id, 'Select Bread', 'static_choice', 1, 1, true, 1) RETURNING id INTO v_grp_id;
    INSERT INTO public.thali_option_items (group_id, label, price_delta, is_default, display_order) VALUES
        (v_grp_id, '5 Roti', 0.00, true, 1),
        (v_grp_id, '2 Bhakhri', 0.00, false, 2);

    -- Notice min_select = 2, max_select = 2 for 2 Sabjis!
    INSERT INTO public.thali_option_groups (food_item_id, name, group_type, min_select, max_select, is_required, display_order)
    VALUES (v_premium_thali_id, 'Select 2 Sabjis', 'daily_menu_choice', 2, 2, true, 2);

    INSERT INTO public.thali_option_groups (food_item_id, name, group_type, min_select, max_select, is_required, display_order)
    VALUES (v_premium_thali_id, 'Select Accompaniment', 'static_choice', 1, 1, true, 3) RETURNING id INTO v_grp_id;
    INSERT INTO public.thali_option_items (group_id, label, price_delta, is_default, display_order) VALUES
        (v_grp_id, 'Salad', 0.00, true, 1),
        (v_grp_id, 'Gud (Jaggery)', 0.00, false, 2),
        (v_grp_id, 'Aachar (Pickle)', 0.00, false, 3);

    INSERT INTO public.thali_option_groups (food_item_id, name, group_type, min_select, max_select, is_required, display_order)
    VALUES (v_premium_thali_id, 'Select Snack', 'static_choice', 1, 1, true, 4) RETURNING id INTO v_grp_id;
    INSERT INTO public.thali_option_items (group_id, label, price_delta, is_default, display_order) VALUES
        (v_grp_id, 'Fryums', 0.00, true, 1),
        (v_grp_id, 'Mamra no Chewdo', 0.00, false, 2),
        (v_grp_id, 'Papad', 0.00, false, 3);


    -- --- DELUXE THALI OPTION GROUPS (Pick 2 Sabjis + Chhash) ---
    INSERT INTO public.thali_option_groups (food_item_id, name, group_type, min_select, max_select, is_required, display_order)
    VALUES (v_deluxe_thali_id, 'Select Bread', 'static_choice', 1, 1, true, 1) RETURNING id INTO v_grp_id;
    INSERT INTO public.thali_option_items (group_id, label, price_delta, is_default, display_order) VALUES
        (v_grp_id, '5 Roti', 0.00, true, 1),
        (v_grp_id, '2 Bhakhri', 0.00, false, 2);

    INSERT INTO public.thali_option_groups (food_item_id, name, group_type, min_select, max_select, is_required, display_order)
    VALUES (v_deluxe_thali_id, 'Select 2 Sabjis', 'daily_menu_choice', 2, 2, true, 2);

    INSERT INTO public.thali_option_groups (food_item_id, name, group_type, min_select, max_select, is_required, display_order)
    VALUES (v_deluxe_thali_id, 'Select Accompaniment', 'static_choice', 1, 1, true, 3) RETURNING id INTO v_grp_id;
    INSERT INTO public.thali_option_items (group_id, label, price_delta, is_default, display_order) VALUES
        (v_grp_id, 'Salad', 0.00, true, 1),
        (v_grp_id, 'Gud (Jaggery)', 0.00, false, 2),
        (v_grp_id, 'Aachar (Pickle)', 0.00, false, 3);

    INSERT INTO public.thali_option_groups (food_item_id, name, group_type, min_select, max_select, is_required, display_order)
    VALUES (v_deluxe_thali_id, 'Select Snack', 'static_choice', 1, 1, true, 4) RETURNING id INTO v_grp_id;
    INSERT INTO public.thali_option_items (group_id, label, price_delta, is_default, display_order) VALUES
        (v_grp_id, 'Fryums', 0.00, true, 1),
        (v_grp_id, 'Mamra no Chewdo', 0.00, false, 2),
        (v_grp_id, 'Papad', 0.00, false, 3);


    -- 6. SAMPLE INACTIVE SUBSCRIPTION PLANS (Disabled for General Public)
    INSERT INTO public.subscription_plans (
        branch_id, name, slug, thali_food_item_id, duration_days, total_meals, meal_type_allowed, price, discount_percentage, description, is_active
    ) VALUES 
        (v_branch_id, 'Monthly Regular Thali Plan (Lunch)', 'monthly-regular-lunch', v_reg_thali_id, 30, 30, 'lunch_only', 2160.00, 10.00, '30 Lunch meals of Regular Thali', false),
        (v_branch_id, 'Monthly Deluxe Thali Saver (Both)', 'monthly-deluxe-both', v_deluxe_thali_id, 30, 60, 'both', 7650.00, 15.00, '60 Meals (Lunch & Dinner) of Deluxe Thali', false)
    ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price;

END $$;
