import { useEffect, useRef, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export const CATALOG_SYNC_CHANNEL = 'foodiq-catalog-sync'
export const CATALOG_UPDATED_EVENT = 'catalog_updated'

interface CatalogSyncProviderProps {
  children: ReactNode
}

/**
 * Provides automatic, zero-refresh real-time synchronization between
 * foodIQ_admin and foodIQ_web.
 *
 * Uses:
 * 1. Supabase Realtime Broadcast (< 50ms latency across tabs & devices)
 * 2. Supabase Postgres Changes (captures direct database/background updates)
 * 3. Browser BroadcastChannel (instant local tab communication)
 */
export function CatalogSyncProvider({ children }: CatalogSyncProviderProps) {
  const queryClient = useQueryClient()
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Debounced cache invalidation to prevent refetch storms on batch edits
    const invalidateCatalogQueries = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        // Invalidate all catalog & menu queries
        queryClient.invalidateQueries({ queryKey: ['daily-menu'] })
        queryClient.invalidateQueries({ queryKey: ['food-item'] })
        queryClient.invalidateQueries({ queryKey: ['categories'] })
        queryClient.invalidateQueries({ queryKey: ['daily-menu-slots'] })
        queryClient.invalidateQueries({ queryKey: ['delivery-slots'] })
        queryClient.invalidateQueries({ queryKey: ['meal-timing-data'] })
        queryClient.invalidateQueries({ queryKey: ['all-active-items'] })
        queryClient.invalidateQueries({ queryKey: ['always-available-items'] })
        queryClient.invalidateQueries({ queryKey: ['popular-items'] })
        queryClient.invalidateQueries({ queryKey: ['todays-special'] })
        // Invalidate cart so active cart items reflect updated prices / availability
        queryClient.invalidateQueries({ queryKey: ['cart'] })
      }, 150)
    }

    // 1. Setup local browser BroadcastChannel listener (if supported)
    let localChannel: BroadcastChannel | null = null
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        localChannel = new BroadcastChannel(CATALOG_SYNC_CHANNEL)
        localChannel.onmessage = () => {
          invalidateCatalogQueries()
        }
      }
    } catch {
      // BroadcastChannel optional fallback
    }

    // 2. Setup Supabase Realtime channel for Broadcast + Postgres Changes
    const channel = supabase.channel(CATALOG_SYNC_CHANNEL, {
      config: {
        broadcast: { ack: false, self: true },
      },
    })

    // Listen to admin broadcast events
    channel.on('broadcast', { event: CATALOG_UPDATED_EVENT }, () => {
      invalidateCatalogQueries()
    })

    // Listen to PostgreSQL changes on catalog tables
    const monitoredTables = [
      'food_items',
      'food_item_variants',
      'daily_menus',
      'daily_menu_items',
      'categories',
      'thali_items',
      'thali_option_groups',
      'thali_option_items',
      'thali_components',
      'item_customizations',
      'delivery_slots',
    ]

    for (const table of monitoredTables) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
        },
        () => {
          invalidateCatalogQueries()
        },
      )
    }

    // Subscribe to channel
    channel.subscribe((status, error) => {
      if (status === 'CHANNEL_ERROR' && error) {
        console.warn('[CatalogSync] Supabase Realtime channel error:', error)
      }
    })

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      try {
        localChannel?.close()
      } catch {
        // ignore close error
      }
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return <>{children}</>
}
