import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database.types'

export async function fetchApprovedReviews(foodItemId: string): Promise<Tables<'reviews'>[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('food_item_id', foodItemId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

/** Reviews the signed-in customer has already written for a given order — used to hide "write a review" once done. */
export async function fetchMyReviewsForOrder(orderId: string): Promise<Tables<'reviews'>[]> {
  const { data: session } = await supabase.auth.getUser()
  if (!session.user) return []

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('order_id', orderId)
    .eq('user_id', session.user.id)
  if (error) throw error
  return data
}

export async function submitReview(input: {
  food_item_id: string
  order_id: string
  rating: number
  title?: string | null
  comment?: string | null
}): Promise<void> {
  const { data: session } = await supabase.auth.getUser()
  if (!session.user) throw new Error('Please sign in to write a review.')

  const { error } = await supabase.from('reviews').insert({
    user_id: session.user.id,
    food_item_id: input.food_item_id,
    order_id: input.order_id,
    rating: input.rating,
    title: input.title ?? null,
    comment: input.comment ?? null,
  })
  if (error) throw error
}
