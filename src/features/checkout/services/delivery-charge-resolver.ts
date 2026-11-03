import type { Tables } from '@/types/database.types'
import type {
  DeliveryResolutionResult,
  DeliverySettings,
  ZoneClassification,
} from '@/types/delivery'

export type KitchenLocation = { lat: number; lng: number }
export type { DeliveryResolutionResult, DeliverySettings, ZoneClassification }

/**
 * Extracts a 6-digit Indian pincode from an address.
 */
export function extractPincode(address: Partial<Tables<'addresses'>> | null): string | null {
  if (!address?.pincode) return null
  const cleaned = address.pincode.trim()
  return /^\d{6}$/.test(cleaned) ? cleaned : null
}

export interface ResolveDeliveryOptions {
  settings?: DeliverySettings | null
  kitchenLocation?: KitchenLocation
  areas?: Tables<'delivery_areas'>[]
  feeRules?: Tables<'delivery_fee_rules'>[]
  /** Exact road driving distance (e.g. from Google Routes API) override */
  overrideDistanceKm?: number | null
}

/**
 * Resolves delivery fee, zone classification, and serviceability.
 * All pricing, radius, and pincode rules are loaded dynamically from the database.
 */
export function resolveDeliveryCharge(
  address: Partial<Tables<'addresses'>> | null,
  optionsOrAreas?: ResolveDeliveryOptions | Tables<'delivery_areas'>[],
  _feeRulesOrKitchen?: Tables<'delivery_fee_rules'>[] | KitchenLocation,
  _legacyKitchen?: KitchenLocation,
  legacySettings?: DeliverySettings,
): DeliveryResolutionResult {
  if (!address) {
    return {
      fee: 0,
      isOutOfZone: false,
      zoneClassification: 'out_of_zone',
      zoneType: 'out_of_zone',
      zoneLabel: 'Address required',
      distanceKm: null,
    }
  }

  // Parse arguments to support both new options object and legacy signature
  let settings: DeliverySettings | null = null
  let overrideDistanceKm: number | null = null

  if (optionsOrAreas && !Array.isArray(optionsOrAreas) && typeof optionsOrAreas === 'object') {
    const opts = optionsOrAreas as ResolveDeliveryOptions
    if (opts.settings) settings = opts.settings
    if (opts.overrideDistanceKm != null) overrideDistanceKm = opts.overrideDistanceKm
  } else {
    // Legacy positional arguments
    if (legacySettings) settings = legacySettings
  }

  // 1. Extract and normalize pincode
  const pincode = extractPincode(address)

  // 2. Classify zone based on dynamic pincode lists from database
  const zoneA = (settings?.zone_a_pincodes || []).map((p) => p.trim())
  const zoneB = (settings?.zone_b_pincodes || []).map((p) => p.trim())

  let classification: ZoneClassification = 'out_of_zone'

  if (pincode) {
    if (zoneA.includes(pincode)) {
      classification = 'zone_a'
    } else if (zoneB.includes(pincode)) {
      classification = 'zone_b'
    }
  }

  const returnWithLog = (res: DeliveryResolutionResult): DeliveryResolutionResult => {
    const isOut = res.isOutOfZone
    const feeStr = res.fee === 0 ? 'FREE' : `₹${res.fee}`
    const style = isOut ? 'color: #ef4444; font-weight: bold;' : 'color: #10b981; font-weight: bold;'
    console.log(
      `%c[FoodIQ:Delivery] ${isOut ? '🛑 OUT OF ZONE' : '✅ DELIVERABLE'}: Pincode ${pincode || 'None'} (${res.zoneClassification.toUpperCase()}) | Distance: ${res.distanceKm ?? 0} km | Fee: ${feeStr}`,
      style,
      {
        zone: res.zoneClassification,
        label: res.zoneLabel,
        distanceKm: res.distanceKm,
        deliveryFee: res.fee,
        isOutOfZone: res.isOutOfZone,
        source: overrideDistanceKm ? 'Google Routes (DRIVE)' : 'Pending / Not Resolved',
      }
    )
    return res
  }

  // If outside all deliverable zones
  if (classification === 'out_of_zone') {
    return returnWithLog({
      fee: 0,
      isOutOfZone: true,
      zoneClassification: 'out_of_zone',
      zoneType: 'out_of_zone',
      zoneLabel: pincode ? `Pincode ${pincode} · Outside Standard Service Area` : 'Outside Delivery Area',
      distanceKm: overrideDistanceKm != null && overrideDistanceKm > 0 ? overrideDistanceKm : null,
    })
  }

  // 3. Driving distance from kitchen (Strictly from Google Routes API - no heuristic multiplier fallback)
  const distanceKm: number | null =
    overrideDistanceKm != null && overrideDistanceKm > 0 ? overrideDistanceKm : null

  // 4. Hard distance cutoff configured in database
  const maxDistance = Number(settings?.max_delivery_distance_km ?? 0)
  if (maxDistance > 0 && distanceKm !== null && distanceKm > maxDistance) {
    return returnWithLog({
      fee: 0,
      isOutOfZone: true,
      zoneClassification: 'out_of_zone',
      zoneType: 'out_of_zone',
      zoneLabel: `Exceeds Maximum Delivery Radius (${distanceKm} km)`,
      distanceKm,
    })
  }

  const baseFee = Number(settings?.base_delivery_fee ?? 0)
  const perKmFee = Number(settings?.per_km_fee ?? 0)
  const freeRadius = Number(settings?.free_delivery_radius_km ?? 0)

  // 5. Unified Distance-Based Delivery Fee Calculation (same fair rate regardless of Zone A or B)
  const isFree = distanceKm !== null && freeRadius > 0 && distanceKm <= freeRadius
  const extraKm =
    distanceKm !== null && freeRadius > 0 && distanceKm > freeRadius
      ? Math.round((distanceKm - freeRadius) * 10) / 10
      : isFree
      ? 0
      : (distanceKm ?? 0)
  const fee = distanceKm === null ? 0 : isFree ? 0 : Math.round(baseFee + extraKm * perKmFee)

  const pricingBreakdown = {
    isFree,
    baseFee: isFree ? 0 : baseFee,
    extraKm,
    perKmFee,
    distanceKm: distanceKm ?? 0,
  }

  // Zone A: Core Delivery Area (automatic acceptance, standard ETA 30–45 mins)
  if (classification === 'zone_a') {
    return returnWithLog({
      fee,
      isOutOfZone: false,
      zoneClassification: 'zone_a',
      zoneType: 'zone_a',
      zoneLabel:
        distanceKm !== null
          ? isFree
            ? `Standard Zone (${distanceKm} km) · Free Delivery`
            : `Standard Zone (${distanceKm} km)`
          : 'Standard Zone · Free Delivery',
      distanceKm,
      pricingBreakdown,
    })
  }

  // Zone B: Extended Delivery Area (same distance fee rate; extended ETA 50–65 mins, subject to confirmation)
  if (classification === 'zone_b') {
    // If master toggle for Zone B is OFF (e.g. during peak rush)
    if (settings?.zone_b_enabled === false) {
      return returnWithLog({
        fee: 0,
        isOutOfZone: true,
        zoneClassification: 'zone_b',
        zoneType: 'zone_b',
        zoneLabel: `Extended Zone (${pincode || (distanceKm ? `${distanceKm} km` : '')}) · Paused Due to Rush`,
        distanceKm,
        isZoneBDisabled: true,
      })
    }

    return returnWithLog({
      fee,
      isOutOfZone: false,
      zoneClassification: 'zone_b',
      zoneType: 'zone_b',
      zoneLabel:
        distanceKm !== null
          ? isFree
            ? `Extended Zone (${distanceKm} km) · Free Delivery · Subject to Confirmation`
            : `Extended Zone (${distanceKm} km) · Subject to Confirmation`
          : 'Extended Zone · Subject to Confirmation',
      distanceKm,
      pricingBreakdown,
    })
  }

  // Fallback safe return
  return returnWithLog({
    fee: 0,
    isOutOfZone: true,
    zoneClassification: 'out_of_zone',
    zoneType: 'out_of_zone',
    zoneLabel: 'Outside Delivery Area',
    distanceKm: null,
  })
}
