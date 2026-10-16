-- ====================================================================
-- Migration: 20260827_03_update_delivery_and_drop_upi_qr.sql
-- Description: Enhances delivery tables and drops deprecated upi_qr_codes
-- ====================================================================

-- 1. DROP DEPRECATED UPI_QR_CODES TABLE
-- Payments will be collected manually; orders.payment_status and orders.payment_method remain intact.
DROP TABLE IF EXISTS public.upi_qr_codes CASCADE;

-- 2. DELIVERY PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_delivery_slots_branch_meal 
  ON public.delivery_slots(branch_id, meal_type, is_active);

CREATE INDEX IF NOT EXISTS idx_delivery_zones_pincode 
  ON public.delivery_zones(pincode, is_active);

CREATE INDEX IF NOT EXISTS idx_delivery_fee_rules_distance 
  ON public.delivery_fee_rules(min_distance_km, max_distance_km);

-- 3. AUTOMATIC UPDATED_AT TRIGGER FOR DELIVERY SLOTS
DROP TRIGGER IF EXISTS set_delivery_slots_updated_at ON public.delivery_slots;
CREATE TRIGGER set_delivery_slots_updated_at
  BEFORE UPDATE ON public.delivery_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. DEPRECATION COMMENT ON LEGACY DELIVERY AREAS
COMMENT ON TABLE public.delivery_areas IS 'DEPRECATED: Use delivery_zones and delivery_fee_rules for delivery fee resolution.';
