import dayjs from 'dayjs'
import { MessageSquareText } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { StarRatingDisplay } from '@/components/common/star-rating'
import { useApprovedReviews } from '@/features/reviews/hooks/use-reviews'

export function ReviewsList({ foodItemId }: { foodItemId: string }) {
  const { data: reviews, isPending } = useApprovedReviews(foodItemId)

  if (isPending) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }, (_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (!reviews?.length) {
    return (
      <p className="text-muted-foreground flex items-center gap-2 text-sm">
        <MessageSquareText className="size-4" aria-hidden />
        No reviews yet — be the first to try this dish.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="space-y-1 border-b pb-4 last:border-none last:pb-0">
          <div className="flex items-center gap-2">
            <StarRatingDisplay rating={review.rating} />
            <span className="text-muted-foreground text-xs">
              {dayjs(review.created_at).format('D MMM YYYY')}
            </span>
          </div>
          {review.title ? <p className="text-sm font-medium">{review.title}</p> : null}
          {review.comment ? <p className="text-muted-foreground text-sm">{review.comment}</p> : null}
        </div>
      ))}
    </div>
  )
}
