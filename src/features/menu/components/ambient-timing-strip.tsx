import { Sun, Moon } from 'lucide-react'
import type { MealTimingState } from '@/features/menu/hooks/use-meal-timing'
import { cn } from '@/lib/utils'

type AmbientTimingStripProps = {
  timing: MealTimingState
  className?: string
}

export function AmbientTimingStrip({ timing, className }: AmbientTimingStripProps) {
  const lunch = timing.slots.lunch
  const dinner = timing.slots.dinner

  const getSlotStatusLabel = (slot: typeof lunch, slotName: string) => {
    if (timing.isTomorrow) {
      if (slot?.isOpen) {
        return slot.formattedCutoff ? `${slotName}: Pre-order (Till ${slot.formattedCutoff})` : `${slotName}: Pre-order Open`
      }
      return `${slotName}: Closed`
    }
    if (slot?.isOpen) {
      return slot.formattedCutoff ? `${slotName}: Till ${slot.formattedCutoff}` : `${slotName}: Open`
    }
    if (slot?.isCutoffPassed) {
      return `${slotName}: Closed`
    }
    return `${slotName}: Publishing Soon`
  }

  return (
    <div
      className={cn(
        'w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-neutral-50/80 border border-neutral-200/70 rounded-xl text-[11px] sm:text-xs text-neutral-600 select-none overflow-x-auto no-scrollbar',
        className,
      )}
    >
      {/* Lunch Status */}
      <button
        type="button"
        onClick={() => timing.setActiveSlot('lunch')}
        className={cn(
          'inline-flex items-center gap-1.5 py-0.5 px-2 rounded-lg transition-colors shrink-0',
          timing.activeSlot === 'lunch'
            ? 'bg-amber-100/70 text-amber-950 font-semibold'
            : 'hover:bg-neutral-200/50',
        )}
      >
        <Sun className="size-3 text-amber-500 fill-amber-500" />
        <span>{getSlotStatusLabel(lunch, 'Lunch')}</span>
        {lunch?.isOpen && lunch?.isClosingSoon && (
          <span className="size-1.5 rounded-full bg-amber-500 animate-ping" />
        )}
      </button>

      <span className="text-neutral-300 shrink-0">•</span>

      {/* Dinner Status */}
      <button
        type="button"
        onClick={() => timing.setActiveSlot('dinner')}
        className={cn(
          'inline-flex items-center gap-1.5 py-0.5 px-2 rounded-lg transition-colors shrink-0',
          timing.activeSlot === 'dinner'
            ? 'bg-indigo-100/70 text-indigo-950 font-semibold'
            : 'hover:bg-neutral-200/50',
        )}
      >
        <Moon className="size-3 text-indigo-500 fill-indigo-500" />
        <span>{getSlotStatusLabel(dinner, 'Dinner')}</span>
        {dinner?.isOpen && (
          <span className="size-1.5 rounded-full bg-emerald-500" />
        )}
      </button>
    </div>
  )
}
