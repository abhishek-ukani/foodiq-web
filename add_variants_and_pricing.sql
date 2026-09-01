-- ====================================================================
-- FoodIQ — Migration 1: Product Variants & Three-Tier Pricing
-- Run in Supabase SQL Editor (Database -> SQL Editor)
-- ====================================================================

-- ── 1. New Enums ─────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'unit_type') THEN
    CREATE TYPE public.unit_type AS ENUM ('gm', 'kg', 'pc', 'ml', 'ltr');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stock_status') THEN
    CREATE TYPE public.stock_status AS ENUM ('IN_STOCK', 'FEW_LEFT', 'OUT_OF_STOCK');
  END IF;
END$$;

-- ── 2. Rename offer_price → compare_price on food_items ──────────────
--      (compare_price = MRP / crossed-out price shown to customer)
--      Wrapped in a guard so it is safe to run more than once.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'food_items'
      AND column_name  = 'offer_price'
  ) THEN
    ALTER TABLE public.food_items RENAME COLUMN offer_price TO compare_price;
  END IF;
END$$;

-- ── 3. Add cost_price (internal only, never shown to customer) ────────
ALTER TABLE public.food_items
  ADD COLUMN IF NOT EXISTS cost_price NUMERIC;

-- ── 4. Update price_history table to match the rename ─────────────────
DO $$
BEGIN
  -- old_offer_price → old_compare_price
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'price_history'
      AND column_name  = 'old_offer_price'
  ) THEN
    ALTER TABLE public.price_history RENAME COLUMN old_offer_price TO old_compare_price;
  END IF;

  -- new_offer_price → new_compare_price
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'price_history'
      AND column_name  = 'new_offer_price'
  ) THEN
    ALTER TABLE public.price_history RENAME COLUMN new_offer_price TO new_compare_price;
  END IF;
END$$;

-- ── 5. food_item_variants table ───────────────────────────────────────
--      Allows sweets/farsan to have weight or piece variants,
--      each with their own price, compare_price, and cost_price.
CREATE TABLE IF NOT EXISTS public.food_item_variants (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  food_item_id  UUID        REFERENCES public.food_items(id) ON DELETE CASCADE NOT NULL,
  sku           TEXT        UNIQUE NOT NULL,
  label         TEXT        NOT NULL,         -- "100g", "250g", "Box of 12"
  unit_type     public.unit_type NOT NULL,    -- gm, kg, pc, ml, ltr
  quantity      SMALLINT    NOT NULL,         -- numeric value: 100, 250, 1, 12
  price         NUMERIC     NOT NULL,         -- selling price (customer pays this)
  compare_price NUMERIC,                      -- MRP / was-price (must be >= price)
  cost_price    NUMERIC,                      -- internal cost (profit calc, never public)
  stock_status  public.stock_status DEFAULT 'IN_STOCK' NOT NULL,
  stock_quantity INT         DEFAULT 0 NOT NULL,
  is_active     BOOLEAN     DEFAULT true NOT NULL,
  display_order INT         DEFAULT 0 NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT compare_price_gte_price
    CHECK (compare_price IS NULL OR compare_price >= price),
  CONSTRAINT positive_quantity
    CHECK (quantity > 0),
  CONSTRAINT positive_price
    CHECK (price >= 0)
);

-- Index for fast lookup of variants by food item
CREATE INDEX IF NOT EXISTS idx_food_item_variants_food_item_id
  ON public.food_item_variants(food_item_id);

CREATE INDEX IF NOT EXISTS idx_food_item_variants_is_active
  ON public.food_item_variants(food_item_id, is_active);

-- ── 6. Auto-update updated_at on food_item_variants ──────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_food_item_variants_updated_at ON public.food_item_variants;
CREATE TRIGGER trg_food_item_variants_updated_at
  BEFORE UPDATE ON public.food_item_variants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 7. Row Level Security ─────────────────────────────────────────────
ALTER TABLE public.food_item_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public variants read" ON public.food_item_variants;
CREATE POLICY "Public variants read"
  ON public.food_item_variants FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins full access to variants" ON public.food_item_variants;
CREATE POLICY "Admins full access to variants"
  ON public.food_item_variants FOR ALL
  USING (public.is_admin());
