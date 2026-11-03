export interface DeliverySettings {
  zone_a_pincodes: string[]
  zone_b_pincodes: string[]
  zone_b_enabled: boolean
  free_delivery_radius_km: number
  base_delivery_fee: number
  per_km_fee: number
  max_delivery_distance_km: number
  party_order_phone?: string
}

export type ZoneClassification = 'zone_a' | 'zone_b' | 'out_of_zone'

export type DeliveryResolutionResult = {
  fee: number
  isOutOfZone: boolean
  zoneClassification: ZoneClassification
  zoneType: 'zone_a' | 'zone_b' | 'out_of_zone' | 'building' | 'road' | 'area'
  zoneLabel: string
  distanceKm: number | null
  isZoneBDisabled?: boolean
  pricingBreakdown?: {
    isFree: boolean
    baseFee: number
    extraKm: number
    perKmFee: number
    distanceKm: number
  }
}
