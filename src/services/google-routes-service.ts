import { DEFAULT_KITCHEN_LOCATION } from '@/constants'

// Accurate FoodIQ Kitchen coordinates (Sarita Apartments, Bodakdev, Ahmedabad - 380015)
export const KITCHEN_LAT: number = DEFAULT_KITCHEN_LOCATION.lat
export const KITCHEN_LNG: number = DEFAULT_KITCHEN_LOCATION.lng

const ROUTES_API_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes'

// In-memory cache to prevent redundant API calls for recurring coordinates/sessions
const distanceCache = new Map<string, number>()

function getCacheKey(originLat: number, originLng: number, destLat: number, destLng: number): string {
  // Round to ~11 meters precision (4 decimals) for cache hits on near-identical pins
  return `${originLat.toFixed(4)},${originLng.toFixed(4)}->${destLat.toFixed(4)},${destLng.toFixed(4)}`
}

/**
 * Aerial straight-line distance (Haversine formula) in kilometers.
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371.0088 // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export interface GoogleDistanceResult {
  km: number
  source: 'google_routes' | 'cache' | 'error'
  durationSeconds?: number
}

/**
 * Calculates road driving distance from kitchen to destination using Google Routes API (DRIVE).
 * 
 * Features:
 * 1. Cache hit returns instantly (0ms, 0 API calls).
 * 2. Minimal payload: Uses field mask 'routes.distanceMeters,routes.duration' for lowest cost & fastest response.
 * 3. Strict: Returns true Google Routes driving distance or explicit error. No synthetic estimations.
 */
export async function calculateGoogleRoadDistance(
  destLat: number,
  destLng: number,
  kitchenLat: number = KITCHEN_LAT,
  kitchenLng: number = KITCHEN_LNG
): Promise<GoogleDistanceResult> {
  // Validate coordinates
  if (
    isNaN(destLat) ||
    isNaN(destLng) ||
    destLat === 0 ||
    destLng === 0
  ) {
    console.debug('[FoodIQ:Distance] Invalid coordinates provided:', { destLat, destLng })
    return { km: 0, source: 'error' }
  }

  const cacheKey = getCacheKey(kitchenLat, kitchenLng, destLat, destLng)

  // 1. Cache Check
  if (distanceCache.has(cacheKey)) {
    const cachedKm = distanceCache.get(cacheKey)!
    console.log(
      `%c[FoodIQ:Distance] ⚡ Cache Hit: ${cachedKm} km (Destination: ${destLat.toFixed(4)}, ${destLng.toFixed(4)})`,
      'color: #8b5cf6; font-weight: bold;'
    )
    return {
      km: cachedKm,
      source: 'cache',
    }
  }

  // 2. API Key Check
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || ''
  if (!apiKey) {
    console.error('[FoodIQ:Distance] 🛑 VITE_GOOGLE_MAPS_API_KEY missing in environment.')
    return { km: 0, source: 'error' }
  }

  const aerialKm = haversineDistanceKm(kitchenLat, kitchenLng, destLat, destLng)

  // 4. Call Google Routes API v2
  console.groupCollapsed(
    `%c[FoodIQ:Distance] 🌐 Calling Google Routes API (DRIVE) → (${destLat.toFixed(5)}, ${destLng.toFixed(5)})`,
    'color: #0284c7; font-weight: bold;'
  )
  console.log('Kitchen Origin (Sarita Apts Bodakdev):', { lat: kitchenLat, lng: kitchenLng })
  console.log('Customer Destination:', { lat: destLat, lng: destLng })
  console.log('Aerial (Straight-line):', `${aerialKm.toFixed(2)} km`)

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000) // 6s timeout

    const startTime = performance.now()
    const response = await fetch(ROUTES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration',
      },
      body: JSON.stringify({
        origin: {
          location: {
            latLng: { latitude: kitchenLat, longitude: kitchenLng },
          },
        },
        destination: {
          location: {
            latLng: { latitude: destLat, longitude: destLng },
          },
        },
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_UNAWARE',
      }),
      signal: controller.signal,
    })

    const latencyMs = Math.round(performance.now() - startTime)
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Google Routes HTTP ${response.status}`)
    }

    const data = await response.json()
    const distanceMeters = data.routes?.[0]?.distanceMeters

    if (typeof distanceMeters === 'number') {
      const roadKm = Math.round((distanceMeters / 1000.0) * 10) / 10
      let durationSec: number | undefined
      if (typeof data.routes[0]?.duration === 'string') {
        durationSec = parseInt(data.routes[0].duration.replace('s', ''), 10)
      }

      // Store in memory cache
      distanceCache.set(cacheKey, roadKm)

      console.log(
        `%c[FoodIQ:Distance] ✅ Google Routes Success (${latencyMs}ms):`,
        'color: #10b981; font-weight: bold;',
        {
          roadDistance: `${roadKm} km (${distanceMeters} m)`,
          driveDuration: durationSec ? `${Math.round(durationSec / 60)} min (${durationSec}s)` : 'N/A',
          circuityMultiplier: `${(roadKm / (aerialKm || 1)).toFixed(2)}x`,
          cached: true,
        }
      )
      console.groupEnd()

      return {
        km: roadKm,
        source: 'google_routes',
        durationSeconds: durationSec,
      }
    }
    throw new Error('Google Routes response missing distanceMeters')
  } catch (error) {
    console.error('[FoodIQ:Distance] 🛑 Google Routes API failed:', error)
    console.groupEnd()
    return {
      km: 0,
      source: 'error',
    }
  }
}
