import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database.types'

export type ResolvedOptionItem = {
  id: string
  label: string
  price_delta: number
  is_default: boolean
  is_available: boolean
  is_cutoff_closed: boolean
  cutoff_note?: string | null
  linked_food_item_id?: string | null
}

export type ResolvedOptionGroup = Tables<'thali_option_groups'> & {
  options: ResolvedOptionItem[]
}

/**
 * Fetches and resolves dynamic option groups for a Thali food item.
 * Supports static choice options as well as daily-menu-driven Sabji choices,
 * checking real-time availability & overnight item-level cutoff times.
 */
export async function fetchThaliOptionGroups(
  foodItemId: string,
  selectedDate?: string,
): Promise<ResolvedOptionGroup[]> {
  // 1. Fetch Option Groups for this Thali
  const { data: groups, error: groupErr } = await supabase
    .from('thali_option_groups')
    .select('*, thali_option_items(*, food_items:linked_food_item_id(id, name, is_available, price, offer_price))')
    .eq('food_item_id', foodItemId)
    .eq('is_active', true)
    .order('display_order')

  if (groupErr || !groups) return []

  // Fetch global Thali components (Breads, Accompaniments, Sweets, Snacks)
  // These merge into static_choice groups of the matching category_type
  const { data: globalComponents } = await supabase
    .from('thali_components')
    .select('*, food_items(id, name, price, offer_price)')
    .order('display_order')
  const components = (globalComponents as any[]) || []

  // Local YYYY-MM-DD date (e.g. 2026-08-07)
  const localToday = new Date().toLocaleDateString('en-CA')
  const targetDate = selectedDate || localToday

  // 2. Fetch today's daily menu items to populate 'daily_menu_choice' groups
  let { data: dailyItems } = await supabase
    .from('daily_menu_items')
    .select('*, food_items(*, categories(id, name, category_type)), daily_menus!inner(menu_date, is_published)')
    .eq('daily_menus.menu_date', targetDate)
    .eq('daily_menus.is_published', true)
    .eq('is_available', true)
    .neq('is_thali_option', false)

  // Fallback: If no items found for targetDate, check for any published menu items
  if (!dailyItems || dailyItems.length === 0) {
    const { data: fallbackItems } = await supabase
      .from('daily_menu_items')
      .select('*, food_items(*, categories(id, name, category_type)), daily_menus!inner(menu_date, is_published)')
      .eq('daily_menus.is_published', true)
      .eq('is_available', true)
      .neq('is_thali_option', false)

    if (fallbackItems && fallbackItems.length > 0) {
      dailyItems = fallbackItems
    }
  }

  const resolvedGroups: ResolvedOptionGroup[] = []
  const now = new Date()

  for (const grp of groups) {
    const rawItems = (grp.thali_option_items || []).filter((i: Tables<'thali_option_items'>) => i.is_active)
    
    let resolvedOptions: ResolvedOptionItem[] = []

    if (grp.group_type === 'daily_menu_choice') {
      // Dynamically resolve options from published daily items
      if (dailyItems && dailyItems.length > 0) {
        const targetCategoryId = (grp as any).target_category_id
        const groupNameLower = grp.name.toLowerCase()

        const matchedItems = dailyItems.filter((di: any) => {
          // Primary check: Direct Category ID match
          if (targetCategoryId && di.food_items?.category_id === targetCategoryId) {
            return true
          }

          const catName = di.food_items?.categories?.name?.toLowerCase() || ''
          const itemName = di.food_items?.name?.toLowerCase() || ''
          const catType = di.food_items?.categories?.category_type || ''

          if (
            groupNameLower.includes('sabji') ||
            groupNameLower.includes('shabji') ||
            groupNameLower.includes('sabzi') ||
            groupNameLower.includes('subji') ||
            groupNameLower.includes('curry')
          ) {
            return (
              catType === 'sabji' ||
              catName.includes('sabji') ||
              catName.includes('shabji') ||
              catName.includes('sabzi') ||
              catName.includes('shaak') ||
              catName.includes('bhaji') ||
              itemName.includes('sabji') ||
              itemName.includes('shabji') ||
              itemName.includes('paneer') ||
              itemName.includes('aloo') ||
              itemName.includes('curry')
            )
          }

          if (
            groupNameLower.includes('roti') ||
            groupNameLower.includes('bread') ||
            groupNameLower.includes('bhakhri') ||
            groupNameLower.includes('puri')
          ) {
            return (
              catType === 'bread' ||
              catName.includes('bread') ||
              catName.includes('roti') ||
              catName.includes('bhakhri') ||
              catName.includes('puri') ||
              itemName.includes('roti') ||
              itemName.includes('bhakhri') ||
              itemName.includes('puri') ||
              itemName.includes('paratha')
            )
          }

          if (
            groupNameLower.includes('sweet') ||
            groupNameLower.includes('mithai') ||
            groupNameLower.includes('dessert')
          ) {
            return (
              catType === 'sweet' ||
              catName.includes('sweet') ||
              catName.includes('dessert') ||
              catName.includes('mithai') ||
              itemName.includes('halwa') ||
              itemName.includes('shrikhand')
            )
          }

          if (
            groupNameLower.includes('snack') ||
            groupNameLower.includes('farsan')
          ) {
            return (
              catType === 'snack' ||
              catName.includes('snack') ||
              catName.includes('farsan') ||
              itemName.includes('dhokla') ||
              itemName.includes('samosa')
            )
          }

          return false
        })

        resolvedOptions = matchedItems.map((dItem: any) => {
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
            linked_food_item_id: dItem.food_item_id,
          }
        })
      } else {
        // Fallback default options if daily menu isn't published yet
        resolvedOptions = rawItems.map((item: Tables<'thali_option_items'>) => ({
          id: item.id,
          label: item.label,
          price_delta: Number(item.price_delta || 0),
          is_default: item.is_default,
          is_available: item.is_active,
          is_cutoff_closed: false,
          linked_food_item_id: item.linked_food_item_id,
        }))
      }
    } else {
      // static_choice / optional_addon groups:
      // Render explicitly configured options for this group
      resolvedOptions = rawItems.map((item: any) => ({
        id: item.id,
        label: item.food_items?.name || item.label,
        price_delta: Number(item.price_delta || 0),
        is_default: item.is_default,
        is_available: item.food_items?.is_available ?? item.is_active,
        is_cutoff_closed: false,
        linked_food_item_id: item.linked_food_item_id,
      }))
    }

    resolvedGroups.push({
      ...grp,
      options: resolvedOptions.sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0)),
    })
  }

  return resolvedGroups
}
