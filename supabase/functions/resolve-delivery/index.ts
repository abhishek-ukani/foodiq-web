// @ts-nocheck — Deno/Supabase Edge Function (not part of the Vite bundle)
// Deploy with: npx supabase functions deploy resolve-delivery
//
// Environment variables (auto-injected by Supabase into Edge Functions):
//   SUPABASE_URL              — your project URL
//   SUPABASE_SERVICE_ROLE_KEY — service role key (full DB access, bypasses RLS)
//
// Optional secrets you can set via Supabase Dashboard → Edge Functions → Secrets:
//   KITCHEN_LAT              — kitchen latitude  (default: 23.0225, Ahmedabad placeholder)
//   KITCHEN_LNG              — kitchen longitude (default: 72.5714, Ahmedabad placeholder)
//   NOMINATIM_CONTACT_EMAIL  — contact email for Nominatim User-Agent (REQUIRED by Nominatim ToS)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ---------------------------------------------------------------------------
// Kitchen constants — fallback coordinates if branch lat/lng not set
// ---------------------------------------------------------------------------
const KITCHEN_LAT = Number(Deno.env.get('KITCHEN_LAT') ?? '23.0225')
const KITCHEN_LNG = Number(Deno.env.get('KITCHEN_LNG') ?? '72.5714')

const NOMINATIM_CONTACT =
  Deno.env.get('NOMINATIM_CONTACT_EMAIL') ?? 'YOUR_EMAIL_HERE'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface DeliveryRequest {
  locality?: string
  pincode?: string
  lat?: number
  lng?: number
  subtotal?: number
}

interface DeliveryResult {
  deliverable: boolean
  fee: number
  zone_type: 'FREE' | 'PAID' | 'OUT_OF_RANGE' | 'BLOCKED'
  distance_km?: number
}

