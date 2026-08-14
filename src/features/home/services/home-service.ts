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
  const { data, error } = await supabase.from('categories').select('*').order('display_order')
  if (error) throw error
  return data
}

export type SpecialMenuItem = Tables<'daily_menu_items'> & {
  food_items: Tables<'food_items'> | null
}

/** Items flagged `is_special` on today's published menu, across all meals. */
export async function fetchTodaysSpecial(): Promise<SpecialMenuItem[]> {
  const today = dayjs().format('YYYY-MM-DD')
  const { data, error } = await supabase
    .from('daily_menu_items')
    .select('*, food_items(*), daily_menus!inner(menu_date, is_published)')
    .eq('daily_menus.menu_date', today)
    .eq('daily_menus.is_published', true)
    .eq('is_special', true)
    .eq('is_available', true)
    .order('display_order')
  if (error) throw error
  return data as unknown as SpecialMenuItem[]
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

export async function fetchDeliveryAreas(): Promise<Tables<'delivery_areas'>[]> {
  const { data, error } = await supabase
    .from('delivery_areas')
    .select('*')
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data
}
