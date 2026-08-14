import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { fetchMyOrders, fetchOrderById } from '@/features/orders/services/orders-service'

export function useMyOrders() {
  return useQuery({ queryKey: QUERY_KEYS.orders(), queryFn: fetchMyOrders })
}

export function useOrder(id: string) {
  return useQuery({ queryKey: QUERY_KEYS.order(id), queryFn: () => fetchOrderById(id) })
}
