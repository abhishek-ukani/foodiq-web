import { useState, useEffect, useCallback, useMemo } from 'react'
import dayjs from 'dayjs'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { MealType, Tables } from '@/types/database.types'

export type SlotTimingInfo = {
  mealType: MealType
  cutoffTime: string | null // e.g. "11:30:00" or "20:00:00"
  formattedCutoff: string // e.g. "11:30 AM" or "8:00 PM"
  isPublished: boolean // true if daily_menus row exists and is_published = true
  isOpen: boolean // true if isPublished && !isCutoffPassed
  isCutoffPassed: boolean // true if clock time has passed cutoff
  isClosingSoon: boolean // <= 30 minutes remaining
  minutesRemaining: number | null
}

export type MealTimingState = {
  date: string
  setDate: (date: string) => void
  todayDate: string
  tomorrowDate: string
  isToday: boolean
  isTomorrow: boolean
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

export function formatCutoffDisplay(cutoffTimeStr?: string | null): string {
  if (!cutoffTimeStr) return ''
  const parts = cutoffTimeStr.substring(0, 5).split(':').map(Number)
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return ''
  const dateObj = new Date()
  dateObj.setHours(parts[0], parts[1], 0, 0)
  return dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function useMealTiming(targetDate?: string): MealTimingState {
  const todayStr = useMemo(() => dayjs().format('YYYY-MM-DD'), [])
  const tomorrowStr = useMemo(() => dayjs().add(1, 'day').format('YYYY-MM-DD'), [])
  const [tick, setTick] = useState(0)

  // Fetch slot metadata for today AND tomorrow from daily_menus
  const { data: timingRaw, refetch: refetchTimingQuery } = useQuery({
    queryKey: ['meal-timing-data', todayStr, tomorrowStr],
    queryFn: async () => {
      const [menusRes, slotsRes] = await Promise.all([
        supabase
          .from('daily_menus')
          .select('id, menu_date, meal_type, cutoff_time, is_published')
          .in('menu_date', [todayStr, tomorrowStr]),
        supabase
          .from('delivery_slots')
          .select('*')
          .eq('is_active', true)
          .order('display_order'),
      ])

      return {
        rawMenus:
          (menusRes.data as {
            id: string
            menu_date: string
            meal_type: MealType
            cutoff_time: string | null
            is_published: boolean
          }[]) || [],
        deliverySlots: (slotsRes.data as Tables<'delivery_slots'>[]) || [],
      }
    },
    staleTime: 0,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
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

  // Determine current clock status for today
  const todayTiming = useMemo(() => {
    void tick
    const nowStr = dayjs().format('HH:mm')

    const lunchMatch = rawMenus.find((m) => m.menu_date === todayStr && m.meal_type === 'lunch')
    const lunchSlot = deliverySlots.find((s) => s.meal_type === 'lunch')
    const lunchCutoff = lunchMatch?.cutoff_time || lunchSlot?.cutoff_time || '11:30:00'
    const isLunchPassed = nowStr >= lunchCutoff.substring(0, 5)

    const dinnerMatch = rawMenus.find((m) => m.menu_date === todayStr && m.meal_type === 'dinner')
    const dinnerSlot = deliverySlots.find((s) => s.meal_type === 'dinner')
    const dinnerCutoff = dinnerMatch?.cutoff_time || dinnerSlot?.cutoff_time || '20:00:00'
    const isDinnerPassed = nowStr >= dinnerCutoff.substring(0, 5)

    return {
      isLunchPassed,
      isDinnerPassed,
      lunchCutoff,
      dinnerCutoff,
    }
  }, [rawMenus, deliverySlots, todayStr, tick])

  // Auto-calculated default date and slot according to clock time
  const autoDateAndSlot = useMemo<{ date: string; slot: MealType }>(() => {
    // 1. If today's dinner cutoff has passed: advance to tomorrow's lunch!
    if (todayTiming.isDinnerPassed) {
      return { date: tomorrowStr, slot: 'lunch' }
    }
    // 2. If today's lunch cutoff has passed: show today's dinner!
    if (todayTiming.isLunchPassed) {
      return { date: todayStr, slot: 'dinner' }
    }
    // 3. Morning: show today's lunch
    return { date: todayStr, slot: 'lunch' }
  }, [todayTiming, todayStr, tomorrowStr])

  const [userSelectedDate, setUserSelectedDate] = useState<string | null>(targetDate || null)
  const [userSelectedSlot, setUserSelectedSlot] = useState<MealType | null>(null)

  useEffect(() => {
    if (targetDate !== undefined) {
      setUserSelectedDate(targetDate || null)
      setUserSelectedSlot(null)
    }
  }, [targetDate])

  const effectiveDate = userSelectedDate || autoDateAndSlot.date
  const isTargetToday = effectiveDate === todayStr
  const defaultSlotForDate = isTargetToday ? autoDateAndSlot.slot : 'lunch'
  const activeSlot = userSelectedSlot || defaultSlotForDate

  // Compute timing details for effectiveDate
  const slots = useMemo(() => {
    void tick
    const nowStr = dayjs().format('HH:mm')
    const isFutureDate = dayjs(effectiveDate).isAfter(todayStr, 'day')
    const isPastDate = dayjs(effectiveDate).isBefore(todayStr, 'day')

    const result: Record<MealType, SlotTimingInfo | null> = {
      breakfast: null,
      lunch: null,
      dinner: null,
    }

    for (const type of ['breakfast', 'lunch', 'dinner'] as MealType[]) {
      const menuMatch = rawMenus.find((s) => s.menu_date === effectiveDate && s.meal_type === type)
      const slotMatch = deliverySlots.find((s) => s.meal_type === type)

      const defaultCutoff = type === 'lunch' ? '11:30:00' : '20:00:00'
      const rawCutoff = menuMatch?.cutoff_time || slotMatch?.cutoff_time || defaultCutoff
      const cutoffShort = rawCutoff.substring(0, 5)

      let isCutoffPassed = false
      let minutesRemaining: number | null = null
      let isClosingSoon = false

      if (isPastDate) {
        isCutoffPassed = true
        minutesRemaining = 0
      } else if (isFutureDate) {
        // Pre-orders for tomorrow / future are open
        isCutoffPassed = false
        minutesRemaining = null
      } else {
        // Today: evaluate against current clock time
        isCutoffPassed = nowStr >= cutoffShort
        minutesRemaining = parseCutoffMinutes(rawCutoff, effectiveDate)
        isClosingSoon = !isCutoffPassed && minutesRemaining !== null && minutesRemaining > 0 && minutesRemaining <= 30
      }

      const isPublished = !!menuMatch && menuMatch.is_published
      // For future dates (tomorrow), pre-orders are open even if daily specials aren't published yet
      const isOpen = (isFutureDate || isPublished) && !isCutoffPassed

      result[type] = {
        mealType: type,
        cutoffTime: rawCutoff,
        formattedCutoff: formatCutoffDisplay(rawCutoff),
        isPublished,
        isOpen,
        isCutoffPassed,
        isClosingSoon,
        minutesRemaining: isOpen && minutesRemaining !== null && minutesRemaining >= 0 ? minutesRemaining : 0,
      }
    }

    return result
  }, [rawMenus, deliverySlots, effectiveDate, todayStr, tick])

  const isLunchOpen = slots.lunch?.isOpen ?? false
  const isDinnerOpen = slots.dinner?.isOpen ?? false
  const lunchMinutesRemaining = slots.lunch?.minutesRemaining ?? null
  const dinnerMinutesRemaining = slots.dinner?.minutesRemaining ?? null

  const handleSetActiveSlot = useCallback((slot: MealType) => {
    setUserSelectedSlot(slot)
  }, [])

  const handleSetDate = useCallback((newDate: string) => {
    setUserSelectedDate(newDate)
    setUserSelectedSlot(null) // reset slot to auto for that date
  }, [])

  return {
    date: effectiveDate,
    setDate: handleSetDate,
    todayDate: todayStr,
    tomorrowDate: tomorrowStr,
    isToday: effectiveDate === todayStr,
    isTomorrow: effectiveDate === tomorrowStr,
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
