-- ====================================================================
-- FoodIQ — Migration 4: Review / Rating Variant Linkage
-- Run AFTER add_variants_and_pricing.sql
-- Run in Supabase SQL Editor (Database -> SQL Editor)
-- ====================================================================

-- ── 1. Add variant_id to reviews ─────────────────────────────────────
--      A review can now optionally target a specific variant
--      (e.g. "Motichur Ladoo 250g – 5 stars").
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS variant_id UUID
    REFERENCES public.food_item_variants(id) ON DELETE SET NULL;

-- ── 2. Add helpful_count ──────────────────────────────────────────────
--      Tracks how many users found a review helpful (for future UI).
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS helpful_count INT DEFAULT 0 NOT NULL;

-- ── 3. Index for variant-level review queries ─────────────────────────
CREATE INDEX IF NOT EXISTS idx_reviews_variant_id
  ON public.reviews(variant_id)
  WHERE variant_id IS NOT NULL;
