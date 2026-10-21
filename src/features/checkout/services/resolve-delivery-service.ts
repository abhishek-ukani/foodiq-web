import { supabase } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DeliveryRequest {
  locality?: string
  pincode?: string
  lat?: number
  lng?: number
}

export interface DeliveryResult {
  deliverable: boolean
  fee: number
  zone_type: 'FREE' | 'PAID' | 'OUT_OF_RANGE' | 'BLOCKED'
  /** Only present when resolved via distance fallback (Nominatim + Haversine). */
  distance_km?: number
}

/** Error returned by the Edge Function when geocoding fails (HTTP 502). */
export class DeliveryResolveError extends Error {
  readonly code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'DeliveryResolveError'
    this.code = code
  }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Calls the `resolve-delivery` Supabase Edge Function with automatic direct
 * database fallback if the Edge Function is not deployed or unreachable.
 */
export async function resolveDelivery(input: DeliveryRequest): Promise<DeliveryResult> {
  try {
    const { data, error } = await supabase.functions.invoke<DeliveryResult>('resolve-delivery', {
      body: input,
    })

    if (!error && data) {
      return data
    }
  } catch (err) {
    console.warn('Edge Function invocation failed, falling back to DB lookup:', err)
  }

  // -------------------------------------------------------------------------
  // Fallback: Direct Database Resolution (if Edge Function is not deployed)
  // -------------------------------------------------------------------------

  // 1. Check delivery_zones table (pincode or locality name)
  if (input.pincode || input.locality) {
    const filters: string[] = []
    if (input.pincode?.trim()) filters.push(`pincode.eq.${input.pincode.trim()}`)
    if (input.locality?.trim()) filters.push(`name.ilike.%${input.locality.trim()}%`)

    const { data: zones } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('is_active', true)
      .or(filters.join(','))
      .limit(1)
      .maybeSingle()

    if (zones) {
      if (zones.zone_type === 'BLOCKED') {
        return { deliverable: false, fee: 0, zone_type: 'BLOCKED' }
      }
      return {
        deliverable: true,
        fee: Number(zones.fixed_fee),
        zone_type: zones.zone_type as 'FREE' | 'PAID',
      }
    }
  }

  // 2. Check legacy delivery_areas table (pincode match)
  if (input.pincode?.trim()) {
    const { data: area } = await supabase
      .from('delivery_areas')
      .select('*')
      .eq('is_active', true)
      .eq('pincode', input.pincode.trim())
      .limit(1)
      .maybeSingle()

    if (area) {
      const charge = Number((area as any).delivery_charge ?? 0)
      return {
        deliverable: true,
        fee: charge,
        zone_type: charge === 0 ? 'FREE' : 'PAID',
      }
    }
  }

  // 3. If no delivery zone or area matches, address is outside service area
  return {
    deliverable: false,
    fee: 0,
    zone_type: 'OUT_OF_RANGE',
  }
}
