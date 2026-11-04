import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { placeOrder } from '@/features/checkout/services/checkout-service'

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
