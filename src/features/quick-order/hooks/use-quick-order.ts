import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import {
  fetchQuickOrderContext,
  submitQuickOrder,
  type SubmitQuickOrderInput,
} from '../services/quick-order-service'
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders() })
      queryClient.invalidateQueries({ queryKey: ['quick-order-context'] })
    },
  })
}
