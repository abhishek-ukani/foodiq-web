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
  // All-time 24/7 retail products (farsan, sweets, snacks/nasta, beverages) never expire due to daily meal cutoff!
  const catType = (listing.food_items as any)?.categories?.category_type
  const catSlug = ((listing.food_items as any)?.categories?.slug || '').toLowerCase()
  const isAlwaysAvailable =
    listing.food_items?.kind === 'single' &&
    (catType === 'snack' ||
      catType === 'beverage' ||
      catType === 'sweet' ||
      catSlug.includes('snack') ||
      catSlug.includes('farsan') ||
      catSlug.includes('nasta') ||
      catSlug.includes('sweet') ||
      catSlug.includes('beverage') ||
      catSlug.includes('add-on'))

  if (isAlwaysAvailable) {
    return false
  }

  const menuDate = listing.daily_menus?.menu_date
  const todayStr = dayjs().format('YYYY-MM-DD')

  // 1. Future dates: pre-orders are always open
  if (menuDate && dayjs(menuDate).isAfter(todayStr, 'day')) {
    return false
  }

  // 2. Past dates: archived
  if (menuDate && dayjs(menuDate).isBefore(todayStr, 'day')) {
    return true
  }

  // 3. Today: evaluate cutoff time
  const cutoff = listing.cutoff_time || listing.daily_menus?.cutoff_time
  if (!cutoff) return false

  const nowStr = dayjs().format('HH:mm')
  const cutoffStr = cutoff.substring(0, 5)
  return nowStr >= cutoffStr
}

