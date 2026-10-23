import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CompactStarPicker, StarRatingInput } from '@/components/common/star-rating'
import { useSubmitReview } from '@/features/reviews/hooks/use-reviews'

export function ReviewFormDialog({
  open,
  onOpenChange,
  foodItemId,
  orderId,
  itemName,
  initialRating = 5,
  initialFoodRating,
  initialPackagingRating,
  initialDeliveryRating,
  initialComment = '',
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  foodItemId: string
  orderId: string
  itemName: string
  initialRating?: number
  initialFoodRating?: number | null
  initialPackagingRating?: number | null
  initialDeliveryRating?: number | null
  initialComment?: string | null
}) {
  const [rating, setRating] = useState(initialRating || 5)
  const [foodRating, setFoodRating] = useState(initialFoodRating || initialRating || 5)
  const [packagingRating, setPackagingRating] = useState(initialPackagingRating || initialRating || 5)
  const [deliveryRating, setDeliveryRating] = useState(initialDeliveryRating || initialRating || 5)
  const [hasCustomizedSubRatings, setHasCustomizedSubRatings] = useState(
    Boolean(initialFoodRating || initialPackagingRating || initialDeliveryRating),
  )
  const [comment, setComment] = useState(initialComment || '')
  const submitReview = useSubmitReview(orderId)

  // Sync state when dialog opens with existing review data
  useEffect(() => {
    if (open) {
      const baseRating = initialRating || 5
      setRating(baseRating)
      setFoodRating(initialFoodRating || baseRating)
      setPackagingRating(initialPackagingRating || baseRating)
      setDeliveryRating(initialDeliveryRating || baseRating)
      setHasCustomizedSubRatings(
        Boolean(initialFoodRating || initialPackagingRating || initialDeliveryRating),
      )
      setComment(initialComment || '')
    }
  }, [open, initialRating, initialFoodRating, initialPackagingRating, initialDeliveryRating, initialComment])

  const handleSubmit = () => {
    if (!rating || rating < 1 || rating > 5) return

    submitReview.mutate(
      {
        food_item_id: foodItemId,
        order_id: orderId,
        rating,
        food_rating: foodRating || rating,
        packaging_rating: packagingRating || rating,
        delivery_rating: deliveryRating || rating,
        comment: comment.trim() || null,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      },
    )
  }

  const isEditing = Boolean(initialRating && initialRating > 0 && initialComment)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-5 sm:p-6 rounded-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-lg sm:text-xl font-bold">
            {isEditing ? `Update review for ${itemName}` : `Rate ${itemName}`}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Your authentic feedback helps us improve and helps other customers choose what to order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 py-1">
          {/* Overall Rating */}
          <div className="rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 p-3.5 text-center space-y-1">
            <p className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
              Overall Experience
            </p>
            <StarRatingInput
              value={rating}
              onChange={(val) => {
                setRating(val)
                if (!hasCustomizedSubRatings) {
                  setFoodRating(val)
                  setPackagingRating(val)
                  setDeliveryRating(val)
                }
              }}
            />
          </div>

          {/* Sub-Category Ratings Card */}
          <div className="rounded-2xl border border-border/80 bg-card p-3.5 space-y-2.5">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Rate By Category
            </p>

            {/* Food Quality & Taste */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-base select-none">🍲</span>
                <span className="text-xs sm:text-sm font-medium text-foreground">Food & Taste</span>
              </div>
              <CompactStarPicker
                value={foodRating}
                onChange={(val) => {
                  setHasCustomizedSubRatings(true)
                  setFoodRating(val)
                }}
              />
            </div>

            {/* Packaging Quality */}
            <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-base select-none">📦</span>
                <span className="text-xs sm:text-sm font-medium text-foreground">Packaging</span>
              </div>
              <CompactStarPicker
                value={packagingRating}
                onChange={(val) => {
                  setHasCustomizedSubRatings(true)
                  setPackagingRating(val)
                }}
              />
            </div>

            {/* Delivery Experience */}
            <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-base select-none">🚀</span>
                <span className="text-xs sm:text-sm font-medium text-foreground">Delivery</span>
              </div>
              <CompactStarPicker
                value={deliveryRating}
                onChange={(val) => {
                  setHasCustomizedSubRatings(true)
                  setDeliveryRating(val)
                }}
              />
            </div>
          </div>

          {/* Single Review Text Field */}
          <div className="space-y-1.5">
            <label htmlFor="review-comment" className="text-xs font-semibold text-muted-foreground">
              Your Review (optional)
            </label>
            <Textarea
              id="review-comment"
              placeholder="Tell us what you liked about the food taste, packaging quality, or delivery speed..."
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="text-sm rounded-xl resize-none"
              maxLength={500}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-row gap-2 pt-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="flex-1 sm:flex-none min-h-[44px] rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 sm:flex-none min-h-[44px] rounded-xl font-semibold shadow-xs"
            onClick={handleSubmit}
            disabled={submitReview.isPending || !rating}
          >
            {submitReview.isPending
              ? 'Submitting…'
              : isEditing
              ? 'Update review'
              : 'Submit review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


