-- ====================================================================
-- FoodIQ - Add Swaminarayan, Vaishnav & Jain available options to food_items
-- Run this script in your Supabase SQL Editor (Database -> SQL Editor)
-- ====================================================================

ALTER TABLE public.food_items
  ADD COLUMN IF NOT EXISTS is_swaminarayan_available BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_vaishnav_available BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_jain_available BOOLEAN NOT NULL DEFAULT false;
