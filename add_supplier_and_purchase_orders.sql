-- ====================================================================
-- FoodIQ — Migration 2: Suppliers & Purchase Orders
-- Run AFTER add_variants_and_pricing.sql
-- Run in Supabase SQL Editor (Database -> SQL Editor)
-- ====================================================================

-- ── 1. New Enums ──────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'supplier_status') THEN
    CREATE TYPE public.supplier_status AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'po_status') THEN
    CREATE TYPE public.po_status AS ENUM (
      'DRAFT', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'
    );
  END IF;
END$$;

-- ── 2. Suppliers ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.suppliers (
  id          UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id   UUID              REFERENCES public.branches(id) ON DELETE CASCADE,
  name        TEXT              NOT NULL,
  email       TEXT              UNIQUE,
  phone       TEXT,
  address     TEXT,
  gst_number  TEXT              UNIQUE,       -- optional for Indian GST compliance
  status      public.supplier_status DEFAULT 'ACTIVE' NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ       DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ       DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_suppliers_branch_id   ON public.suppliers(branch_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_status       ON public.suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_name         ON public.suppliers(name);

DROP TRIGGER IF EXISTS trg_suppliers_updated_at ON public.suppliers;
CREATE TRIGGER trg_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 3. Purchase Orders ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id                     UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id              UUID           REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  supplier_id            UUID           REFERENCES public.suppliers(id) ON DELETE RESTRICT NOT NULL,
  po_number              TEXT           UNIQUE NOT NULL,
  status                 public.po_status DEFAULT 'DRAFT' NOT NULL,
  ordered_at             TIMESTAMPTZ,
  expected_delivery_date DATE,
  received_at            TIMESTAMPTZ,
  notes                  TEXT,
  created_by             UUID           REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at             TIMESTAMPTZ    DEFAULT now() NOT NULL,
  updated_at             TIMESTAMPTZ    DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id  ON public.purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_branch_id    ON public.purchase_orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status       ON public.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_at   ON public.purchase_orders(created_at DESC);

DROP TRIGGER IF EXISTS trg_purchase_orders_updated_at ON public.purchase_orders;
CREATE TRIGGER trg_purchase_orders_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 4. Purchase Order Items ───────────────────────────────────────────
--      variant_id  → for sweets/farsan variants (100g, 250g, etc.)
--      food_item_id → for plain items with no variant (raw ingredients, etc.)
--      At least one of the two FKs must be set.
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID        REFERENCES public.purchase_orders(id) ON DELETE CASCADE NOT NULL,
  variant_id        UUID        REFERENCES public.food_item_variants(id) ON DELETE RESTRICT,
  food_item_id      UUID        REFERENCES public.food_items(id) ON DELETE RESTRICT,
  item_name         TEXT        NOT NULL,     -- snapshot of name at time of PO
  ordered_quantity  INT         NOT NULL,
  received_quantity INT         DEFAULT 0 NOT NULL,
  unit_cost         NUMERIC     NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Prevent duplicate variant lines on the same PO
  CONSTRAINT unique_po_variant    UNIQUE (purchase_order_id, variant_id),
  -- received cannot exceed ordered
  CONSTRAINT qty_check            CHECK  (received_quantity <= ordered_quantity),
  -- at least one of variant_id or food_item_id must be set
  CONSTRAINT item_ref_required    CHECK  (variant_id IS NOT NULL OR food_item_id IS NOT NULL),
  CONSTRAINT positive_ordered_qty CHECK  (ordered_quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_po_items_purchase_order_id ON public.purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_po_items_variant_id        ON public.purchase_order_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_po_items_food_item_id      ON public.purchase_order_items(food_item_id);

-- ── 5. Row Level Security (Admin-only) ───────────────────────────────
ALTER TABLE public.suppliers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access to suppliers"            ON public.suppliers;
DROP POLICY IF EXISTS "Admins full access to purchase_orders"      ON public.purchase_orders;
DROP POLICY IF EXISTS "Admins full access to purchase_order_items" ON public.purchase_order_items;

CREATE POLICY "Admins full access to suppliers"
  ON public.suppliers FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full access to purchase_orders"
  ON public.purchase_orders FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full access to purchase_order_items"
  ON public.purchase_order_items FOR ALL USING (public.is_admin());

-- ── 6. Helper: auto-generate PO number ───────────────────────────────
--      Format: PO-YYYYMMDD-XXXX (e.g. PO-20260827-0042)
CREATE OR REPLACE FUNCTION public.generate_po_number()
RETURNS TEXT AS $$
DECLARE
  v_date  TEXT := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  v_count INT;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count
  FROM public.purchase_orders
  WHERE created_at::DATE = CURRENT_DATE;

  RETURN 'PO-' || v_date || '-' || LPAD(v_count::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
