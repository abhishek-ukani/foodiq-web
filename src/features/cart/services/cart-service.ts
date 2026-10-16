import { supabase } from '@/lib/supabase'
import type { Json, Tables } from '@/types/database.types'

export type CartItemWithFood = Tables<'cart_items'> & {
  food_items: Tables<'food_items'>
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
    .select('*, food_items(*), food_item_variants(*)')
    .order('created_at')
  if (error) throw error
  return data as unknown as CartItemWithFood[]
}

export async function addToCart(input: {
  food_item_id: string
  variant_id?: string | null
  quantity: number
  special_instructions?: string | null
  customizations?: SelectedCustomization[]
}): Promise<void> {
  const { data: session } = await supabase.auth.getUser()
  if (!session.user) throw new Error('Please sign in to add items to your cart.')

  // Verify food item is active and available for sale
  const { data: foodItem } = await supabase
    .from('food_items')
    .select('is_available, name')
    .eq('id', input.food_item_id)
    .single()

  if (foodItem && !foodItem.is_available) {
    throw new Error(`"${foodItem.name}" is currently disabled and unavailable.`)
  }

  const customizations = input.customizations ?? []
  const variantId = input.variant_id ?? null

  // A line is unique per (food item, variant, customization set); same dish with different
  // packaging or add-ons must stay as separate cart rows, not merge into one quantity.
  let query = supabase
    .from('cart_items')
    .select('id, quantity, customizations')
    .eq('user_id', session.user.id)
    .eq('food_item_id', input.food_item_id)
    .is('daily_menu_item_id', null)

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
    food_item_id: input.food_item_id,
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