// ---------------------------------------------------------------------------
// Haversine formula — great-circle distance in km
// ---------------------------------------------------------------------------
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ---------------------------------------------------------------------------
// Edge Function handler
// ---------------------------------------------------------------------------
Deno.serve(async (req: Request) => {
  // Only POST allowed
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Parse body
  let body: DeliveryRequest
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { locality, pincode, lat, lng } = body

  // Validate — need at least one parameter
  const hasInput =
    (locality && locality.trim()) ||
    (pincode && pincode.trim()) ||
    (lat != null && lng != null)

  if (!hasInput) {
    return new Response(
      JSON.stringify({
        error: 'Provide at least one of: locality, pincode, or lat+lng',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  // Service-role Supabase client (bypasses RLS inside Edge Function)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // -------------------------------------------------------------------------
  // Step 1 — Pre-classified Zone Match (pincode exact OR name ilike)
  // -------------------------------------------------------------------------
  let zoneQuery = supabase
    .from('delivery_zones')
    .select('*')
    .eq('is_active', true)

  const orParts: string[] = []
  if (pincode && pincode.trim()) {
    orParts.push(`pincode.eq.${pincode.trim()}`)
  }
  if (locality && locality.trim()) {
    orParts.push(`name.ilike.%${locality.trim()}%`)
  }

  if (orParts.length > 0) {
    zoneQuery = zoneQuery.or(orParts.join(','))
  }

  const { data: zones, error: zoneError } = await zoneQuery.limit(1).maybeSingle()

  if (zoneError) {
    console.error('Zone lookup error:', zoneError)
    // Non-fatal: fall through to geocoding
  }

  if (zones) {
    const zone = zones as { zone_type: string; fixed_fee: number }
    if (zone.zone_type === 'BLOCKED') {
      const result: DeliveryResult = { deliverable: false, fee: 0, zone_type: 'BLOCKED' }
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    const result: DeliveryResult = {
      deliverable: true,
      fee: Number(zone.fixed_fee),
      zone_type: zone.zone_type as 'FREE' | 'PAID',
    }
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // -------------------------------------------------------------------------
  // Step 2 — Resolve customer lat/lng via Nominatim if not provided
  // -------------------------------------------------------------------------
  let resolvedLat: number | null = lat ?? null
  let resolvedLng: number | null = lng ?? null

  if (resolvedLat == null || resolvedLng == null) {
    const queryParts: string[] = []
    if (locality && locality.trim()) queryParts.push(locality.trim())
    if (pincode && pincode.trim()) queryParts.push(pincode.trim())
    queryParts.push('Ahmedabad') // City anchor for precision

    const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search')
    nominatimUrl.searchParams.set('q', queryParts.join(', '))
    nominatimUrl.searchParams.set('format', 'json')
    nominatimUrl.searchParams.set('limit', '1')

    let geocodeResponse: Response
    try {
      geocodeResponse = await fetch(nominatimUrl.toString(), {
        headers: {
          'User-Agent': `KathiyawadiKitchen/1.0 (contact: ${NOMINATIM_CONTACT})`,
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      })
    } catch (fetchErr) {
      console.error('Nominatim fetch failed:', fetchErr)
      return new Response(
        JSON.stringify({
          error: 'Geocoding service unavailable. Please try again shortly.',
          code: 'GEOCODE_UNAVAILABLE',
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      )
    }

    if (!geocodeResponse.ok) {
      console.error('Nominatim non-OK status:', geocodeResponse.status)
      return new Response(
        JSON.stringify({
          error: 'Geocoding service returned an error. Please try again.',
          code: 'GEOCODE_ERROR',
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      )
    }

    let geocodeData: Array<{ lat: string; lon: string }>
    try {
      geocodeData = await geocodeResponse.json()
    } catch {
      return new Response(
        JSON.stringify({ error: 'Unexpected geocoding response.', code: 'GEOCODE_PARSE_ERROR' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      )
    }

    if (!geocodeData || geocodeData.length === 0) {
      const result: DeliveryResult = { deliverable: false, fee: 0, zone_type: 'OUT_OF_RANGE' }
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    resolvedLat = parseFloat(geocodeData[0].lat)
    resolvedLng = parseFloat(geocodeData[0].lon)
  }

  // -------------------------------------------------------------------------
  // Step 3 — Resolve kitchen coordinates dynamically
  // -------------------------------------------------------------------------
  let kitchenLat = KITCHEN_LAT
  let kitchenLng = KITCHEN_LNG

  if (!Deno.env.get('KITCHEN_LAT') || !Deno.env.get('KITCHEN_LNG')) {
    const { data: branch } = await supabase
      .from('branches')
      .select('latitude, longitude')
      .or('is_default.eq.true,is_active.eq.true')
      .limit(1)
      .maybeSingle()
    if (branch?.latitude != null && branch?.longitude != null) {
      kitchenLat = Number(branch.latitude)
      kitchenLng = Number(branch.longitude)
    }
  }

  // -------------------------------------------------------------------------
  // Step 4 — Calculate Haversine distance
  // -------------------------------------------------------------------------
  const distanceKm = haversineKm(kitchenLat, kitchenLng, resolvedLat, resolvedLng)
  const distanceRounded = Math.round(distanceKm * 10) / 10

  // -------------------------------------------------------------------------
  // Step 5 — Distance fee rule tier lookup
  // -------------------------------------------------------------------------
  const { data: rule, error: ruleError } = await supabase
    .from('delivery_fee_rules')
    .select('*')
    .eq('is_active', true)
    .lte('min_distance_km', distanceKm)
    .gt('max_distance_km', distanceKm)
    .maybeSingle()

  if (ruleError) {
    console.error('Fee rule lookup error:', ruleError)
    return new Response(
      JSON.stringify({ error: 'Fee lookup failed. Please try again.', code: 'FEE_LOOKUP_ERROR' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    )
  }

  if (!rule) {
    // Distance exceeds all configured tiers → not deliverable
    const result: DeliveryResult = {
      deliverable: false,
      fee: 0,
      zone_type: 'OUT_OF_RANGE',
      distance_km: distanceRounded,
    }
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const feeAmount = Number(rule.fee)
  const result: DeliveryResult = {
    deliverable: true,
    fee: feeAmount,
    zone_type: feeAmount === 0 ? 'FREE' : 'PAID',
    distance_km: distanceRounded,
  }
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
