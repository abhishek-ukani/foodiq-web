import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database.types'

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
    return { lat: 23.0392, lng: 72.5085 }
  }

  const val = data.value as any
  return {
    lat: Number(val.lat ?? 23.0392),
    lng: Number(val.lng ?? 72.5085),
  }
}
