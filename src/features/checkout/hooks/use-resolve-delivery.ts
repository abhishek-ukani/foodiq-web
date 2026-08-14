import { useMutation } from '@tanstack/react-query'
import {
  resolveDelivery,
  DeliveryResolveError,
  type DeliveryRequest,
  type DeliveryResult,
} from '@/features/checkout/services/resolve-delivery-service'

export type { DeliveryRequest, DeliveryResult, DeliveryResolveError }

/**
 * TanStack Query mutation hook for calling the `resolve-delivery` Edge Function.
 *
 * Usage:
 * ```tsx
 * const resolveDeliveryMutation = useResolveDelivery()
 *
 * // Trigger on address confirmation:
 * resolveDeliveryMutation.mutate({ pincode: address.pincode, locality: address.city })
 *
 * // Check result:
 * resolveDeliveryMutation.data?.deliverable
 * resolveDeliveryMutation.data?.fee
 * resolveDeliveryMutation.isError // true when geocoding/infrastructure failed
 * ```
 *
 * Note: `isError` is true only for infrastructure failures (HTTP 502, network).
 * A normal "not deliverable" response (BLOCKED / OUT_OF_RANGE) resolves successfully
 * with `data.deliverable === false` — it does NOT set `isError`.
 */
export function useResolveDelivery() {
  return useMutation<DeliveryResult, DeliveryResolveError, DeliveryRequest>({
    mutationFn: resolveDelivery,
  })
}
