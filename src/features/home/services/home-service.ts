import dayjs from 'dayjs'
import { supabase } from '@/lib/supabase'
import type { BannerPlacement, Tables } from '@/types/database.types'

export async function fetchBanners(placement: BannerPlacement): Promise<Tables<'banners'>[]> {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('placement', placement)
    .order('display_order')
  if (error) throw error
  return data
}

export async function fetchTestimonials(): Promise<Tables<'testimonials'>[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('display_order')
    .limit(9)
  if (error) throw error
  return data
}

export async function fetchCategories(): Promise<Tables<'categories'>[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  if (error) throw error
  return data || []
}

export type SpecialMenuItem = Tables<'daily_menu_items'> & {
  food_items: Tables<'food_items'> | null
}

/** Items flagged `is_special` on today's menu, across all meals. */
export async function fetchTodaysSpecial(): Promise<SpecialMenuItem[]> {
  const today = dayjs().format('YYYY-MM-DD')

  // 1. Try published menus first
  const { data: publishedData, error: pubError } = await supabase
    .from('daily_menu_items')
    .select('*, food_items(*), daily_menus!inner(menu_date, is_published)')
    .eq('daily_menus.menu_date', today)
    .eq('daily_menus.is_published', true)
    .eq('is_special', true)
    .eq('is_available', true)
    .order('display_order')

  if (pubError) throw pubError

  let rawList = (publishedData as unknown as SpecialMenuItem[]) || []

  // 2. If no published specials, fall back to today's active menu items marked special
  if (rawList.length === 0) {
    const { data: draftData, error: draftError } = await supabase
      .from('daily_menu_items')
      .select('*, food_items(*), daily_menus!inner(menu_date, is_published)')
      .eq('daily_menus.menu_date', today)
      .eq('is_special', true)
      .eq('is_available', true)
      .order('display_order')

    if (!draftError && draftData && draftData.length > 0) {
      rawList = draftData as unknown as SpecialMenuItem[]
    }
  }

  // Filter out any items with missing or unavailable food items
  const validList = rawList.filter(
    (item) => item.food_items && item.food_items.is_available !== false,
  )

  // Deduplicate by food item ID so dishes spanning lunch & dinner only show once
  const seenFoodIds = new Set<string>()
  const uniqueItems: SpecialMenuItem[] = []
  for (const item of validList) {
    const foodId = item.food_item_id || item.food_items?.id
    if (foodId && !seenFoodIds.has(foodId)) {
      seenFoodIds.add(foodId)
      uniqueItems.push(item)
    }
  }

  return uniqueItems
}

export async function fetchAllActiveItems(): Promise<Tables<'food_items'>[]> {
  const { data, error } = await supabase
    .from('food_items')
    .select('*')
    .eq('is_available', true)
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}

export async function fetchPopularItems(limit = 6): Promise<Tables<'food_items'>[]> {
  const { data, error } = await supabase
    .from('food_items')
    .select('*')
    .eq('is_available', true)
    .order('total_sold', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}
