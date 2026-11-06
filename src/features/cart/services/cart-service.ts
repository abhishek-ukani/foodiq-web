import { supabase } from '@/lib/supabase'
import type { Json, Tables } from '@/types/database.types'

export type CartItemWithFood = Tables<'cart_items'> & {
  food_items: Tables<'food_items'>
  thalis?: Tables<'thalis'> | null
  food_item_variants?: Tables<'food_item_variants'> | null
}

export interface SelectedCustomization {
  id: string
  name: string
  price_delta: number
}

export function customizationsTotal(customizations: unknown): number {
  if (!Array.isArray(customizations)) return 0
  return customizations.reduce((sum: number, c) => {
    const delta = typeof c === 'object' && c !== null ? Number((c as { price_delta?: unknown }).price_delta) : 0
    return sum + (Number.isFinite(delta) ? delta : 0)
  }, 0)
}

function sameCustomizations(a: unknown, b: SelectedCustomization[]): boolean {
  const ids = Array.isArray(a) ? (a as SelectedCustomization[]).map((c) => c.id).sort() : []
  const otherIds = b.map((c) => c.id).sort()
  return JSON.stringify(ids) === JSON.stringify(otherIds)
}

export async function fetchCartItems(): Promise<CartItemWithFood[]> {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, food_items(*), thalis(*), food_item_variants(*)')
    .order('created_at')
  if (error) throw error

  // Normalize so any component reading item.food_items gets the item details even if it's a Thali
  const normalized = (data || []).map((row: any) => {
    if (!row.food_items && row.thalis) {
      return {
        ...row,
        food_items: {
          id: row.thalis.id,
          branch_id: row.thalis.branch_id || '',
          category_id: null,
          kind: 'thali',
          name: row.thalis.name,
          name_gujarati: row.thalis.name_gujarati,
          slug: row.thalis.slug,
          description: row.thalis.description,
          ingredients: null,
          food_type: 'veg',
          price: Number(row.thalis.price),
          compare_price: row.thalis.compare_price != null ? Number(row.thalis.compare_price) : null,
          cost_price: null,
          unit_label: '1 Thali',
          serves: row.thalis.serves,
          prep_minutes: row.thalis.prep_minutes,
          spice_level: 1,
          calories: null,
          nutrition: null,
          image_url: row.thalis.image_url,
          gallery_urls: row.thalis.gallery_urls,
          is_available: row.thalis.is_available,
          is_featured: row.thalis.is_featured,
          is_swaminarayan_available: row.thalis.is_swaminarayan_available,
          is_vaishnav_available: row.thalis.is_vaishnav_available,
          is_jain_available: row.thalis.is_jain_available,
          track_stock: false,
          stock_quantity: 999,
          rating_average: Number(row.thalis.rating_average || 4.8),
          rating_count: Number(row.thalis.rating_count || 0),
          total_sold: 0,
          display_order: row.thalis.display_order,
          product_code: null,
          created_at: row.thalis.created_at,
          updated_at: row.thalis.updated_at,
        },
      }
    }
    return row
  })

  return normalized as unknown as CartItemWithFood[]
}

export async function addToCart(input: {
  food_item_id?: string | null
  thali_id?: string | null
  variant_id?: string | null
  quantity: number
  special_instructions?: string | null
  customizations?: SelectedCustomization[]
}): Promise<void> {
  const { data: session } = await supabase.auth.getUser()
  if (!session.user) throw new Error('Please sign in to add items to your cart.')

  let effectiveFoodItemId = input.food_item_id ?? null
  let effectiveThaliId = input.thali_id ?? null

  // If only food_item_id was passed, check if it belongs to thalis
  if (effectiveFoodItemId && !effectiveThaliId) {
    const { data: maybeThali } = await supabase
      .from('thalis')
      .select('id, is_available, name')
      .eq('id', effectiveFoodItemId)
      .maybeSingle()

    if (maybeThali) {
      effectiveThaliId = maybeThali.id
      effectiveFoodItemId = null
      if (!maybeThali.is_available) {
        throw new Error(`"${maybeThali.name}" is currently disabled and unavailable.`)
      }
    }
  }

  if (effectiveFoodItemId) {
    const { data: foodItem } = await supabase
      .from('food_items')
      .select('is_available, name')
      .eq('id', effectiveFoodItemId)
      .single()

    if (foodItem && !foodItem.is_available) {
      throw new Error(`"${foodItem.name}" is currently disabled and unavailable.`)
    }
  }

  const customizations = input.customizations ?? []
  const variantId = input.variant_id ?? null

  let query = supabase
    .from('cart_items')
    .select('id, quantity, customizations')
    .eq('user_id', session.user.id)
    .is('daily_menu_item_id', null)

  if (effectiveThaliId) {
    query = query.eq('thali_id', effectiveThaliId)
  } else if (effectiveFoodItemId) {
    query = query.eq('food_item_id', effectiveFoodItemId)
  }

  if (variantId) {
    query = query.eq('variant_id', variantId)
  } else {
    query = query.is('variant_id', null)
  }

  const { data: existingRows, error: fetchError } = await query
  if (fetchError) throw fetchError

  const existing = existingRows?.find((row) => sameCustomizations(row.customizations, customizations))

  if (existing) {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + input.quantity })
      .eq('id', existing.id)
    if (error) throw error
    return
  }

  const { error } = await supabase.from('cart_items').insert({
    user_id: session.user.id,
    food_item_id: effectiveFoodItemId,
    thali_id: effectiveThaliId,
    variant_id: variantId,
    quantity: input.quantity,
    special_instructions: input.special_instructions ?? null,
    customizations: customizations as unknown as Json,
  })
  if (error) throw error
}

export async function updateCartItemQuantity(id: string, quantity: number): Promise<void> {
  const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', id)
  if (error) throw error
}

export async function removeCartItem(id: string): Promise<void> {
  const { error } = await supabase.from('cart_items').delete().eq('id', id)
  if (error) throw error
}

export async function clearCart(): Promise<void> {
  const { data: session } = await supabase.auth.getUser()
  if (!session.user) return
  const { error } = await supabase.from('cart_items').delete().eq('user_id', session.user.id)
  if (error) throw error
}
