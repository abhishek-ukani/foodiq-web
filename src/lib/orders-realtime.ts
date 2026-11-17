import { supabase } from '@/lib/supabase'
import type { OrderStatus } from '@/types/database.types'

export const ORDERS_REALTIME_CHANNEL = 'foodiq-orders-realtime'
export const ORDER_CREATED_EVENT = 'order_created'
export const ORDER_UPDATED_EVENT = 'order_updated'

export interface OrderRealtimePayload {
  id: string
  order_number?: string
  status?: OrderStatus
  user_id?: string
  total_amount?: number
  reason?: string
  delivery_charge?: number
}

// Local cross-tab broadcast channel
let localOrdersChannel: BroadcastChannel | null = null

try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    localOrdersChannel = new BroadcastChannel(ORDERS_REALTIME_CHANNEL)
  }
} catch {
  // Graceful fallback if BroadcastChannel is restricted
}

/**
 * Play a synthesized pleasant notification chime via Web Audio API.
 * Does not require any external audio file.
 */
export function playOrderChime(type: 'new_order' | 'status_update' = 'new_order') {
  try {
    if (typeof window === 'undefined') return
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    gain.gain.setValueAtTime(0.001, now)

    if (type === 'new_order') {
      // Two-tone rising doorbell chime (E5 -> G#5 -> B5)
      osc.frequency.setValueAtTime(659.25, now) // E5
      osc.frequency.setValueAtTime(830.61, now + 0.12) // G#5
      osc.frequency.setValueAtTime(987.77, now + 0.24) // B5

      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.65)
    } else {
      // Gentle confirmation ding (C6 -> G6)
      osc.frequency.setValueAtTime(1046.5, now) // C6
      osc.frequency.setValueAtTime(1567.98, now + 0.1) // G6

      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.5)
    }
  } catch {
    // Audio autoplay or permissions prevented chime; non-critical
  }
}

/**
 * Broadcast an order status update to all connected clients (web & admin)
 */
export async function broadcastOrderStatusUpdate(payload: OrderRealtimePayload): Promise<void> {
  // 1. Local cross-tab
  try {
    localOrdersChannel?.postMessage({
      type: ORDER_UPDATED_EVENT,
      payload,
    })
  } catch {
    // Ignore local broadcast error
  }

  // 2. Supabase Realtime Broadcast
  try {
    const channel = supabase.channel(ORDERS_REALTIME_CHANNEL)
    await channel.send({
      type: 'broadcast',
      event: ORDER_UPDATED_EVENT,
      payload,
    })
  } catch (err) {
    console.warn('[OrdersRealtime] Failed to broadcast order status update:', err)
  }
}

/**
 * Broadcast a new order creation to all connected clients (web & admin)
 */
export async function broadcastOrderCreated(payload: OrderRealtimePayload): Promise<void> {
  // 1. Local cross-tab
  try {
    localOrdersChannel?.postMessage({
      type: ORDER_CREATED_EVENT,
      payload,
    })
  } catch {
    // Ignore local broadcast error
  }

  // 2. Supabase Realtime Broadcast
  try {
    const channel = supabase.channel(ORDERS_REALTIME_CHANNEL)
    await channel.send({
      type: 'broadcast',
      event: ORDER_CREATED_EVENT,
      payload,
    })
  } catch (err) {
    console.warn('[OrdersRealtime] Failed to broadcast order created:', err)
  }
}

