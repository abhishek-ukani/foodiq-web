import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import {
  fetchQuickOrderContext,
  submitQuickOrder,
  type SubmitQuickOrderInput,
} from '../services/quick-order-service'
import { broadcastOrderCreated } from '@/lib/orders-realtime'
import type { MealType } from '@/types/database.types'

export function useQuickOrderContext(
  targetThaliId?: string | null,
  mealType: MealType = 'lunch',
  selectedAddressId?: string | null,
) {
  return useQuery({
    queryKey: ['quick-order-context', targetThaliId, mealType, selectedAddressId],
    queryFn: () => fetchQuickOrderContext(targetThaliId, mealType, selectedAddressId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useSubmitQuickOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SubmitQuickOrderInput) => submitQuickOrder(input),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders() })
      queryClient.invalidateQueries({ queryKey: ['quick-order-context'] })
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
