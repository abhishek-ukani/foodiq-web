import { useState, useEffect, useCallback, useMemo } from 'react'
import dayjs from 'dayjs'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { MealType, Tables } from '@/types/database.types'

export type SlotTimingInfo = {
  mealType: MealType
  cutoffTime: string | null // e.g. "11:30:00" or "23:00:00"
  formattedCutoff: string // e.g. "11:30 AM"
  isPublished: boolean
  isOpen: boolean
  isClosingSoon: boolean // <= 30 minutes
  minutesRemaining: number | null
}

export type MealTimingState = {
  activeSlot: MealType
  setActiveSlot: (slot: MealType) => void
  slots: Record<MealType, SlotTimingInfo | null>
  isLunchOpen: boolean
  isDinnerOpen: boolean
  lunchMinutesRemaining: number | null
  dinnerMinutesRemaining: number | null
  activeSlotInfo: SlotTimingInfo | null
  refetchTiming: () => Promise<void>
}

function parseCutoffMinutes(cutoffTimeStr: string | null, dateStr: string): number | null {
  if (!cutoffTimeStr) return null
  const now = dayjs()
  const parts = cutoffTimeStr.substring(0, 5).split(':').map(Number)
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null
  const cutoffDateTime = dayjs(dateStr).hour(parts[0]).minute(parts[1]).second(0)
  return cutoffDateTime.diff(now, 'minute')
}

function formatCutoffDisplay(cutoffTimeStr: string | null): string {
  if (!cutoffTimeStr) return ''
  const parts = cutoffTimeStr.substring(0, 5).split(':').map(Number)
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return ''
  const dateObj = new Date()
  dateObj.setHours(parts[0], parts[1], 0, 0)
  return dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function useMealTiming(targetDate?: string): MealTimingState {
  const dateStr = targetDate || dayjs().format('YYYY-MM-DD')
  const [tick, setTick] = useState(0)

  // Fetch slot metadata from daily_menus and delivery_slots from database via React Query
  const { data: timingRaw, refetch: refetchTimingQuery } = useQuery({
    queryKey: ['meal-timing-data', dateStr],
    queryFn: async () => {
      const [menusRes, slotsRes] = await Promise.all([
        supabase
          .from('daily_menus')
          .select('meal_type, cutoff_time, is_published')
          .eq('menu_date', dateStr)
          .eq('is_published', true),
        supabase
          .from('delivery_slots')
          .select('*')
          .eq('is_active', true)
          .order('display_order'),
      ])

      return {
        rawMenus: (menusRes.data as { meal_type: MealType; cutoff_time: string | null; is_published: boolean }[]) || [],
        deliverySlots: (slotsRes.data as Tables<'delivery_slots'>[]) || [],
      }
    },
  })

  const rawMenus = timingRaw?.rawMenus || []
  const deliverySlots = timingRaw?.deliverySlots || []

  const refetchTiming = useCallback(async () => {
    await refetchTimingQuery()
  }, [refetchTimingQuery])

  // Live countdown ticker every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1)
    }, 30000)
    return () => clearInterval(timer)
  }, [])

  // Process timing details per slot
  const slots = useMemo(() => {
    void tick

    const todayStr = dayjs().format('YYYY-MM-DD')
    const isFutureDate = dayjs(dateStr).isAfter(todayStr, 'day')
    const isPastDate = dayjs(dateStr).isBefore(todayStr, 'day')
    const nowStr = dayjs().format('HH:mm')

    const result: Record<MealType, SlotTimingInfo | null> = {
      breakfast: null,
      lunch: null,
      dinner: null,
    }

    for (const type of ['breakfast', 'lunch', 'dinner'] as MealType[]) {
      const menuMatch = rawMenus.find((s) => s.meal_type === type)
      const slotMatch = deliverySlots.find((s) => s.meal_type === type)

      // Priority: daily menu cutoff override > delivery slot cutoff from admin
      const rawCutoff = menuMatch?.cutoff_time || slotMatch?.cutoff_time || null
      const cutoffShort = rawCutoff ? rawCutoff.substring(0, 5) : null

      let isOpen = true
      let minutesRemaining: number | null = null
      let isClosingSoon = false

      if (isPastDate) {
        isOpen = false
        minutesRemaining = 0
        isClosingSoon = false
      } else if (isFutureDate) {
        // Future dates: pre-orders are open
        isOpen = true
        minutesRemaining = null
        isClosingSoon = false
      } else {
        // Today: evaluate against current clock time
        isOpen = cutoffShort ? nowStr < cutoffShort : true
        minutesRemaining = parseCutoffMinutes(rawCutoff, dateStr)
        isClosingSoon = isOpen && minutesRemaining !== null && minutesRemaining > 0 && minutesRemaining <= 30
      }

      result[type] = {
        mealType: type,
        cutoffTime: rawCutoff,
        formattedCutoff: formatCutoffDisplay(rawCutoff),
        isPublished: !!menuMatch,
        isOpen,
        isClosingSoon,
        minutesRemaining: isOpen && minutesRemaining !== null && minutesRemaining >= 0 ? minutesRemaining : 0,
      }
    }

    return result
  }, [rawMenus, deliverySlots, dateStr, tick])

  const isLunchOpen = slots.lunch?.isOpen ?? false
  const isDinnerOpen = slots.dinner?.isOpen ?? false
  const lunchMinutesRemaining = slots.lunch?.minutesRemaining ?? null
  const dinnerMinutesRemaining = slots.dinner?.minutesRemaining ?? null

  const [userSelectedSlot, setUserSelectedSlot] = useState<MealType | null>(null)

  // Auto-select lunch if open, or auto-switch to dinner if lunch is closed, unless explicitly chosen by user
  const activeSlot = useMemo<MealType>(() => {
    if (userSelectedSlot) return userSelectedSlot
    if (isLunchOpen) return 'lunch'
    if (isDinnerOpen) return 'dinner'
    return 'lunch'
  }, [userSelectedSlot, isLunchOpen, isDinnerOpen])

  const handleSetActiveSlot = useCallback((slot: MealType) => {
    setUserSelectedSlot(slot)
  }, [])

  return {
    activeSlot,
    setActiveSlot: handleSetActiveSlot,
    slots,
    isLunchOpen,
    isDinnerOpen,
    lunchMinutesRemaining,
    dinnerMinutesRemaining,
    activeSlotInfo: slots[activeSlot],
    refetchTiming,
  }
}
