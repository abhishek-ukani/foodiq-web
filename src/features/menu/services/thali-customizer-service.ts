import { supabase } from '@/lib/supabase'
import type { Tables, MealType } from '@/types/database.types'

export type ResolvedOptionItem = {
  id: string
  label: string
  price_delta: number
  is_default: boolean
  is_available: boolean
  is_cutoff_closed: boolean
  cutoff_note?: string | null
  food_item_id: string
  is_jain_available: boolean
  is_swaminarayan_available: boolean
}

export type ResolvedOptionGroup = Tables<'thali_option_groups'> & {
  categories?: Tables<'categories'> | null
  options: ResolvedOptionItem[]
}

export type ThaliFixedInclusion = {
  id: string
  quantity: number
  name: string
  food_item_id: string
}

export type ThaliDetail = Tables<'thalis'> & {
  fixed_inclusions: ThaliFixedInclusion[]
  option_groups: ResolvedOptionGroup[]
}

/**
 * Fetches all informative fixed inclusions for a Thali (e.g. 1x Dal-Bhat, 1x Papad, 1x Chhash).
 * Single source of truth for dish name is food_items.name.
 */
export async function fetchThaliFixedItems(thaliId: string): Promise<ThaliFixedInclusion[]> {
  const { data, error } = await supabase
    .from('thali_fixed_items')
    .select('*, food_items!inner(id, name, price)')
    .eq('thali_id', thaliId)
    .order('display_order')

  if (error) {
    console.warn('[Thali] Error fetching fixed items:', error)
    return []
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    quantity: row.quantity,
    name: row.food_items?.name || 'Included Item',
    food_item_id: row.food_item_id,
  }))
}

/**
 * Fetches all active Thalis from the dedicated thalis entity.
 */
export async function fetchAllActiveThalis(): Promise<Tables<'thalis'>[]> {
  const { data, error } = await supabase
    .from('thalis')
    .select('*')
    .eq('is_available', true)
    .order('display_order', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Fetches a single Thali by slug or UUID along with its fixed inclusions and option groups.
 */
export async function fetchThaliBySlug(slugOrId: string): Promise<ThaliDetail | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId)
  let query = supabase.from('thalis').select('*')
  if (isUuid) {
    query = query.or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
  } else {
    query = query.eq('slug', slugOrId)
  }

  const { data: thali, error } = await query.single()
  if (error || !thali) return null

  const [fixedItems, optionGroups] = await Promise.all([
    fetchThaliFixedItems(thali.id),
    fetchThaliOptionGroups(thali.id),
  ])

  return {
    ...thali,
    fixed_inclusions: fixedItems,
    option_groups: optionGroups,
  }
}

/**
 * Fetches and resolves dynamic option groups for a Thali.
 * 100% Relational: Queries strictly by target_category_id with ZERO string matching.
 */
export async function fetchThaliOptionGroups(
  thaliId: string,
  selectedDate?: string,
  mealType?: string,
): Promise<ResolvedOptionGroup[]> {
  // 1. Fetch Option Groups for this Thali
  const { data: rawGroups, error: groupErr } = await supabase
    .from('thali_option_groups')
    .select(
      '*, categories:target_category_id(id, name, slug, category_type), thali_option_items(*, food_items:food_item_id(id, name, is_available, price, is_jain_available, is_swaminarayan_available))',
    )
    .eq('thali_id', thaliId)
    .eq('is_active', true)
    .order('display_order')

  if (groupErr || !rawGroups) return []
  const groups = rawGroups as any[]

  // Local YYYY-MM-DD date
  const localToday = new Date().toLocaleDateString('en-CA')
  const targetDate = selectedDate || localToday

  // Resolve effective meal type context (lunch vs dinner)
  let effectiveMealType = mealType
  if (!effectiveMealType) {
    const { data: activeMenus } = await supabase
      .from('daily_menus')
      .select('meal_type, cutoff_time')
      .eq('menu_date', targetDate)
      .eq('is_published', true)

    if (activeMenus && activeMenus.length > 0) {
      const nowStr = new Date().toTimeString().substring(0, 5) // "HH:MM"
      const openMenu = activeMenus.find((m) => {
        const cutoff = m.cutoff_time || (m.meal_type === 'lunch' ? '10:00:00' : '18:00:00')
        return nowStr < cutoff.substring(0, 5)
      })
      effectiveMealType = openMenu ? (openMenu.meal_type as string) : (activeMenus[0].meal_type as string)
    } else {
      const currentHour = new Date().getHours()
      effectiveMealType = currentHour < 10 ? 'lunch' : 'dinner'
    }
  }

  // 2. Fetch today's daily menu items for groups that use daily menu source
  const hasDailyGroup = groups.some((g) => g.is_daily_menu_source)
  let dailyItems: any[] = []

  if (hasDailyGroup) {
    const { data: fetchedDaily } = await supabase
      .from('daily_menu_items')
      .select('*, food_items(*), daily_menus!inner(menu_date, is_published, meal_type)')
      .eq('daily_menus.menu_date', targetDate)
      .eq('daily_menus.meal_type', effectiveMealType as MealType)
      .eq('daily_menus.is_published', true)
      .eq('is_available', true)
      .neq('is_thali_option', false)

    dailyItems = fetchedDaily || []
  }

  const resolvedGroups: ResolvedOptionGroup[] = []
  const now = new Date()

  for (const grp of groups) {
    let resolvedOptions: ResolvedOptionItem[] = []

    if (grp.is_daily_menu_source) {
      // ✅ ZERO STRING GUESSING: Filter strictly by category foreign key
      const matchedDaily = dailyItems.filter(
        (di) => di.food_items?.category_id === grp.target_category_id,
      )

      resolvedOptions = matchedDaily.map((dItem: any) => {
        const food = dItem.food_items
        const isCutoffClosed = dItem.cutoff_time ? new Date(dItem.cutoff_time) < now : false

        return {
          id: dItem.id,
          label: food?.name || 'Daily Special',
          price_delta: dItem.price_override ? dItem.price_override - (food?.price || 0) : 0,
          is_default: false,
          is_available: dItem.is_available && !isCutoffClosed,
          is_cutoff_closed: isCutoffClosed,
          cutoff_note: dItem.cutoff_note,
          food_item_id: dItem.food_item_id,
          is_jain_available: food?.is_jain_available ?? true,
          is_swaminarayan_available: food?.is_swaminarayan_available ?? true,
        }
      })
    } else {
      // ✅ Static group: single source of truth for name is food_items.name
      const rawItems = (grp.thali_option_items || []).filter((i: any) => i.is_active)

      resolvedOptions = rawItems.map((item: any) => {
        const food = item.food_items
        return {
          id: item.id,
          label: food?.name || 'Option Item',
          price_delta: Number(item.price_delta || 0),
          is_default: item.is_default,
          is_available: food?.is_available ?? item.is_active,
          is_cutoff_closed: false,
          food_item_id: item.food_item_id,
          is_jain_available: food?.is_jain_available ?? true,
          is_swaminarayan_available: food?.is_swaminarayan_available ?? true,
        }
      })
    }

    resolvedGroups.push({
      ...grp,
      options: resolvedOptions.sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0)),
    })
  }

  return resolvedGroups
}
