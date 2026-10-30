import { supabase } from '@/lib/supabase'
import dayjs from 'dayjs'
import { fetchThaliOptionGroups, type ResolvedOptionGroup } from '@/features/menu/services/thali-customizer-service'
import { placeOrder } from '@/features/checkout/services/checkout-service'
import { resolveDeliveryCharge, type DeliveryResolutionResult } from '@/features/checkout/services/delivery-charge-resolver'
import { fetchAddresses } from '@/features/addresses/services/addresses-service'
import { fetchDeliveryAreas, fetchDeliveryFeeRules, fetchKitchenLocation } from '@/features/addresses/services/delivery-zone-service'
import type { Json, MealType, Tables } from '@/types/database.types'

export interface ThaliFoodItem extends Tables<'food_items'> {
  food_item_variants?: Tables<'food_item_variants'>[]
  categories?: Tables<'categories'> | null
}

type JoinedFoodItem = Tables<'food_items'> & {
  categories?: Tables<'categories'> | null
}

export interface QuickAddonItem {
  id: string
  name: string
  price: number
  description?: string | null
  category?: string
  image_url?: string | null
}


export interface QuickOrderContext {
  profile: Tables<'profiles'>
  addresses: Tables<'addresses'>[]
  defaultAddress: Tables<'addresses'> | null
  deliveryResolution: DeliveryResolutionResult
  thaliList: ThaliFoodItem[]
  selectedThali: ThaliFoodItem | null
  recentThaliId: string | null
  favoriteThaliId: string | null
  orderCounts: Record<string, number>
  resolvedGroups: ResolvedOptionGroup[]
  sabjiGroups: ResolvedOptionGroup[]
  breadGroups: ResolvedOptionGroup[]
  otherGroups: ResolvedOptionGroup[]
  availableAddOns: QuickAddonItem[]
  todayDate: string
}

export function isBreadOptionGroup(group: { name: string; target_category_type?: string | null }): boolean {
  const name = group.name.toLowerCase()
  if (
    name.includes('bread') ||
    name.includes('roti') ||
    name.includes('rotli') ||
    name.includes('bhakhri') ||
    name.includes('bhakhari') ||
    name.includes('rotla') ||
    name.includes('puri') ||
    name.includes('thepla') ||
    name.includes('paratha')
  ) {
    return true
  }
  return group.target_category_type === 'bread'
}

export function isAddOnOptionGroup(group: { name: string; group_type?: string | null }): boolean {
  if (group.group_type === 'optional_addon') return true
  const name = group.name.toLowerCase()
  return name.includes('add-on') || name.includes('addon') || name.includes('extra')
}

export function isSabjiOptionGroup(group: {
  name: string
  target_category_type?: string | null
  group_type?: string | null
}): boolean {
  // Bread and Add-on groups must NEVER be classified as Sabji groups
  if (isBreadOptionGroup(group) || isAddOnOptionGroup(group)) {
    return false
  }

  const name = group.name.toLowerCase()

  // Explicit non-sabji categories
  if (
    name.includes('accompaniment') ||
    name.includes('snack') ||
    name.includes('farsan') ||
    name.includes('sweet') ||
    name.includes('mithai') ||
    name.includes('dessert') ||
    name.includes('rice') ||
    name.includes('bhat') ||
    name.includes('dal') ||
    name.includes('beverage') ||
    name.includes('chaas') ||
    name.includes('chhas')
  ) {
    return false
  }

  if (
    name.includes('sabji') ||
    name.includes('shabji') ||
    name.includes('sabzi') ||
    name.includes('subji') ||
    name.includes('shaak') ||
    name.includes('curry') ||
    name.includes('bhaji')
  ) {
    return true
  }

  return group.target_category_type === 'sabji'
}

type OrderWithRawItems = {
  id: string
  placed_at: string
  order_items: Array<{
    food_item_id: string | null
    item_kind: string
    item_name: string
    quantity: number
  }>
}

/**
 * Loads the user's order history to identify their most recent and most frequent Thali meal.
 */
