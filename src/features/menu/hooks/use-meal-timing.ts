import { useState, useEffect, useCallback, useMemo } from 'react'
import dayjs from 'dayjs'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { MealType, Tables } from '@/types/database.types'

export type KitchenHoliday = {
  id: string
  title: string
  startDate: string
  endDate: string
  mealType: 'all' | 'lunch' | 'dinner'
  message?: string
  isActive: boolean
  createdAt?: string
}

export type HolidaySettings = {
  enabled: boolean
  holidays: KitchenHoliday[]
}

export type SlotTimingInfo = {
  mealType: MealType
  cutoffTime: string | null // e.g. "11:30:00" or "20:00:00"
  formattedCutoff: string // e.g. "11:30 AM" or "8:00 PM"
  isPublished: boolean // true if daily_menus row exists and is_published = true
  isOpen: boolean // true if isPublished && !isCutoffPassed && !isHolidayClosed
  isCutoffPassed: boolean // true if clock time has passed cutoff
  isHolidayClosed: boolean // true if this slot is covered by an active holiday
  isClosingSoon: boolean // <= 30 minutes remaining
  minutesRemaining: number | null
  note?: string | null
  title?: string | null
  holidayInfo?: KitchenHoliday | null
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
  isFullDayClosed: boolean
  isHolidayClosed: boolean
  activeHoliday: KitchenHoliday | null
  holidaySettings: HolidaySettings | null
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

  // Fetch slot metadata for today AND tomorrow from daily_menus, slots, and kitchen_holidays
  const { data: timingRaw, refetch: refetchTimingQuery } = useQuery({
    queryKey: ['meal-timing-data', todayStr, tomorrowStr],
    queryFn: async () => {
      const [menusRes, slotsRes, configRes] = await Promise.all([
        supabase
          .from('daily_menus')
          .select('id, menu_date, meal_type, cutoff_time, is_published, note, title')
          .in('menu_date', [todayStr, tomorrowStr]),
        supabase
          .from('delivery_slots')
          .select('*')
          .eq('is_active', true)
          .order('display_order'),
        supabase
          .from('system_config')
          .select('key, value')
          .in('key', ['kitchen_holidays', 'order_settings']),
      ])

      const sysRows = configRes.data as { key: string; value: any }[] | null
      const holidayRaw = sysRows?.find((r) => r.key === 'kitchen_holidays')?.value
      const orderSettingsRaw = sysRows?.find((r) => r.key === 'order_settings')?.value

      const defaultLunchCutoff =
        orderSettingsRaw?.default_lunch_cutoff_time
          ? (String(orderSettingsRaw.default_lunch_cutoff_time).length === 5
              ? `${orderSettingsRaw.default_lunch_cutoff_time}:00`
              : String(orderSettingsRaw.default_lunch_cutoff_time))
          : '10:00:00'

      const defaultDinnerCutoff =
        orderSettingsRaw?.default_dinner_cutoff_time
          ? (String(orderSettingsRaw.default_dinner_cutoff_time).length === 5
              ? `${orderSettingsRaw.default_dinner_cutoff_time}:00`
              : String(orderSettingsRaw.default_dinner_cutoff_time))
          : '18:00:00'

      const holidaySettings: HolidaySettings = {
        enabled: typeof holidayRaw?.enabled === 'boolean' ? holidayRaw.enabled : true,
        holidays: Array.isArray(holidayRaw?.holidays) ? holidayRaw.holidays : [],
      }

      return {
        rawMenus:
          (menusRes.data as {
            id: string
            menu_date: string
            meal_type: MealType
            cutoff_time: string | null
            is_published: boolean
            note: string | null
            title: string | null
          }[]) || [],
        deliverySlots: (slotsRes.data as Tables<'delivery_slots'>[]) || [],
        holidaySettings,
        defaultLunchCutoff,
        defaultDinnerCutoff,
      }
    },
    staleTime: 0,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  })

  const rawMenus = timingRaw?.rawMenus || []
  const deliverySlots = timingRaw?.deliverySlots || []
  const holidaySettings = timingRaw?.holidaySettings || { enabled: true, holidays: [] }
  const defaultLunchCutoff = timingRaw?.defaultLunchCutoff || '10:00:00'
  const defaultDinnerCutoff = timingRaw?.defaultDinnerCutoff || '18:00:00'

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
    const lunchCutoff = lunchMatch?.cutoff_time || lunchSlot?.cutoff_time || defaultLunchCutoff
    const isLunchPassed = nowStr >= lunchCutoff.substring(0, 5)

    const dinnerMatch = rawMenus.find((m) => m.menu_date === todayStr && m.meal_type === 'dinner')
    const dinnerSlot = deliverySlots.find((s) => s.meal_type === 'dinner')
    const dinnerCutoff = dinnerMatch?.cutoff_time || dinnerSlot?.cutoff_time || defaultDinnerCutoff
    const isDinnerPassed = nowStr >= dinnerCutoff.substring(0, 5)

    return {
      isLunchPassed,
      isDinnerPassed,
      lunchCutoff,
      dinnerCutoff,
    }
  }, [rawMenus, deliverySlots, defaultLunchCutoff, defaultDinnerCutoff, todayStr, tick])

  // Auto-calculated default date and slot according to clock time
  const autoDateAndSlot = useMemo<{ date: string; slot: MealType }>(() => {
    // 1. If today's dinner cutoff has passed: advance to tomorrow's lunch!
    if (todayTiming.isDinnerPassed) {
      return { date: tomorrowStr, slot: 'lunch' }
    }

    // 2. If today's lunch cutoff has passed, but dinner is still open: auto-select dinner!
    if (todayTiming.isLunchPassed) {
      return { date: todayStr, slot: 'dinner' }
    }

    // 3. Otherwise: today's lunch is active
    return { date: todayStr, slot: 'lunch' }
  }, [todayTiming, todayStr, tomorrowStr])

  // Explicit user selection overrides auto
  const [userSelectedDate, setUserSelectedDate] = useState<string | null>(null)
  const [userSelectedSlot, setUserSelectedSlot] = useState<MealType | null>(null)

  const effectiveDate = targetDate || userSelectedDate || autoDateAndSlot.date
  const activeSlot = userSelectedSlot || (effectiveDate === autoDateAndSlot.date ? autoDateAndSlot.slot : 'lunch')

  // Check if an active holiday applies to the currently viewed date
  const activeHoliday = useMemo<KitchenHoliday | null>(() => {
    if (!holidaySettings?.enabled) return null
    return (
      holidaySettings.holidays.find(
        (h) => h.isActive && effectiveDate >= h.startDate && effectiveDate <= h.endDate,
      ) ?? null
    )
  }, [holidaySettings, effectiveDate])

  // Calculate timing and availability for each slot of the effective date
  const slots = useMemo<Record<MealType, SlotTimingInfo | null>>(() => {
    void tick
    const nowStr = dayjs().format('HH:mm')
    const isPastDate = effectiveDate < todayStr
    const isFutureDate = effectiveDate > todayStr

    const result: Record<MealType, SlotTimingInfo | null> = {
      lunch: null,
      dinner: null,
      breakfast: null,
    }

    const types: MealType[] = ['lunch', 'dinner']

    for (const type of types) {
      const menuMatch = rawMenus.find(
        (m) => m.menu_date === effectiveDate && m.meal_type === type,
      )
      const slotDef = deliverySlots.find((s) => s.meal_type === type)
      const defaultCutoff = type === 'lunch' ? defaultLunchCutoff : defaultDinnerCutoff
      const rawCutoff = menuMatch?.cutoff_time || slotDef?.cutoff_time || defaultCutoff
      const cutoffShort = rawCutoff.substring(0, 5)

      let isCutoffPassed = false
      let isClosingSoon = false
      let minutesRemaining: number | null = null

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

      // Check if this specific meal slot is closed due to a holiday
      const isHolidayClosed =
        !!activeHoliday && (activeHoliday.mealType === 'all' || activeHoliday.mealType === type)

      const isPublished = !!menuMatch && menuMatch.is_published

      // Slot is open if: published (or tomorrow) AND cutoff hasn't passed AND NOT closed by holiday!
      const isOpen = (isFutureDate || isPublished) && !isCutoffPassed && !isHolidayClosed

      result[type] = {
        mealType: type,
        cutoffTime: rawCutoff,
        formattedCutoff: formatCutoffDisplay(rawCutoff),
        isPublished,
        isOpen,
        isCutoffPassed,
        isHolidayClosed,
        isClosingSoon,
        minutesRemaining: isOpen && minutesRemaining !== null && minutesRemaining >= 0 ? minutesRemaining : 0,
        note: menuMatch?.note ?? null,
        title: menuMatch?.title ?? null,
        holidayInfo: isHolidayClosed ? activeHoliday : null,
      }
    }

    return result
  }, [rawMenus, deliverySlots, defaultLunchCutoff, defaultDinnerCutoff, effectiveDate, todayStr, tick, activeHoliday])

  const isLunchOpen = slots.lunch?.isOpen ?? false
  const isDinnerOpen = slots.dinner?.isOpen ?? false

  const isFullDayHoliday = !!activeHoliday && activeHoliday.mealType === 'all'
  const isBothCutoffPassed =
    effectiveDate === todayStr &&
    (slots.lunch?.isCutoffPassed ?? false) &&
    (slots.dinner?.isCutoffPassed ?? false)

  // Full day is ONLY closed if a full-day holiday is active, OR ordering hours for today have completely passed!
  // Simply being unpublished means "Menu Coming Soon", NEVER "Closed for the day"!
  const isFullDayClosed = isFullDayHoliday || isBothCutoffPassed
  const isHolidayClosed = !!activeHoliday && (activeHoliday.mealType === 'all' || activeHoliday.mealType === activeSlot)

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
    isFullDayClosed,
    isHolidayClosed,
    activeHoliday,
    holidaySettings,
    lunchMinutesRemaining,
    dinnerMinutesRemaining,
    activeSlotInfo: slots[activeSlot],
    refetchTiming,
  }
}

