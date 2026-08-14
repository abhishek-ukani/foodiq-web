import { supabase } from '@/lib/supabase'
import type { Database, PaymentMethod, Tables } from '@/types/database.types'

export async function fetchActiveDeliverySlots(): Promise<Tables<'delivery_slots'>[]> {
  const { data, error } = await supabase
    .from('delivery_slots')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  if (error) throw error
  return data
}

export async function fetchActiveUpiQr(): Promise<Tables<'upi_qr_codes'> | null> {
  const { data, error } = await supabase
    .from('upi_qr_codes')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

type PlaceOrderArgs = Database['public']['Functions']['place_order']['Args']

export async function placeOrder(input: {
  addressId: string
  deliveryDate: string
  deliverySlotId: string
  paymentMethod: PaymentMethod
  specialInstructions?: string | null
  paymentReference?: string | null
  /** Delivery fee in INR resolved by the resolve-delivery Edge Function. */
  deliveryCharge?: number
  /** Zone type from resolve-delivery (FREE / PAID / etc.) */
  zoneType?: string | null
}): Promise<Tables<'orders'>> {
  const args: PlaceOrderArgs = {
    p_address_id: input.addressId,
    p_delivery_date: input.deliveryDate,
    p_delivery_slot_id: input.deliverySlotId,
    p_payment_method: input.paymentMethod,
    p_special_instructions: input.specialInstructions ?? null,
    p_payment_reference: input.paymentReference ?? null,
    p_delivery_charge: input.deliveryCharge ?? 0,
    p_zone_type: input.zoneType ?? null,
  }
  const { data, error } = await supabase.rpc('place_order', args)
  if (error) throw error
  return data
}
