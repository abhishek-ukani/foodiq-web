import { useEffect, useRef, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import {
  ORDERS_REALTIME_CHANNEL,
  ORDER_CREATED_EVENT,
  ORDER_UPDATED_EVENT,
  playOrderChime,
  type OrderRealtimePayload,
} from '@/lib/orders-realtime'
import type { OrderStatus } from '@/types/database.types'

interface OrderSyncProviderProps {
  children: ReactNode
}

const STATUS_MESSAGES: Partial<Record<OrderStatus, { title: string; icon: string }>> = {
  accepted: {
    title: 'Order Confirmed! Our kitchen is preparing your meal.',
    icon: '👨‍🍳',
  },
  ready: {
    title: 'Order Ready & Packed for Delivery!',
    icon: '🍱',
  },
  out_for_delivery: {
    title: 'Out for Delivery! Your meal is on the way.',
    icon: '🛵',
  },
  delivered: {
    title: 'Order Delivered! Enjoy your meal.',
    icon: '✅',
  },
  rejected: {
    title: 'Order could not be accepted.',
    icon: '⚠️',
  },
  cancelled: {
    title: 'Order has been cancelled.',
    icon: '❌',
  },
}

/**
 * Global Realtime Order Synchronization Provider.
 *
 * Ensures zero-refresh instant updates on:
 * 1. Admin accepting/updating order status -> customer sees updated status instantly.
 * 2. New order placed -> updates order lists and counts across tabs.
 * 3. Postgres changes (database-level row updates).
 * 4. Supabase broadcast channel (cross-device/tab sub-50ms latency).
 * 5. Local browser BroadcastChannel.
 */
export function OrderSyncProvider({ children }: OrderSyncProviderProps) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const currentUserId = user?.id

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastNotifiedStatusRef = useRef<Map<string, string>>(new Map())

  useEffect(() => {
    const invalidateOrderQueries = (orderId?: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        // Invalidate list of orders
        queryClient.invalidateQueries({ queryKey: ['orders'] })

        // Invalidate specific order query if provided
        if (orderId) {
          queryClient.invalidateQueries({ queryKey: ['order', orderId] })
        }

        // Also invalidate cart & quickOrder cache
        queryClient.invalidateQueries({ queryKey: ['cart'] })
        queryClient.invalidateQueries({ queryKey: ['quick-order'] })
      }, 100)
    }

    const notifyUserIfRelevant = (
      orderUserId: string | undefined,
      orderId: string,
      orderNumber?: string,
      status?: OrderStatus,
    ) => {
      if (!status) return

      // Only notify if the order belongs to the currently logged in user
      if (currentUserId && orderUserId && orderUserId !== currentUserId) {
        return
      }

      // Prevent duplicate notifications for same order and status
      const dedupeKey = `${orderId}:${status}`
      if (lastNotifiedStatusRef.current.get(orderId) === status) {
        return
      }
      lastNotifiedStatusRef.current.set(orderId, status)

      const info = STATUS_MESSAGES[status]
      if (info) {
        playOrderChime('status_update')
        const numStr = orderNumber ? ` #${orderNumber}` : ''
        if (status === 'cancelled' || status === 'rejected') {
          toast.error(`${info.icon} Order${numStr}: ${info.title}`, {
            id: dedupeKey,
            duration: 6000,
          })
        } else {
          toast.success(`${info.icon} Order${numStr}: ${info.title}`, {
            id: dedupeKey,
            duration: 6000,
          })
        }
      }
    }

    // 1. Setup local browser BroadcastChannel
    let localChannel: BroadcastChannel | null = null
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        localChannel = new BroadcastChannel(ORDERS_REALTIME_CHANNEL)
        localChannel.onmessage = (event) => {
          const data = event.data as { type: string; payload?: OrderRealtimePayload }
          if (data?.type === ORDER_UPDATED_EVENT && data.payload?.id) {
            invalidateOrderQueries(data.payload.id)
            notifyUserIfRelevant(
              data.payload.user_id,
              data.payload.id,
              data.payload.order_number,
              data.payload.status,
            )
          } else if (data?.type === ORDER_CREATED_EVENT) {
            invalidateOrderQueries(data.payload?.id)
          }
        }
      }
    } catch {
      // BroadcastChannel optional fallback
    }

    // 2. Setup Supabase Realtime Channel
    const channel = supabase.channel(ORDERS_REALTIME_CHANNEL, {
      config: {
        broadcast: { ack: false, self: true },
      },
    })

    // Listen to Broadcast Events from Admin or Web
    channel.on(
      'broadcast',
      { event: ORDER_UPDATED_EVENT },
      ({ payload }: { payload: OrderRealtimePayload }) => {
        if (payload?.id) {
          invalidateOrderQueries(payload.id)
          notifyUserIfRelevant(payload.user_id, payload.id, payload.order_number, payload.status)
        }
      },
    )

    channel.on(
      'broadcast',
      { event: ORDER_CREATED_EVENT },
      ({ payload }: { payload: OrderRealtimePayload }) => {
        invalidateOrderQueries(payload?.id)
      },
    )

    // Listen to PostgreSQL changes on orders table
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
      },
      (payload) => {
        const newRecord = payload.new as {
          id?: string
          user_id?: string
          order_number?: string
          status?: OrderStatus
        } | null
        const oldRecord = payload.old as { id?: string } | null

        const targetId = newRecord?.id || oldRecord?.id
        invalidateOrderQueries(targetId)

        if (payload.eventType === 'UPDATE' && newRecord?.id && newRecord?.status) {
          notifyUserIfRelevant(
            newRecord.user_id,
            newRecord.id,
            newRecord.order_number,
            newRecord.status,
          )
        }
      },
    )

    // Subscribe to channel
    channel.subscribe((status, error) => {
      if (status === 'CHANNEL_ERROR' && error) {
        console.warn('[OrderSync] Supabase Realtime channel error:', error)
      }
    })

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      try {
        localChannel?.close()
      } catch {
        // ignore
      }
      supabase.removeChannel(channel)
    }
  }, [queryClient, currentUserId])

  return <>{children}</>
}

