import { supabase } from '@/lib/supabase'
import type { PaymentMethod, Tables } from '@/types/database.types'

export async function fetchActiveDeliverySlots(): Promise<Tables<'delivery_slots'>[]> {
  const { data, error } = await supabase
    .from('delivery_slots')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  if (error) throw error
  return data
}


export async function placeOrder(input: {
  addressId: string
  deliveryDate: string
  deliverySlotId?: string | null
  paymentMethod: PaymentMethod
  specialInstructions?: string | null
  paymentReference?: string | null
  deliveryCharge?: number
  zoneType?: string | null
  isOutOfZone?: boolean
  zoneLabel?: string | null
  preferredLunchTime?: string | null
}): Promise<Tables<'orders'>> {
  const { data: session } = await supabase.auth.getUser()
  if (!session.user) throw new Error('Not authenticated')

  // Re-resolve today's default customizations for any thali items in cart
  const { data: cartItems } = await supabase
    .from('cart_items')
    .select('id, food_item_id, food_items(kind)')
    .eq('user_id', session.user.id)

  if (cartItems && cartItems.length > 0) {
    const { resolveThaliDefaults } = await import('@/features/checkout/services/resolve-thali-defaults')
    for (const item of cartItems) {
      const foodItem = item.food_items as unknown as { kind: string } | null
      if (foodItem?.kind === 'thali') {
        try {
          const freshDefaults = await resolveThaliDefaults(item.food_item_id)
          if (freshDefaults.length > 0) {
            await supabase
              .from('cart_items')
              .update({ customizations: freshDefaults as any })
              .eq('id', item.id)
          }
        } catch (e) {
          console.warn('Could not re-resolve thali defaults for item:', item.id, e)
        }
      }
    }
  }

  const args: any = {
    p_address_id: input.addressId,
    p_delivery_date: input.deliveryDate,
    p_delivery_slot_id: input.deliverySlotId ?? null,
    p_payment_method: input.paymentMethod,
    p_special_instructions: input.specialInstructions ?? null,
    p_payment_reference: input.paymentReference ?? null,
    p_delivery_charge: input.deliveryCharge ?? 0,
    p_zone_type: input.zoneType ?? null,
    p_is_out_of_zone: input.isOutOfZone ?? false,
    p_zone_label: input.zoneLabel ?? null,
    p_preferred_lunch_time: input.preferredLunchTime ?? null,
  }
  const { data, error } = await supabase.rpc('place_order', args)
  if (error) throw error
  return data
}