/** Published, available items across meals for a given date — optionally filtered by meal slot (lunch/dinner). */
export async function fetchMenuForDate(date: string, mealType?: MealType): Promise<MenuListing[]> {
  let menusQuery = supabase
    .from('daily_menus')
    .select('id, menu_date, is_published, meal_type, cutoff_time')
    .eq('menu_date', date)
    .eq('is_published', true)

  if (mealType) {
    menusQuery = menusQuery.eq('meal_type', mealType)
  }

  const { data: publishedMenus } = await menusQuery

  let dailyQuery = supabase
    .from('daily_menu_items')
    .select('*, food_items(*, categories(*)), daily_menus!inner(menu_date, is_published, meal_type, cutoff_time)')
    .eq('daily_menus.menu_date', date)
    .eq('daily_menus.is_published', true)
    .eq('is_available', true)
    .neq('is_standalone_sale', false)

  if (mealType) {
    dailyQuery = dailyQuery.eq('daily_menus.meal_type', mealType)
  }

  const { data: dailyItems, error } = await dailyQuery.order('display_order')

  if (error) throw error

  const listings = ((dailyItems as unknown as MenuListing[]) || []).filter(
    (l) => l.is_available && (l.food_items as any)?.is_available !== false,
  )

  // Fetch active Thalis for the requested published meals
  const { data: thaliFoods } = await supabase
    .from('food_items')
    .select('*, categories(*)')
    .eq('kind', 'thali')
    .eq('is_available', true)

  if (thaliFoods && thaliFoods.length > 0 && publishedMenus && publishedMenus.length > 0) {
    const existingThaliKeys = new Set(listings.map((l) => `${l.daily_menus?.meal_type}-${l.food_item_id}`))

    for (const menuRecord of publishedMenus) {
      for (const thali of thaliFoods) {
        const key = `${menuRecord.meal_type}-${thali.id}`
        if (!existingThaliKeys.has(key)) {
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

  // Fetch All-Time Store Products (Farsan, Sweets, Nasta, Snacks, Beverages, Add-ons)
  // Only include items that are active and enabled for sale (is_available = true)
  const { data: storeFoods } = await supabase
    .from('food_items')
    .select('*, categories(*)')
    .eq('kind', 'single')
    .eq('is_available', true)
    .order('display_order', { ascending: true })

  if (storeFoods && storeFoods.length > 0) {
    const existingItemIds = new Set(listings.map((l) => l.food_item_id))

    for (const storeItem of storeFoods as unknown as AlwaysAvailableItem[]) {
      const catType = (storeItem.categories?.category_type || '').toLowerCase()
      const catSlug = (storeItem.categories?.slug || '').toLowerCase()
      const isStoreCategory =
        catType === 'snack' ||
        catType === 'beverage' ||
        catType === 'sweet' ||
        catSlug.includes('snack') ||
        catSlug.includes('farsan') ||
        catSlug.includes('nasta') ||
        catSlug.includes('beverage') ||
        catSlug.includes('sweet') ||
        catSlug.includes('add-on')

      if (isStoreCategory && !existingItemIds.has(storeItem.id) && storeItem.is_available) {
        const syntheticListing: MenuListing = {
          id: `store-prod-${storeItem.id}`,
          daily_menu_id: publishedMenus?.[0]?.id || `store-${date}`,
          food_item_id: storeItem.id,
          price_override: null,
          available_quantity: storeItem.track_stock ? storeItem.stock_quantity : null,
          sold_quantity: 0,
          is_available: storeItem.is_available,
          is_special: storeItem.is_featured ?? false,
          is_standalone_sale: true,
          is_thali_option: false,
          cutoff_time: null,
          cutoff_note: null,
          display_order: storeItem.display_order ?? 0,
          created_at: storeItem.created_at,
          updated_at: storeItem.updated_at,
          food_items: storeItem as any,
          daily_menus: {
            menu_date: date,
            is_published: true,
            meal_type: (mealType || 'lunch') as MealType,
            cutoff_time: null,
          },
        }
        listings.push(syntheticListing)
        existingItemIds.add(storeItem.id)
      }
    }
  }

  return listings
}

export type AlwaysAvailableItem = Tables<'food_items'> & {
  categories: Tables<'categories'> | null
}

/** Non-meal items (farsan, snacks, nasta, sweets, beverages) available anytime (24x7). */
export async function fetchAlwaysAvailableItems(): Promise<AlwaysAvailableItem[]> {
  const { data, error } = await supabase
    .from('food_items')
    .select('*, categories(*)')
    .eq('is_available', true)
    .eq('kind', 'single')
    .order('display_order', { ascending: true })

  if (error) throw error
  if (!data) return []

  return (data as unknown as AlwaysAvailableItem[]).filter((item) => {
    const catType = item.categories?.category_type
    const catSlug = item.categories?.slug || ''
    return (
      catType === 'snack' ||
      catType === 'beverage' ||
      catType === 'sweet' ||
      catSlug.includes('snack') ||
      catSlug.includes('farsan') ||
      catSlug.includes('nasta') ||
      catSlug.includes('beverage') ||
      catSlug.includes('sweet')
    )
  })
}

export async function fetchDailyMenuSlots(date: string) {
  const { data, error } = await supabase
    .from('daily_menus')
    .select('id, menu_date, is_published, meal_type, cutoff_time, title, note')
    .eq('menu_date', date)
    .eq('is_published', true)

  if (error) throw error
  return data || []
}

/** Active categories from admin, ordered by display_order. */
export async function fetchActiveCategories(): Promise<Tables<'categories'>[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) throw error
  return data || []
}

export type ThaliComponent = Tables<'thali_items'> & { food_items: { name: string } | null }

export type FoodItemDetail = Tables<'food_items'> & {
  categories: Tables<'categories'> | null
  thali_items: ThaliComponent[]
  item_customizations: Tables<'item_customizations'>[]
  food_item_variants: Tables<'food_item_variants'>[]
}

export async function fetchFoodItemBySlug(slug: string): Promise<FoodItemDetail> {
  const { data, error } = await supabase
    .from('food_items')
    .select(
      '*, categories(*), thali_items!thali_items_thali_id_fkey(*, food_items!thali_items_food_item_id_fkey(name)), item_customizations(*), food_item_variants(*)',
    )
    .eq('slug', slug)
    .single()
  if (error) throw error
  const item = data as unknown as FoodItemDetail
  const activeCustomizations = (item.item_customizations || []).filter((c) => c.is_active !== false)
  const activeVariants = (item.food_item_variants || [])
    .filter((v) => v.is_active !== false)
    .sort((a, b) => a.display_order - b.display_order || a.price - b.price)

  return {
    ...item,
    thali_items: [...(item.thali_items || [])].sort((a, b) => a.display_order - b.display_order),
    item_customizations: [...activeCustomizations].sort(
      (a, b) => a.display_order - b.display_order,
    ),
    food_item_variants: activeVariants,
  }
}

export type { MealType }
