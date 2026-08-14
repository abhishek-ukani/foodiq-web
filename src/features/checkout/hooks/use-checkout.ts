import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import {
  fetchActiveDeliverySlots,
  fetchActiveUpiQr,
  placeOrder,
} from '@/features/checkout/services/checkout-service'

export function useActiveDeliverySlots() {
  return useQuery({ queryKey: QUERY_KEYS.deliverySlots, queryFn: fetchActiveDeliverySlots })
}

export function useActiveUpiQr() {
  return useQuery({ queryKey: QUERY_KEYS.upiQr, queryFn: fetchActiveUpiQr })
}

export function usePlaceOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: placeOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders() })
    },
  })
}
