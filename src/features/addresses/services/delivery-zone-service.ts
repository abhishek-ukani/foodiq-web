import { supabase } from '@/lib/supabase'
import { DEFAULT_KITCHEN_LOCATION } from '@/constants'
import type { Tables } from '@/types/database.types'
import type { DeliverySettings } from '@/types/delivery'

export type KitchenLocation = { lat: number; lng: number }

export async function fetchDeliveryAreas(): Promise<Tables<'delivery_areas'>[]> {
  const { data, error } = await supabase
    .from('delivery_areas')
    .select('*')
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data
}

export async function fetchDeliveryFeeRules(): Promise<Tables<'delivery_fee_rules'>[]> {
  const { data, error } = await supabase
    .from('delivery_fee_rules')
    .select('*')
    .eq('is_active', true)
    .order('min_distance_km', { ascending: true })
  if (error) throw error
  return data
}

export async function fetchKitchenLocation(): Promise<KitchenLocation> {
  const { data, error } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', 'kitchen_location')
    .maybeSingle()

  if (error || !data?.value) {
    return { ...DEFAULT_KITCHEN_LOCATION }
  }

  const val = data.value as any
  const lat = Number(val.lat)
  const lng = Number(val.lng)

  // Legacy kitchen check: If coordinates are invalid or point to the old Gota location (lat > 23.08),
  // immediately use the canonical Bodakdev kitchen (Sarita Apartments, 380015) and sync system_config
  if (!lat || !lng || isNaN(lat) || isNaN(lng) || (lat > 23.08 && lat < 23.15)) {
    console.warn('[FoodIQ:Kitchen] Legacy or invalid kitchen coordinates in system_config. Using Sarita Apts, Bodakdev:', DEFAULT_KITCHEN_LOCATION)
    Promise.resolve(
      supabase
        .from('system_config')
        .update({ value: { lat: DEFAULT_KITCHEN_LOCATION.lat, lng: DEFAULT_KITCHEN_LOCATION.lng } })
        .eq('key', 'kitchen_location')
    ).then(() => {
      console.log('[FoodIQ:Kitchen] Successfully updated system_config to Bodakdev kitchen.')
    }).catch((err: unknown) => {
      console.debug('[FoodIQ:Kitchen] Could not update system_config:', err)
    })
    return { ...DEFAULT_KITCHEN_LOCATION }
  }

  return { lat, lng }
}

export async function fetchDeliverySettings(): Promise<DeliverySettings | null> {
  const { data, error } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', 'delivery_settings')
    .maybeSingle()

  if (error || !data?.value) {
    return null
  }

  const val = data.value as any
  return {
    zone_a_pincodes: Array.isArray(val.zone_a_pincodes) ? val.zone_a_pincodes : [],
    zone_b_pincodes: Array.isArray(val.zone_b_pincodes) ? val.zone_b_pincodes : [],
    zone_b_enabled: val.zone_b_enabled ?? true,
    free_delivery_radius_km: Number(val.free_delivery_radius_km ?? 0),
    base_delivery_fee: Number(val.base_delivery_fee ?? 0),
    per_km_fee: Number(val.per_km_fee ?? 0),
    max_delivery_distance_km: Number(val.max_delivery_distance_km ?? 0),
    party_order_phone: val.party_order_phone || '',
  }
}
