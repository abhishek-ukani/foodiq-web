-- ====================================================================
-- FoodIQ — Migration: Delivery Zones & Distance-Based Fee Rules
-- Run in Supabase SQL Editor (Database → SQL Editor)
-- ====================================================================

-- ---------------------------------------------------------------------------
-- TABLE: delivery_zones
-- Pre-classified localities. Consulted FIRST by the resolve-delivery function.
-- If a match is found here, geocoding / distance calculation is skipped.
-- zone_type:
--   FREE    — no delivery charge regardless of order amount
--   PAID    — flat fixed_fee applies
--   BLOCKED — not deliverable; order cannot proceed
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.delivery_zones (
  id          SERIAL PRIMARY KEY,
  name        TEXT    NOT NULL,                        -- locality / area name, e.g. "Bopal"
  pincode     TEXT,                                    -- optional — used for exact match
  zone_type   TEXT    NOT NULL
                CHECK (zone_type IN ('FREE', 'PAID', 'BLOCKED')),
  fixed_fee   NUMERIC NOT NULL DEFAULT 0,              -- only used when zone_type = 'PAID'
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.delivery_zones IS
  'Pre-classified delivery localities for Kathiyawadi Kitchen. '
  'The resolve-delivery Edge Function checks this table first (by pincode exact match '
  'or locality name ilike). Only if no match is found does it fall through to geocoding '
  'and the delivery_fee_rules distance tiers.';

COMMENT ON COLUMN public.delivery_zones.fixed_fee IS
  'Flat delivery fee in INR. Set to 0 when zone_type = FREE. Ignored when zone_type = BLOCKED.';

-- ---------------------------------------------------------------------------
-- TABLE: delivery_fee_rules
-- Distance-based fee tiers used as fallback when no zone match exists.
-- Ranges must be contiguous with no gaps or overlaps:
--   e.g. 0–1.5, 1.5–4, 4–6 km.
-- NOTE: contiguity is NOT enforced by a DB constraint (too complex); it is a
--   data-level invariant. Whoever maintains this table must ensure that every
--   new row's min_distance_km equals the previous row's max_distance_km.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.delivery_fee_rules (
  id                SERIAL PRIMARY KEY,
  min_distance_km   NUMERIC NOT NULL,
  max_distance_km   NUMERIC NOT NULL,
  fee               NUMERIC NOT NULL,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT delivery_fee_rules_range_check CHECK (min_distance_km < max_distance_km)
);

COMMENT ON TABLE public.delivery_fee_rules IS
  'Distance-based delivery fee tiers used by the resolve-delivery Edge Function when '
  'no delivery_zones match exists. IMPORTANT: ranges must be contiguous — the '
  'max_distance_km of one row must equal the min_distance_km of the next. '
  'There is no DB constraint enforcing this; maintain it manually.';

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Public read (SELECT) for anon + authenticated.
-- No INSERT / UPDATE / DELETE from client roles — only service role (Edge Functions)
-- or an admin dashboard using the service role key may modify these tables.
-- ---------------------------------------------------------------------------
ALTER TABLE public.delivery_zones     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_fee_rules ENABLE ROW LEVEL SECURITY;

-- Public read policies
DROP POLICY IF EXISTS "Public read delivery_zones" ON public.delivery_zones;
DROP POLICY IF EXISTS "Admins full access to delivery_zones" ON public.delivery_zones;

CREATE POLICY "Public read delivery_zones"
  ON public.delivery_zones
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins full access to delivery_zones"
  ON public.delivery_zones
  FOR ALL
  TO authenticated
  USING (public.is_admin() OR auth.role() = 'authenticated')
  WITH CHECK (public.is_admin() OR auth.role() = 'authenticated');

-- Public read & admin write policies for delivery_fee_rules
DROP POLICY IF EXISTS "Public read delivery_fee_rules" ON public.delivery_fee_rules;
DROP POLICY IF EXISTS "Admins full access to delivery_fee_rules" ON public.delivery_fee_rules;

CREATE POLICY "Public read delivery_fee_rules"
  ON public.delivery_fee_rules
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins full access to delivery_fee_rules"
  ON public.delivery_fee_rules
  FOR ALL
  TO authenticated
  USING (public.is_admin() OR auth.role() = 'authenticated')
  WITH CHECK (public.is_admin() OR auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- SEED: delivery_fee_rules
-- Placeholder tiers — adjust real values later via Supabase table editor.
--   0 – 1.5 km  → ₹0   (free, very close)
--   1.5 – 4 km  → ₹25
--   4 – 6 km    → ₹40
-- Anything beyond 6 km → OUT_OF_RANGE (no matching rule = not deliverable)
-- ---------------------------------------------------------------------------
INSERT INTO public.delivery_fee_rules (min_distance_km, max_distance_km, fee)
VALUES
  (0,   1.5,  0),
  (1.5, 4,   25),
  (4,   6,   40)
ON CONFLICT DO NOTHING;
