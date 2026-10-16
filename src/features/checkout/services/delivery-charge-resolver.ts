import type { Tables } from '@/types/database.types'

export type KitchenLocation = { lat: number; lng: number }

export type DeliveryResolutionResult = {
  fee: number
  isOutOfZone: boolean
  zoneType: 'building' | 'road' | 'area' | 'out_of_zone'
  zoneLabel: string
  distanceKm: number | null
}

/**
 * Calculates straight-line (Haversine) distance between two GPS coordinates in kilometers.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10 // Round to 1 decimal place
}

/**
 * Resolves delivery fee and zone status based on address, deliverable areas, and kitchen distance fee rules.
 */
export function resolveDeliveryCharge(
  address: Partial<Tables<'addresses'>> | null,
  areas: Tables<'delivery_areas'>[] = [],
  feeRules: Tables<'delivery_fee_rules'>[] = [],
  kitchenLocation: KitchenLocation = { lat: 23.0392, lng: 72.5085 },
): DeliveryResolutionResult {
  if (!address) {
    return {
      fee: 0,
      isOutOfZone: false,
      zoneType: 'out_of_zone',
      zoneLabel: 'Address required',
      distanceKm: null,
    }
  }

  // Match Area (Validated strictly against delivery_areas)
  const subloc = (address.sublocality || '').toLowerCase().trim()
  const line1 = (address.address_line1 || '').toLowerCase().trim()
  const line2 = (address.address_line2 || '').toLowerCase().trim()

  const matchedArea = areas.find((a) => {
    if (!a.is_active) return false
    const key = (a.area_key || '').toLowerCase().trim()
    const name = (a.name || '').toLowerCase().trim()

    // 1. Direct sublocality match
    if (subloc) {
      if (key && (subloc === key || subloc.includes(key) || key.includes(subloc))) return true
      if (name && (subloc === name || subloc.includes(name) || name.includes(subloc))) return true
    }

    // 2. Address lines text match (only if key/name has at least 3 chars)
    if (key && key.length >= 3 && (line1.includes(key) || line2.includes(key))) return true
    if (name && name.length >= 3 && (line1.includes(name) || line2.includes(name))) return true

    // 3. Fall back to pincode ONLY if sublocality is completely empty
    if (!subloc && a.pincode && address.pincode && a.pincode === address.pincode) return true

    return false
  })

  if (matchedArea) {
    let distanceKm = 3.5 // Fallback estimated distance in Ahmedabad if lat/lng unavailable

    if (address.latitude && address.longitude) {
      distanceKm = calculateHaversineDistanceKm(
        kitchenLocation.lat,
        kitchenLocation.lng,
        address.latitude,
        address.longitude,
      )
    }

    // Match against distance fee rules
    const matchedRule = feeRules.find(
      (r) => distanceKm >= r.min_distance_km && distanceKm <= r.max_distance_km,
    )

    const fee = matchedRule
      ? Number(matchedRule.fee)
      : feeRules.length > 0
        ? Number(feeRules[feeRules.length - 1].fee) // highest tier if beyond max rule
        : 30

    console.log('[DISTANCE RESOLVER DEBUG]', {
      addressLabel: address.label,
      addressLine1: address.address_line1,
      kitchenLocation,
      customerLocation: { lat: address.latitude, lng: address.longitude },
      calculatedDistanceKm: distanceKm,
      matchedRule,
      finalDeliveryFee: fee,
    })

    return {
      fee,
      isOutOfZone: false,
      zoneType: 'area',
      zoneLabel: `${matchedArea.name} (${distanceKm} km)`,
      distanceKm,
    }
  }

  // 4. Out of Zone
  return {
    fee: 0,
    isOutOfZone: true,
    zoneType: 'out_of_zone',
    zoneLabel: 'Out of Standard Zone',
    distanceKm: null,
  }
}
