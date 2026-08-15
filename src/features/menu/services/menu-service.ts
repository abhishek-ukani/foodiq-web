import { supabase } from '@/lib/supabase'
import dayjs from 'dayjs'
import type { MealType, Tables } from '@/types/database.types'

export type MenuListing = Tables<'daily_menu_items'> & {
  food_items: Tables<'food_items'> & { categories: Tables<'categories'> | null }
  daily_menus: { menu_date: string; is_published: boolean; meal_type: MealType; cutoff_time?: string | null }
  // Computed flags (set by fetchMenuForDate)
  is_sold_out?: boolean
  is_cutoff_passed?: boolean
}

/** Returns true if the item has hit its quantity cap. */
export function isSoldOut(listing: MenuListing): boolean {
  if (listing.available_quantity == null) return false
  return (listing.sold_quantity ?? 0) >= listing.available_quantity
}

/** Returns true if the per-item or daily menu cutoff time has passed. */
export function isCutoffPassed(listing: MenuListing): boolean {
  const cutoff = listing.cutoff_time || listing.daily_menus?.cutoff_time
  if (!cutoff) return false

  const nowStr = dayjs().format('HH:mm')
  const cutoffStr = cutoff.substring(0, 5)
  return nowStr >= cutoffStr
}

/** Published, available items across every meal for a given date — the customer's browseable menu. */
export async function fetchMenuForDate(date: string): Promise<MenuListing[]> {
  const { data: publishedMenus } = await supabase
    .from('daily_menus')
    .select('id, menu_date, is_published, meal_type, cutoff_time')
    .eq('menu_date', date)
    .eq('is_published', true)

  const { data: dailyItems, error } = await supabase
    .from('daily_menu_items')
    .select('*, food_items(*, categories(*)), daily_menus!inner(menu_date, is_published, meal_type, cutoff_time)')
    .eq('daily_menus.menu_date', date)
    .eq('daily_menus.is_published', true)
    .eq('is_available', true)
    .neq('is_standalone_sale', false)
    .order('display_order')

  if (error) throw error

  const listings = (dailyItems as unknown as MenuListing[]) || []

  // Fetch active Thalis for PUBLISHED MEALS ONLY
  const { data: thaliFoods } = await supabase
    .from('food_items')
    .select('*, categories(*)')
    .eq('kind', 'composite' as any)
    .eq('is_available', true)

  if (thaliFoods && thaliFoods.length > 0 && publishedMenus && publishedMenus.length > 0) {
    const existingThaliIds = new Set(listings.map((l) => l.food_item_id))

    for (const menuRecord of publishedMenus) {
      for (const thali of thaliFoods) {
        if (!existingThaliIds.has(thali.id)) {
          const syntheticListing: MenuListing = {
            id: `thali-${menuRecord.meal_type}-${thali.id}`,
            daily_menu_id: menuRecord.id,
            food_item_id: thali.id,
            price_override: null,
            available_quantity: null,
            sold_quantity: 0,
            is_available: true,
            is_special: false,
            is_standalone_sale: true,
            is_thali_option: true,
            cutoff_time: menuRecord.cutoff_time,
            cutoff_note: null,
            display_order: thali.display_order ?? 0,
            created_at: thali.created_at,
            updated_at: thali.updated_at,
            food_items: thali as any,
            daily_menus: {
              menu_date: date,
              is_published: true,
              meal_type: menuRecord.meal_type as MealType,
              cutoff_time: menuRecord.cutoff_time,
            },
          }
          listings.push(syntheticListing)
        }
      }
    }
  }

  return listings
}

export type ThaliComponent = Tables<'thali_items'> & { food_items: { name: string } | null }

export type FoodItemDetail = Tables<'food_items'> & {
  categories: Tables<'categories'> | null
  thali_items: ThaliComponent[]
  item_customizations: Tables<'item_customizations'>[]
}

export async function fetchFoodItemBySlug(slug: string): Promise<FoodItemDetail> {
  const { data, error } = await supabase
    .from('food_items')
    .select(
      '*, categories(*), thali_items!thali_items_thali_id_fkey(*, food_items!thali_items_food_item_id_fkey(name)), item_customizations(*)',
    )
    .eq('slug', slug)
    .eq('item_customizations.is_active', true)
    .single()
  if (error) throw error
  const item = data as unknown as FoodItemDetail
  return {
    ...item,
    thali_items: [...item.thali_items].sort((a, b) => a.display_order - b.display_order),
    item_customizations: [...item.item_customizations].sort(
      (a, b) => a.display_order - b.display_order,
    ),
  }
}

export type { MealType }