export type ClosureNotice = {
  type: 'holiday' | 'unpublished' | 'cutoff'
  isClosed: boolean
  scope: 'full_day' | 'lunch' | 'dinner' | 'slot'
  title: string
  message: string
  holiday?: KitchenHoliday
}

/**
 * Returns a user-friendly status notice based on the current timing and holiday state.
 * Accurately differentiates between:
 * 1. Holiday / Vacation Closures (e.g. Diwali multi-day 5-6 days or closed today)
 * 2. Regular Cutoff Passed (order window closed for that meal)
 * 3. Unpublished Menu ("Menu Coming Soon" - kitchen is preparing specials)
 */
export function getClosureNotice(timing: MealTimingState): ClosureNotice | null {
  const activeSlot = timing.activeSlot
  const activeInfo = timing.slots[activeSlot]
  const isCutoffPassed = activeInfo?.isCutoffPassed ?? false
  const isPublished = activeInfo?.isPublished ?? false
  const formattedCutoff = activeInfo?.formattedCutoff || ''
  const activeHoliday = timing.activeHoliday

  // ── 1. ACTIVE HOLIDAY OR SCHEDULED CLOSURE ──
  if (activeHoliday) {
    const isSingleDay = activeHoliday.startDate === activeHoliday.endDate
    const durationDays = dayjs(activeHoliday.endDate).diff(dayjs(activeHoliday.startDate), 'day') + 1

    if (activeHoliday.mealType === 'all' || activeHoliday.mealType === activeSlot) {
      const titleHasClosed = activeHoliday.title.toLowerCase().startsWith('closed')
      const displayTitle = titleHasClosed ? activeHoliday.title : `Closed: ${activeHoliday.title}`

      if (isSingleDay) {
        return {
          type: 'holiday',
          isClosed: true,
          scope: activeHoliday.mealType === 'all' ? 'full_day' : activeHoliday.mealType,
          title: displayTitle,
          message:
            activeHoliday.message ||
            (timing.isToday
              ? (titleHasClosed
                  ? `We are ${activeHoliday.title.toLowerCase()}. We can't serve meals today. Pre-orders are open for tomorrow.`
                  : `We are closed today for ${activeHoliday.title}. We can't serve meals today. Pre-orders are open for tomorrow.`)
              : `We are closed on ${dayjs(activeHoliday.startDate).format('D MMMM')} for ${activeHoliday.title}.`),
          holiday: activeHoliday,
        }
      } else {
        // Multi-day date range (e.g. Diwali 5 to 6 days break)
        const resumeDate = dayjs(activeHoliday.endDate).add(1, 'day').format('D MMMM')
        return {
          type: 'holiday',
          isClosed: true,
          scope: activeHoliday.mealType === 'all' ? 'full_day' : activeHoliday.mealType,
          title: titleHasClosed ? activeHoliday.title : `Closed for ${activeHoliday.title}`,
          message:
            activeHoliday.message ||
            `We are closed for ${activeHoliday.title} from ${dayjs(activeHoliday.startDate).format('D MMM')} to ${dayjs(activeHoliday.endDate).format('D MMM YYYY')} (${durationDays} days). We can't serve meals during this period. Regular service resumes on ${resumeDate}.`,
          holiday: activeHoliday,
        }
      }
    }
  }

  // ── 2. BOTH CUTOFFS PASSED FOR TODAY (NORMAL OPERATING DAY, END OF HOURS) ──
  const isBothCutoffPassed =
    timing.isToday &&
    (timing.slots.lunch?.isCutoffPassed ?? false) &&
    (timing.slots.dinner?.isCutoffPassed ?? false)

  if (isBothCutoffPassed) {
    return {
      type: 'cutoff',
      isClosed: true,
      scope: 'full_day',
      title: 'Ordering Closed for Today',
      message:
        "Ordering hours for today have ended. Pre-orders are open for tomorrow's Lunch.",
    }
  }

  // ── 3. SPECIFIC MEAL CUTOFF PASSED ──
  if (timing.isToday && isCutoffPassed) {
    if (activeSlot === 'lunch') {
      return {
        type: 'cutoff',
        isClosed: true,
        scope: 'lunch',
        title: 'Lunch Service Closed',
        message: `Ordering for Lunch is closed${formattedCutoff ? ` (Cutoff was ${formattedCutoff})` : ''}.${timing.isDinnerOpen ? " Tonight's Dinner is available." : ''}`,
      }
    }
    if (activeSlot === 'dinner') {
      return {
        type: 'cutoff',
        isClosed: true,
        scope: 'dinner',
        title: 'Dinner Service Closed',
        message: `Ordering for Dinner is closed${formattedCutoff ? ` (Cutoff was ${formattedCutoff})` : ''}. Pre-orders are open for tomorrow.`,
      }
    }
  }

  // ── 4. UNPUBLISHED MENU (DEFAULT WHEN NOT A HOLIDAY AND NOT CUTOFF) ──
  if (!isPublished) {
    const mealLabel = activeSlot === 'lunch' ? 'Lunch' : 'Dinner'

    if (timing.isTomorrow) {
      return {
        type: 'unpublished',
        isClosed: false,
        scope: 'slot',
        title: 'Menu Coming Soon',
        message: `Tomorrow's ${mealLabel} menu will be published soon. Our kitchen is preparing the specials — please check back shortly!`,
      }
    }

    return {
      type: 'unpublished',
      isClosed: false,
      scope: 'slot',
      title: 'Menu Coming Soon',
      message: `Today's ${mealLabel} menu is coming soon. Our kitchen is preparing today's specials — please check back shortly!`,
    }
  }

  return null
}
