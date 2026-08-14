import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  fetchApprovedReviews,
  fetchMyReviewsForOrder,
  submitReview,
} from '@/features/reviews/services/reviews-service'

export function useApprovedReviews(foodItemId: string) {
  return useQuery({
    queryKey: ['reviews', foodItemId],
    queryFn: () => fetchApprovedReviews(foodItemId),
  })
}

export function useMyReviewsForOrder(orderId: string) {
  return useQuery({
    queryKey: ['reviews', 'mine', 'order', orderId],
    queryFn: () => fetchMyReviewsForOrder(orderId),
  })
}

export function useSubmitReview(orderId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: submitReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'mine', 'order', orderId] })
      toast.success('Thanks for your review — it will show up once approved.')
    },
    onError: (error) => toast.error(error.message),
  })
}
