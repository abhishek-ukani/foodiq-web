-- Migration: Create thali_components table
-- This table provides a single global list of Thali sub-items (Breads, Accompaniments, Sweets, Snacks).
-- A single is_active toggle per item propagates to ALL Thalis automatically.

CREATE TABLE IF NOT EXISTS thali_components (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_item_id    UUID NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
  category_type   TEXT NOT NULL CHECK (category_type IN ('bread', 'sabji', 'sweet', 'snack', 'accompaniment', 'beverage')),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  display_order   INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (food_item_id)
);

-- Auto-update updated_at on row change (inline function, no external dependency)
CREATE OR REPLACE FUNCTION thali_components_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER thali_components_updated_at
  BEFORE UPDATE ON thali_components
  FOR EACH ROW EXECUTE FUNCTION thali_components_set_updated_at();

-- Row Level Security
ALTER TABLE public.thali_components ENABLE ROW LEVEL SECURITY;

-- Public can read active components (for the web Thali customizer drawer)
DROP POLICY IF EXISTS "Public thali_components read" ON public.thali_components;
CREATE POLICY "Public thali_components read"
  ON public.thali_components FOR SELECT
  USING (is_active = true OR public.is_admin());

-- Admins have full access (insert, update, delete)
DROP POLICY IF EXISTS "Admins full access to thali_components" ON public.thali_components;
CREATE POLICY "Admins full access to thali_components"
  ON public.thali_components FOR ALL
  USING (public.is_admin());

COMMENT ON TABLE thali_components IS
  'Global registry of Thali sub-items (Rotli, Bhakri, Achar, Gud, Papad, Sweets, etc.). '
  'One is_active toggle per item reflects across ALL Thali customizer groups of the matching category_type.';

COMMENT ON COLUMN thali_components.category_type IS
  'Maps to a Thali option group''s target_category_type. Values: bread, sabji, sweet, snack, accompaniment, beverage.';

COMMENT ON COLUMN thali_components.is_active IS
  'Master toggle — when false, item shows as Out of Stock in ALL Thali customizer drawers.';
