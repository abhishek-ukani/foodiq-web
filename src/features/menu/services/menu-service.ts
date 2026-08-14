import { supabase } from '@/lib/supabase'
import type { MealType, Tables } from '@/types/database.types'

export type MenuListing = Tables<'daily_menu_items'> & {
  food_items: Tables<'food_items'> & { categories: Tables<'categories'> | null }
  daily_menus: { menu_date: string; is_published: boolean; meal_type: MealType }
  // Computed flags (set by fetchMenuForDate)
  is_sold_out?: boolean
  is_cutoff_passed?: boolean
}

/** Returns true if the item has hit its quantity cap. */
export function isSoldOut(listing: MenuListing): boolean {
  if (listing.available_quantity == null) return false
  return (listing.sold_quantity ?? 0) >= listing.available_quantity
}

/** Returns true if the per-item cutoff has passed (IST). */
export function isCutoffPassed(listing: MenuListing): boolean {
  if (!listing.cutoff_time) return false
  const now = new Date().toLocaleTimeString('en-IN', { hour12: false, timeZone: 'Asia/Kolkata' })
  return now > listing.cutoff_time
}

/** Published, available items across every meal for a given date — the customer's browseable menu. */
export async function fetchMenuForDate(date: string): Promise<MenuListing[]> {
  const { data: dailyItems, error } = await supabase
    .from('daily_menu_items')
    .select('*, food_items(*, categories(*)), daily_menus!inner(menu_date, is_published, meal_type)')
    .eq('daily_menus.menu_date', date)
    .eq('daily_menus.is_published', true)
    .eq('is_available', true)
    .neq('is_standalone_sale', false)
    .order('display_order')

  if (error) throw error

  const listings = (dailyItems as unknown as MenuListing[]) || []

  // Fetch active Thalis so Thalis are always visible & orderable on customer menu
  const { data: thaliFoods } = await supabase
    .from('food_items')
    .select('*, categories(*)')
    .eq('kind', 'composite')
    .eq('is_available', true)

  if (thaliFoods && thaliFoods.length > 0) {
    const existingThaliIds = new Set(listings.map((l) => l.food_item_id))

    for (const thali of thaliFoods) {
      if (!existingThaliIds.has(thali.id)) {
        const syntheticListingLunch: MenuListing = {
          id: `thali-lunch-${thali.id}`,
          daily_menu_id: 'default-menu',
          food_item_id: thali.id,
          price_override: null,
          available_quantity: null,
          sold_quantity: 0,
          is_available: true,
          is_special: false,
          cutoff_time: null,
          cutoff_note: null,
          display_order: thali.display_order ?? 0,
          created_at: thali.created_at,
          updated_at: thali.updated_at,
          food_items: thali as any,
          daily_menus: {
            menu_date: date,
            is_published: true,
            meal_type: 'lunch',
          },
        }
        const syntheticListingDinner: MenuListing = {
          ...syntheticListingLunch,
          id: `thali-dinner-${thali.id}`,
          daily_menus: {
            menu_date: date,
            is_published: true,
            meal_type: 'dinner',
          },
        }
        listings.push(syntheticListingLunch, syntheticListingDinner)
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
