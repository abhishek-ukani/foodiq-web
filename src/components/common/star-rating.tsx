import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const RATING_LABELS: Record<number, string> = {
  1: 'Poor · Not satisfied',
  2: 'Fair · Needs improvement',
  3: 'Good · Average meal',
  4: 'Very Good · Delicious!',
  5: 'Excellent · Loved it!',
}

/** Read-only stars for displaying a rating with optional numeric label. */
export function StarRatingDisplay({
  rating,
  size = 'sm',
  showScore = false,
  count,
  className,
}: {
  rating: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showScore?: boolean
  count?: number
  className?: string
}) {
  const iconSize = {
    xs: 'size-3',
    sm: 'size-3.5',
    md: 'size-4.5',
    lg: 'size-6',
  }[size]

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => {
          const filled = i < Math.round(rating)
          return (
            <Star
              key={i}
              className={cn(
                iconSize,
                filled ? 'fill-amber-400 text-amber-500' : 'text-neutral-200 fill-neutral-100',
              )}
              aria-hidden
            />
          )
        })}
      </div>
      {showScore && (
        <span className="text-xs font-semibold text-foreground">
          {rating.toFixed(1)}
          {typeof count === 'number' && (
            <span className="text-muted-foreground font-normal ml-0.5">({count})</span>
          )}
        </span>
      )}
    </div>
  )
}

/** Interactive star picker for review forms with mobile-first 44px touch targets. */
export function StarRatingInput({
  value,
  onChange,
  className,
}: {
  value: number
  onChange: (rating: number) => void
  className?: string
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const activeRating = hovered ?? value

  return (
    <div className={cn('flex flex-col items-center gap-2 py-1', className)}>
      <div className="flex items-center justify-center gap-1" role="radiogroup" aria-label="Rating">
        {Array.from({ length: 5 }, (_, i) => {
          const star = i + 1
          const isFilled = star <= activeRating
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
              onClick={() => onChange(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(null)}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-1 text-amber-500 transition-all duration-150 hover:scale-115 active:scale-95 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
            >
              <Star
                className={cn(
                  'size-7 sm:size-8 transition-colors',
                  isFilled
                    ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                    : 'text-neutral-200 fill-neutral-100 hover:text-amber-200',
                )}
                aria-hidden
              />
            </button>
          )
        })}
      </div>
      <p className="min-h-[20px] text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-300">
        {RATING_LABELS[activeRating] ?? 'Tap a star to rate'}
      </p>
    </div>
  )
}

/** Compact star picker for sub-category ratings (Food, Packaging, Delivery) */
export function CompactStarPicker({
  value,
  onChange,
  className,
}: {
  value: number
  onChange: (rating: number) => void
  className?: string
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const activeRating = hovered ?? value

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1
        const isFilled = star <= activeRating
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            className="flex min-h-[38px] min-w-[34px] sm:min-w-[38px] items-center justify-center rounded-lg p-0.5 text-amber-500 transition-transform active:scale-90 touch-manipulation focus-visible:outline-none"
          >
            <Star
              className={cn(
                'size-5 transition-colors',
                isFilled
                  ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                  : 'text-neutral-200 fill-neutral-100 hover:text-amber-200',
              )}
              aria-hidden
            />
          </button>
        )
      })}
    </div>
  )
}


