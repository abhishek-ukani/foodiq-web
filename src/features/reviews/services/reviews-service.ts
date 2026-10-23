import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database.types'

export type ApprovedReviewWithAuthor = Tables<'reviews'> & {
  profiles: { full_name: string | null; avatar_url: string | null } | null
}

export async function fetchApprovedReviews(foodItemId: string): Promise<ApprovedReviewWithAuthor[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(full_name, avatar_url)')
    .eq('food_item_id', foodItemId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as unknown as ApprovedReviewWithAuthor[]
}

/** All reviews submitted by the currently signed-in customer across all orders. */
export async function fetchMyReviews(): Promise<Tables<'reviews'>[]> {
  const { data: session } = await supabase.auth.getUser()
  if (!session.user) return []

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
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
  return data || []
}

export async function submitReview(input: {
  food_item_id: string
  order_id: string
  rating: number
  food_rating?: number | null
  packaging_rating?: number | null
  delivery_rating?: number | null
  title?: string | null
  comment?: string | null
  variant_id?: string | null
}): Promise<void> {
  const { data: session } = await supabase.auth.getUser()
  if (!session.user) throw new Error('Please sign in to write a review.')

  // Check if customer already submitted a review for this order item
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', session.user.id)
    .eq('order_id', input.order_id)
    .eq('food_item_id', input.food_item_id)
    .maybeSingle()

  const payload: Record<string, any> = {
    rating: input.rating,
    food_rating: input.food_rating ?? input.rating,
    packaging_rating: input.packaging_rating ?? input.rating,
    delivery_rating: input.delivery_rating ?? input.rating,
    title: input.title ?? null,
    comment: input.comment ?? null,
    variant_id: input.variant_id ?? null,
    status: 'pending',
  }

  if (existing) {
    payload.updated_at = new Date().toISOString()
    let { error } = await supabase.from('reviews').update(payload as any).eq('id', existing.id)
    // Fallback if sub-category columns haven't been added yet in DB
    if (error && error.message?.includes('food_rating')) {
      delete payload.food_rating
      delete payload.packaging_rating
      delete payload.delivery_rating
      const fallback = await supabase.from('reviews').update(payload as any).eq('id', existing.id)
      error = fallback.error
    }
    if (error) throw error
    return
  }

  payload.user_id = session.user.id
  payload.food_item_id = input.food_item_id
  payload.order_id = input.order_id
  payload.helpful_count = 0

  let { error } = await supabase.from('reviews').insert(payload)
  // Fallback if sub-category columns haven't been added yet in DB
  if (error && error.message?.includes('food_rating')) {
    delete payload.food_rating
    delete payload.packaging_rating
    delete payload.delivery_rating
    const fallback = await supabase.from('reviews').insert(payload)
    error = fallback.error
  }
  if (error) throw error
}


