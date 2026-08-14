import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Read-only stars for displaying a rating. */
export function StarRatingDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            size === 'sm' ? 'size-3.5' : 'size-5',
            i < Math.round(rating) ? 'fill-current text-amber-500' : 'text-muted',
          )}
          aria-hidden
        />
      ))}
    </div>
  )
}

/** Interactive star picker for review forms. */
export function StarRatingInput({
  value,
  onChange,
}: {
  value: number
  onChange: (rating: number) => void
}) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            onClick={() => onChange(star)}
            className="p-0.5"
          >
            <Star
              className={cn('size-6', star <= value ? 'fill-current text-amber-500' : 'text-muted')}
              aria-hidden
            />
          </button>
        )
      })}
    </div>
  )
}
