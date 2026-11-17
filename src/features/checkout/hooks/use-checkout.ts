import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { placeOrder } from '@/features/checkout/services/checkout-service'
import { broadcastOrderCreated } from '@/lib/orders-realtime'

export function usePlaceOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: placeOrder,
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders() })
      if (order?.id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order(order.id) })
        broadcastOrderCreated({
          id: order.id,
          order_number: order.order_number,
          total_amount: order.total_amount,
          user_id: order.user_id,
        })
      }
    },
  })
}
