import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  fetchApprovedReviews,
  fetchMyReviews,
  fetchMyReviewsForOrder,
  submitReview,
} from '@/features/reviews/services/reviews-service'

export function useApprovedReviews(foodItemId: string) {
  return useQuery({
    queryKey: ['reviews', foodItemId],
    queryFn: () => fetchApprovedReviews(foodItemId),
    enabled: Boolean(foodItemId),
  })
}

export function useMyReviews() {
  return useQuery({
    queryKey: ['reviews', 'mine'],
    queryFn: fetchMyReviews,
  })
}

export function useMyReviewsForOrder(orderId: string) {
  return useQuery({
    queryKey: ['reviews', 'mine', 'order', orderId],
    queryFn: () => fetchMyReviewsForOrder(orderId),
    enabled: Boolean(orderId),
  })
}

export function useSubmitReview(orderId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: submitReview,
    onSuccess: () => {
      if (orderId) {
        queryClient.invalidateQueries({ queryKey: ['reviews', 'mine', 'order', orderId] })
      }
      queryClient.invalidateQueries({ queryKey: ['reviews', 'mine'] })
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['food_items'] })
      queryClient.invalidateQueries({ queryKey: ['daily_menus'] })
      toast.success('Thanks for your review! It has been submitted for moderation.')
    },
    onError: (error: any) => {
      const msg = error?.message || 'Failed to submit review'
      if (msg.includes('row-level security')) {
        toast.error('Unable to submit review: RLS policy missing. Please run fix_reviews_rls_and_ratings.sql in Supabase.')
      } else {
        toast.error(msg)
      }
    },
  })
}

