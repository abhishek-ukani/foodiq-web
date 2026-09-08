import { useState, useEffect, useCallback, useMemo } from 'react'
import dayjs from 'dayjs'
import { supabase } from '@/lib/supabase'
import type { MealType } from '@/types/database.types'

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

function parseCutoffMinutes(cutoffTimeStr: string | null): number | null {
  if (!cutoffTimeStr) return null
  const now = dayjs()
  const [hours, minutes] = cutoffTimeStr.substring(0, 5).split(':').map(Number)
  const cutoffToday = dayjs().hour(hours).minute(minutes).second(0)

  const diffMinutes = cutoffToday.diff(now, 'minute')
  return diffMinutes
}

function formatCutoffDisplay(cutoffTimeStr: string | null): string {
  if (!cutoffTimeStr) return ''
  const [hours, minutes] = cutoffTimeStr.substring(0, 5).split(':').map(Number)
  const dateObj = new Date()
  dateObj.setHours(hours, minutes, 0, 0)
  return dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function useMealTiming(targetDate?: string): MealTimingState {
  const dateStr = targetDate || dayjs().format('YYYY-MM-DD')
  const [rawSlots, setRawSlots] = useState<{ meal_type: MealType; cutoff_time: string | null; is_published: boolean }[]>([])
  const [activeSlot, setActiveSlot] = useState<MealType>('lunch')
  const [hasUserSwitched, setHasUserSwitched] = useState(false)
  const [tick, setTick] = useState(0)

  // Fetch slot metadata for the date
  const fetchTimingData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('daily_menus')
        .select('meal_type, cutoff_time, is_published')
        .eq('menu_date', dateStr)
        .eq('is_published', true)

      if (error) throw error
      if (data) {
        setRawSlots(data as { meal_type: MealType; cutoff_time: string | null; is_published: boolean }[])
      }
    } catch {
      // Fallback empty
    }
  }, [dateStr])

  useEffect(() => {
    fetchTimingData()
  }, [fetchTimingData])

  // Live countdown ticker every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1)
    }, 30000)
    return () => clearInterval(timer)
  }, [])

  // Process timing details per slot
  const slots = useMemo(() => {
    // Suppress unused tick warning while keeping reactivity
    void tick

    const nowStr = dayjs().format('HH:mm')
    const result: Record<MealType, SlotTimingInfo | null> = {
      breakfast: null,
      lunch: null,
      dinner: null,
    }

    const defaultCutoffs: Record<string, string> = {
      lunch: '11:30',
      dinner: '22:30',
    }

    for (const type of ['lunch', 'dinner'] as MealType[]) {
      const match = rawSlots.find((s) => s.meal_type === type)
      const rawCutoff = match?.cutoff_time || defaultCutoffs[type]
      const cutoffShort = rawCutoff ? rawCutoff.substring(0, 5) : null

      const isOpen = cutoffShort ? nowStr < cutoffShort : true
      const minutesRemaining = parseCutoffMinutes(rawCutoff)
      const isClosingSoon = isOpen && minutesRemaining !== null && minutesRemaining > 0 && minutesRemaining <= 30

      result[type] = {
        mealType: type,
        cutoffTime: rawCutoff,
        formattedCutoff: formatCutoffDisplay(rawCutoff),
        isPublished: !!match,
        isOpen,
        isClosingSoon,
        minutesRemaining: isOpen && minutesRemaining !== null && minutesRemaining >= 0 ? minutesRemaining : 0,
      }
    }

    return result
  }, [rawSlots, tick])

  const isLunchOpen = slots.lunch?.isOpen ?? false
  const isDinnerOpen = slots.dinner?.isOpen ?? false
  const lunchMinutesRemaining = slots.lunch?.minutesRemaining ?? null
  const dinnerMinutesRemaining = slots.dinner?.minutesRemaining ?? null

  // Auto-select lunch if open, or auto-switch to dinner if lunch is closed
  useEffect(() => {
    if (hasUserSwitched) return

    if (isLunchOpen) {
      setActiveSlot('lunch')
    } else if (isDinnerOpen) {
      setActiveSlot('dinner')
    } else {
      setActiveSlot('lunch')
    }
  }, [isLunchOpen, isDinnerOpen, hasUserSwitched])

  const handleSetActiveSlot = useCallback((slot: MealType) => {
    setHasUserSwitched(true)
    setActiveSlot(slot)
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
    refetchTiming: fetchTimingData,
  }
}
