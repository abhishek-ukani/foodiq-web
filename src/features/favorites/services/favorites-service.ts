import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database.types'

export type FavoriteListing = Tables<'favorites'> & {
  food_items: Tables<'food_items'> & { categories: Tables<'categories'> | null }
}

export async function fetchMyFavorites(): Promise<FavoriteListing[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('*, food_items(*, categories(*))')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as unknown as FavoriteListing[]
}

export async function fetchMyFavoriteIds(): Promise<string[]> {
  const { data, error } = await supabase.from('favorites').select('food_item_id')
  if (error) throw error
  return data.map((row) => row.food_item_id)
}

export async function addFavorite(userId: string, foodItemId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, food_item_id: foodItemId })
  if (error) throw error
}

export async function removeFavorite(foodItemId: string): Promise<void> {
  const { error } = await supabase.from('favorites').delete().eq('food_item_id', foodItemId)
  if (error) throw error
}
