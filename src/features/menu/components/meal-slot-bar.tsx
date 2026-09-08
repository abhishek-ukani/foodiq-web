import { Sun, Moon, Clock, AlertCircle, ArrowRight } from 'lucide-react'
import type { SlotTimingInfo } from '@/features/menu/hooks/use-meal-timing'
import type { MealType } from '@/types/database.types'
import { cn } from '@/lib/utils'

type MealSlotBarProps = {
  activeSlot: MealType
  onSelectSlot: (slot: MealType) => void
  slots: Record<MealType, SlotTimingInfo | null>
  className?: string
}

export function MealSlotBar({
  activeSlot,
  onSelectSlot,
  slots,
  className,
}: MealSlotBarProps) {
  const currentSlotInfo = slots[activeSlot]
  const lunch = slots.lunch
  const dinner = slots.dinner

  return (
    <div className={cn('w-full space-y-2.5', className)}>
      {/* ── SEGMENTED TOGGLE (CRED / ZEPTO INSPIRED) ── */}
      <div className="flex p-1 bg-neutral-100 rounded-2xl border border-neutral-200/80 shadow-xs">
        {/* Lunch Button */}
        <button
          type="button"
          onClick={() => onSelectSlot('lunch')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200',
            activeSlot === 'lunch'
              ? 'bg-white text-neutral-900 shadow-sm font-semibold'
              : 'text-neutral-500 hover:text-neutral-900',
          )}
        >
          <Sun
            className={cn(
              'size-4 transition-colors',
              activeSlot === 'lunch' ? 'text-amber-500 fill-amber-500' : 'text-neutral-400',
            )}
          />
          <span>Lunch</span>
          {lunch?.isOpen ? (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          ) : (
            <span className="text-[10px] text-neutral-400 bg-neutral-200/60 px-1.5 py-0.2 rounded-full">
              Closed
            </span>
          )}
        </button>

        {/* Dinner Button */}
        <button
          type="button"
          onClick={() => onSelectSlot('dinner')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200',
            activeSlot === 'dinner'
              ? 'bg-white text-neutral-900 shadow-sm font-semibold'
              : 'text-neutral-500 hover:text-neutral-900',
          )}
        >
          <Moon
            className={cn(
              'size-4 transition-colors',
              activeSlot === 'dinner' ? 'text-indigo-500 fill-indigo-500' : 'text-neutral-400',
            )}
          />
          <span>Dinner</span>
          {dinner?.isOpen ? (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          ) : (
            <span className="text-[10px] text-neutral-400 bg-neutral-200/60 px-1.5 py-0.2 rounded-full">
              Closed
            </span>
          )}
        </button>
      </div>

      {/* ── REAL-TIME STATUS & COUNTDOWN BANNER ── */}
      {currentSlotInfo && (
        <div
          className={cn(
            'flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-colors border',
            currentSlotInfo.isOpen
              ? currentSlotInfo.isClosingSoon
                ? 'bg-amber-50/90 border-amber-200 text-amber-900'
                : 'bg-emerald-50/80 border-emerald-200/80 text-emerald-900'
              : 'bg-neutral-50 border-neutral-200 text-neutral-600',
          )}
        >
          <div className="flex items-center gap-2 font-medium">
            <Clock
              className={cn(
                'size-4 shrink-0',
                currentSlotInfo.isOpen
                  ? currentSlotInfo.isClosingSoon
                    ? 'text-amber-600 animate-pulse'
                    : 'text-emerald-600'
                  : 'text-neutral-400',
              )}
            />
            {currentSlotInfo.isOpen ? (
              <span>
                {currentSlotInfo.isClosingSoon ? (
                  <>
                    <strong className="font-semibold text-amber-800">Closing soon!</strong> Only{' '}
                    <span className="underline decoration-amber-400 decoration-2 font-bold">
                      {currentSlotInfo.minutesRemaining} mins left
                    </span>{' '}
                    to order {activeSlot}
                  </>
                ) : (
                  <>
                    Accepting orders for <span className="capitalize font-semibold">{activeSlot}</span> · Cutoff at{' '}
                    <span className="font-semibold">{currentSlotInfo.formattedCutoff || currentSlotInfo.cutoffTime}</span>
                  </>
                )}
              </span>
            ) : (
              <span>
                {activeSlot === 'lunch' ? 'Lunch' : 'Dinner'} orders are closed for today.
              </span>
            )}
          </div>

          {/* Quick switch prompt if current slot is closed but the other is open */}
          {!currentSlotInfo.isOpen && (
            <div>
              {activeSlot === 'lunch' && dinner?.isOpen ? (
                <button
                  type="button"
                  onClick={() => onSelectSlot('dinner')}
                  className="inline-flex items-center gap-1 font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg text-xs"
                >
                  Order Dinner
                  <ArrowRight className="size-3" />
                </button>
              ) : activeSlot === 'dinner' && lunch?.isOpen ? (
                <button
                  type="button"
                  onClick={() => onSelectSlot('lunch')}
                  className="inline-flex items-center gap-1 font-semibold text-amber-700 hover:text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-xs"
                >
                  Order Lunch
                  <ArrowRight className="size-3" />
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400">
                  <AlertCircle className="size-3" />
                  Pre-orders open tomorrow
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
