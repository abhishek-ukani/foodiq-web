-- ====================================================================
-- FoodIQ — Update Order Delivery Status & Assign Agent RPC
-- Allows admins/delivery partners to update order status and log history.
-- ====================================================================

CREATE OR REPLACE FUNCTION public.update_order_delivery_status(
  p_order_id      UUID,
  p_new_status    public.order_status,
  p_assigned_to   UUID DEFAULT NULL,
  p_note          TEXT DEFAULT NULL
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id     UUID;
  v_old_order     public.orders%ROWTYPE;
  v_updated_order public.orders%ROWTYPE;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_old_order
  FROM public.orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  UPDATE public.orders
  SET
    status = p_new_status,
    assigned_to = COALESCE(p_assigned_to, assigned_to),
    accepted_at = CASE WHEN p_new_status = 'accepted' AND accepted_at IS NULL THEN now() ELSE accepted_at END,
    prepared_at = CASE WHEN p_new_status = 'ready' AND prepared_at IS NULL THEN now() ELSE prepared_at END,
    dispatched_at = CASE WHEN p_new_status = 'out_for_delivery' AND dispatched_at IS NULL THEN now() ELSE dispatched_at END,
    delivered_at = CASE WHEN p_new_status = 'delivered' AND delivered_at IS NULL THEN now() ELSE delivered_at END,
    cancelled_at = CASE WHEN p_new_status = 'cancelled' AND cancelled_at IS NULL THEN now() ELSE cancelled_at END,
    updated_at = now()
  WHERE id = p_order_id
  RETURNING * INTO v_updated_order;

  -- Record in history
  INSERT INTO public.order_status_history (order_id, from_status, to_status, changed_by, note)
  VALUES (p_order_id, v_old_order.status, p_new_status, v_caller_id, p_note);

  RETURN v_updated_order;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_order_delivery_status(UUID, public.order_status, UUID, TEXT) TO authenticated;