export async function getCustomerThaliPreferences(userId: string): Promise<{
  recentThaliId: string | null
  favoriteThaliId: string | null
  orderCounts: Record<string, number>
}> {
  const { data: rawOrders } = await supabase
    .from('orders')
    .select('id, placed_at, order_items(food_item_id, item_kind, item_name, quantity)')
    .eq('user_id', userId)
    .order('placed_at', { ascending: false })
    .limit(25)

  const orders = (rawOrders || []) as unknown as OrderWithRawItems[]

  if (!orders || orders.length === 0) {
    return { recentThaliId: null, favoriteThaliId: null, orderCounts: {} }
  }

  const orderCounts: Record<string, number> = {}
  let recentThaliId: string | null = null

  for (const order of orders) {
    const items = order.order_items || []
    for (const item of items) {
      if (item.food_item_id && (item.item_kind === 'thali' || item.item_name.toLowerCase().includes('thali'))) {
        if (!recentThaliId) {
          recentThaliId = item.food_item_id
        }
        orderCounts[item.food_item_id] = (orderCounts[item.food_item_id] || 0) + (item.quantity || 1)
      }
    }
  }

  let favoriteThaliId = recentThaliId
  let maxCount = 0
  for (const [id, count] of Object.entries(orderCounts)) {
    if (count > maxCount) {
      maxCount = count
      favoriteThaliId = id
    }
  }

  return { recentThaliId, favoriteThaliId, orderCounts }
}

/**
 * Fetches all active Thali meal items from catalog.
 */
export async function fetchActiveThalis(): Promise<ThaliFoodItem[]> {
  const { data, error } = await supabase
    .from('food_items')
    .select('*, categories(*), food_item_variants(*)')
    .eq('kind', 'thali')
    .eq('is_available', true)
    .order('display_order', { ascending: true })

  if (error) throw error
  return (data || []) as unknown as ThaliFoodItem[]
}

/**
 * Fetches full direct-order context for the current user and specified meal slot.
 */
export async function fetchQuickOrderContext(
  targetThaliId?: string | null,
  mealType: MealType = 'lunch',
  selectedAddressId?: string | null,
): Promise<QuickOrderContext> {
  const { data: session } = await supabase.auth.getUser()
  if (!session.user) {
    throw new Error('Not authenticated')
  }

  // 1. Fetch Profile
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (profileErr || !profile) {
    throw new Error('Could not load user profile')
  }

  // 2. Fetch Addresses & Delivery Resolution
  const [addresses, areas, feeRules, kitchenLoc, thalis, preferences] = await Promise.all([
    fetchAddresses(),
    fetchDeliveryAreas(),
    fetchDeliveryFeeRules(),
    fetchKitchenLocation(),
    fetchActiveThalis(),
    getCustomerThaliPreferences(session.user.id),
  ])

  // Resolve active delivery address
  let activeAddress: Tables<'addresses'> | null = null
  if (selectedAddressId) {
    activeAddress = addresses.find((a) => a.id === selectedAddressId) || null
  }
  if (!activeAddress) {
    activeAddress = addresses.find((a) => a.is_default) || addresses[0] || null
  }

  const deliveryResolution = resolveDeliveryCharge(activeAddress, areas, feeRules, kitchenLoc)

  // Determine active Thali
  const effectiveThaliId =
    targetThaliId ||
    preferences.recentThaliId ||
    preferences.favoriteThaliId ||
    thalis[0]?.id ||
    null

  const selectedThali = thalis.find((t) => t.id === effectiveThaliId) || thalis[0] || null

  const todayDate = dayjs().format('YYYY-MM-DD')

  // Resolve option groups for selected Thali
  let resolvedGroups: ResolvedOptionGroup[] = []
  if (selectedThali) {
    resolvedGroups = await fetchThaliOptionGroups(selectedThali.id, todayDate, mealType)
  }

  const sabjiGroups = resolvedGroups.filter((g) => isSabjiOptionGroup(g))
  const breadGroups = resolvedGroups.filter((g) => isBreadOptionGroup(g))
  const otherGroups = resolvedGroups.filter(
    (g) => !isSabjiOptionGroup(g) && !isBreadOptionGroup(g) && !isAddOnOptionGroup(g),
  )

  // Fetch Add-ons dynamically from admin sources (NO static defaults)
  const availableAddOns: QuickAddonItem[] = []
  const seenIds = new Set<string>()
  const seenNames = new Set<string>()

  // 1. Add-on option groups configured for this Thali in Admin (e.g. "Add-Ons", "Extras")
  const addonGroups = resolvedGroups.filter((g) => isAddOnOptionGroup(g))
  for (const grp of addonGroups) {
    for (const opt of grp.options) {
      if (!opt.is_available || opt.is_cutoff_closed) continue
      const nameKey = opt.label.toLowerCase().trim()
      if (seenNames.has(nameKey)) continue

      seenIds.add(opt.id)
      seenNames.add(nameKey)
      availableAddOns.push({
        id: opt.id,
        name: opt.label,
        price: Number(opt.price_delta || 0),
        description: opt.cutoff_note || null,
        category: 'Thali Extras',
      })
    }
  }

  // 2. Global Thali Components configured by Admin (beverage, sweet, snack, accompaniment)
  try {
    const { data: components } = await supabase
      .from('thali_components')
      .select('*, food_items(*, categories(*))')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (components && components.length > 0) {
      for (const comp of components) {
        const fi = comp.food_items as unknown as JoinedFoodItem | null
        if (!fi || !fi.is_available || fi.kind === 'thali') continue

        const nameKey = fi.name.toLowerCase().trim()
        if (seenNames.has(nameKey)) continue

        if (
          comp.category_type === 'beverage' ||
          comp.category_type === 'sweet' ||
          comp.category_type === 'snack' ||
          comp.category_type === 'accompaniment'
        ) {
          seenIds.add(fi.id)
          seenNames.add(nameKey)
          const catLabel =
            fi.categories?.name ||
            (comp.category_type ? comp.category_type.charAt(0).toUpperCase() + comp.category_type.slice(1) : 'Extras')
          availableAddOns.push({
            id: fi.id,
            name: fi.name,
            price: Number(fi.price || 0),
            description: fi.description || null,
            category: catLabel,
            image_url: fi.image_url || null,
          })
        }
      }
    }
  } catch (err) {
    console.warn('Could not load thali components for add-ons:', err)
  }

  // 3. Standalone daily menu items for today published by admin
  try {
    const { data: standaloneItems } = await supabase
      .from('daily_menu_items')
      .select('*, food_items(*, categories(*)), daily_menus!inner(menu_date, is_published, meal_type)')
      .eq('daily_menus.menu_date', todayDate)
      .eq('daily_menus.meal_type', mealType)
      .eq('daily_menus.is_published', true)
      .eq('is_available', true)
      .eq('is_standalone_sale', true)

    if (standaloneItems && standaloneItems.length > 0) {
      for (const item of standaloneItems) {
        const fi = item.food_items as unknown as JoinedFoodItem | null
        if (!fi || !fi.is_available || fi.kind === 'thali') continue

        const nameKey = fi.name.toLowerCase().trim()
        if (seenNames.has(nameKey)) continue

        seenIds.add(fi.id)
        seenNames.add(nameKey)
        availableAddOns.push({
          id: fi.id,
          name: fi.name,
          price: Number(item.price_override ?? fi.price ?? 0),
          description: fi.description || null,
          category: fi.categories?.name || 'Today’s Special',
          image_url: fi.image_url || null,
        })
      }
    }
  } catch (err) {
    console.warn('Could not load standalone daily items for add-ons:', err)
  }

  return {
    profile,
    addresses,
    defaultAddress: activeAddress,
    deliveryResolution,
    thaliList: thalis,
    selectedThali,
    recentThaliId: preferences.recentThaliId,
    favoriteThaliId: preferences.favoriteThaliId,
    orderCounts: preferences.orderCounts,
    resolvedGroups,
    sabjiGroups,
    breadGroups,
    otherGroups,
    availableAddOns,
    todayDate,
  }
}

