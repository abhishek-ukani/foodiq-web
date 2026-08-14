-- ====================================================================
-- FoodIQ - Add cutoff_time to daily_menus table
-- Allows overriding order cutoff times directly per daily menu row
-- Run this script in your Supabase SQL Editor (Database -> SQL Editor)
-- ====================================================================

ALTER TABLE public.daily_menus
  ADD COLUMN IF NOT EXISTS cutoff_time TIME NULL;
