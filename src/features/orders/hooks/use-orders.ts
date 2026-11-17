import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { fetchMyOrders, fetchOrderById } from '@/features/orders/services/orders-service'
import { supabase } from '@/lib/supabase'

export function useMyOrders() {
  return useQuery({
    queryKey: QUERY_KEYS.orders(),
    queryFn: fetchMyOrders,
    refetchInterval: (query) => {
      const orders = query.state.data
      // Background fallback polling if user has an active or pending order
      const hasActiveOrders = orders?.some((o) =>
        ['pending', 'accepted', 'ready', 'out_for_delivery'].includes(o.status),
      )
      return hasActiveOrders ? 10000 : false
    },
  })
}

export function useOrder(id: string) {
  const queryClient = useQueryClient()

  // Dedicated real-time listener for this specific order
  useEffect(() => {
    if (!id) return

    const channel = supabase
      .channel(`order-live-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order(id) })
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders() })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id, queryClient])

  return useQuery({
    queryKey: QUERY_KEYS.order(id),
    queryFn: () => fetchOrderById(id),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const order = query.state.data
      if (!order) return 4000
      // Active states poll every 6s as a safety net alongside realtime WebSocket
      const isLive = ['pending', 'accepted', 'ready', 'out_for_delivery'].includes(order.status)
      return isLive ? 6000 : false
    },
  })
}