export interface SubmitQuickOrderInput {
  thaliId: string
  variantId?: string | null
  quantity: number
  addressId: string
  deliveryDate: string
  mealType: MealType
  specialInstructions?: string | null
  customizations: {
    id: string
    name: string
    price_delta: number
    group_name?: string
  }[]
  deliveryCharge: number
  isOutOfZone: boolean
  zoneType: string
  zoneLabel: string
}

/**
 * Places a direct 1-step order for the regular active user.
 */
export async function submitQuickOrder(input: SubmitQuickOrderInput): Promise<Tables<'orders'>> {
  const { data: session } = await supabase.auth.getUser()
  if (!session.user) {
    throw new Error('You must be signed in to place an order.')
  }

  // 1. Clear any stale cart items for this user to ensure clean 1-item direct order
  await supabase.from('cart_items').delete().eq('user_id', session.user.id)

  // 2. Insert the direct configured Thali item into cart_items
  const { error: insertErr } = await supabase.from('cart_items').insert({
    user_id: session.user.id,
    food_item_id: input.thaliId,
    variant_id: input.variantId ?? null,
    quantity: input.quantity,
    special_instructions: input.specialInstructions?.trim() || null,
    customizations: input.customizations as unknown as Json,
  })

  if (insertErr) {
    throw new Error(`Failed to initialize direct order: ${insertErr.message}`)
  }

  // 3. Place order via the atomic place_order RPC
  const createdOrder = await placeOrder({
    addressId: input.addressId,
    deliveryDate: input.deliveryDate,
    deliverySlotId: null,
    paymentMethod: 'cash',
    deliveryCharge: input.deliveryCharge,
    specialInstructions: input.specialInstructions?.trim() || null,
    isOutOfZone: input.isOutOfZone,
    zoneType: input.zoneType,
    zoneLabel: input.zoneLabel,
  })

  return createdOrder
}
