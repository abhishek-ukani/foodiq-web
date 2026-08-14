import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { StarRatingInput } from '@/components/common/star-rating'
import { useSubmitReview } from '@/features/reviews/hooks/use-reviews'

export function ReviewFormDialog({
  open,
  onOpenChange,
  foodItemId,
  orderId,
  itemName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  foodItemId: string
  orderId: string
  itemName: string
}) {
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const submitReview = useSubmitReview(orderId)

  const handleSubmit = () => {
    submitReview.mutate(
      { food_item_id: foodItemId, order_id: orderId, rating, title: title || null, comment: comment || null },
      {
        onSuccess: () => {
          onOpenChange(false)
          setRating(5)
          setTitle('')
          setComment('')
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate {itemName}</DialogTitle>
          <DialogDescription>Your review helps other customers decide what to order.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <StarRatingInput value={rating} onChange={setRating} />
          <Input
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="What did you think?"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitReview.isPending}>
            {submitReview.isPending ? 'Submitting…' : 'Submit review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
