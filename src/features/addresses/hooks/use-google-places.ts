import { useEffect, useState, useCallback, useRef } from 'react'
import { AHMEDABAD_BOUNDS } from '@/constants'

declare global {
  interface Window {
    gm_authFailure?: () => void
  }
}

export type PlaceCategory = 'commercial' | 'residential' | 'general'

export interface GooglePlacePrediction {
  placeId: string
  mainText: string
  secondaryText: string
  description: string
  types?: string[]
  category?: PlaceCategory
}

export interface ParsedPlaceDetails {
  name: string
  buildingName: string
  roadName: string
  sublocality: string
  city?: string
  state?: string
  pincode: string
  latitude: number | null
  longitude: number | null
  formattedAddress: string
  placeTypes: string[]
  category: PlaceCategory
  isCompanyOrOffice: boolean
  isResidentialSociety: boolean
}

const COMMERCIAL_KEYWORDS = [
  'office',
  'company',
  'corporate',
  'tech',
  'technologies',
  'solutions',
  'infocity',
  'devx',
  'business',
  'center',
  'centre',
  'hub',
  'square',
  'arcade',
  'plaza',
  'towers',
  'heights',
  'enterprise',
  'park',
  'ltd',
  'llp',
  'pvt',
]

const RESIDENTIAL_KEYWORDS = [
  'society',
  'apartment',
  'apartments',
  'residency',
  'enclave',
  'villas',
  'greens',
  'homes',
  'flats',
  'bungalows',
  'niwas',
  'awas',
  'chsl',
]

export function inferPlaceCategory(
  types: string[] = [],
  text: string = ''
): PlaceCategory {
  const lower = text.toLowerCase()

  const hasCommercialKeyword = COMMERCIAL_KEYWORDS.some((kw) => lower.includes(kw))
  const hasResidentialKeyword = RESIDENTIAL_KEYWORDS.some((kw) => lower.includes(kw))

  if (hasCommercialKeyword && !hasResidentialKeyword) {
    return 'commercial'
  }
  if (hasResidentialKeyword && !hasCommercialKeyword) {
    return 'residential'
  }

  const isGoogleCommercial = types.some((t) =>
    [
      'establishment',
      'point_of_interest',
      'corporate_office',
      'commercial',
      'finance',
      'bank',
      'store',
      'school',
      'university',
      'hospital',
      'doctor',
    ].includes(t)
  )

  const isGoogleResidential = types.some((t) =>
    ['premise', 'subpremise', 'housing_complex', 'apartment', 'residential'].includes(t)
  )

  if (isGoogleCommercial && !isGoogleResidential) return 'commercial'
  if (isGoogleResidential && !isGoogleCommercial) return 'residential'
  if (hasCommercialKeyword) return 'commercial'
  if (hasResidentialKeyword) return 'residential'

  return 'general'
}

let scriptLoadingPromise: Promise<void> | null = null

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (typeof window !== 'undefined' && window.google?.maps?.places) {
    return Promise.resolve()
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise
  }

  scriptLoadingPromise = new Promise((resolve, reject) => {
    // Check if places API becomes available
    const checkInterval = setInterval(() => {
      if (typeof window !== 'undefined' && window.google?.maps?.places) {
        clearInterval(checkInterval)
        resolve()
      }
    }, 50)

    const existingScript = document.getElementById('google-maps-script') as HTMLScriptElement | null
    if (existingScript) {
      existingScript.addEventListener('error', (err) => {
        clearInterval(checkInterval)
        scriptLoadingPromise = null
        reject(err)
      })
      setTimeout(() => {
        clearInterval(checkInterval)
        if (typeof window !== 'undefined' && window.google?.maps?.places) {
          resolve()
        } else {
          scriptLoadingPromise = null
          reject(new Error('Google Maps script load timeout'))
        }
      }, 8000)
      return
    }

    const script = document.createElement('script')
    script.id = 'google-maps-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`
    script.async = true

    script.onload = () => {
      if (typeof window !== 'undefined' && window.google?.maps?.places) {
        clearInterval(checkInterval)
        resolve()
      }
    }
    script.onerror = (err) => {
      clearInterval(checkInterval)
      scriptLoadingPromise = null
      reject(err)
    }

    document.head.appendChild(script)
  })

  return scriptLoadingPromise
}

export function useGooglePlaces() {
  const [isLoaded, setIsLoaded] = useState(() => {
    return typeof window !== 'undefined' && Boolean(window.google?.maps?.places)
  })
  const [loadError, setLoadError] = useState<string | null>(null)

  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

  useEffect(() => {
    if (!apiKey) {
      setLoadError('Google Maps API key missing')
      return
    }

    // Capture Google Maps auth / activation failure
    if (typeof window !== 'undefined') {
      window.gm_authFailure = () => {
        console.error('Google Maps API Error: ApiNotActivatedMapError or authentication failed.')
        setLoadError('ApiNotActivatedMapError')
      }
    }

    // Fast-path: already loaded on window
    if (typeof window !== 'undefined' && window.google?.maps?.places) {
      if (window.google.maps.places.AutocompleteService && !autocompleteServiceRef.current) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService()
      }
      if (window.google.maps.places.PlacesService && !placesServiceRef.current) {
        placesServiceRef.current = new window.google.maps.places.PlacesService(document.createElement('div'))
      }
      if (!geocoderRef.current) {
        geocoderRef.current = new window.google.maps.Geocoder()
      }
      setIsLoaded(true)
      return
    }

    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (window.google?.maps?.places) {
          if (window.google.maps.places.AutocompleteService) {
            autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService()
          }
          if (window.google.maps.places.PlacesService) {
            placesServiceRef.current = new window.google.maps.places.PlacesService(document.createElement('div'))
          }
          geocoderRef.current = new window.google.maps.Geocoder()
          setIsLoaded(true)
        }
      })
      .catch((err) => {
        console.error('Failed to load Google Maps JS SDK:', err)
        setLoadError('Failed to load Google Maps SDK')
      })
  }, [apiKey])

  const getPredictions = useCallback(
    async (input: string): Promise<GooglePlacePrediction[]> => {
      if (!isLoaded || !input.trim()) {
        return []
      }

      // AutocompleteService strictly restricted to Ahmedabad city bounds
      if (!autocompleteServiceRef.current && window.google?.maps?.places?.AutocompleteService) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService()
      }

      if (!autocompleteServiceRef.current) return []

      return new Promise((resolve) => {
        const req: google.maps.places.AutocompletionRequest = {
          input: input.trim(),
          componentRestrictions: { country: 'in' },
          locationRestriction: new window.google.maps.LatLngBounds(
            { lat: AHMEDABAD_BOUNDS.south, lng: AHMEDABAD_BOUNDS.west },
            { lat: AHMEDABAD_BOUNDS.north, lng: AHMEDABAD_BOUNDS.east }
          ),
        }

        autocompleteServiceRef.current?.getPlacePredictions(req, (predictions, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            predictions &&
            predictions.length > 0
          ) {
            const formatted: GooglePlacePrediction[] = predictions.map((p) => {
              const types = p.types || []
              const mainText = p.structured_formatting.main_text || ''
              const category = inferPlaceCategory(types, `${mainText} ${p.description}`)
              return {
                placeId: p.place_id,
                mainText,
                secondaryText: p.structured_formatting.secondary_text || '',
                description: p.description,
                types,
                category,
              }
            })
            resolve(formatted)
          } else {
            resolve([])
          }
        })
      })
    },
    [isLoaded]
  )

  const getPlaceDetails = useCallback(
    (placeId: string, description?: string): Promise<ParsedPlaceDetails | null> => {
      const geocoder = geocoderRef.current
      const placesService = placesServiceRef.current
      if (!isLoaded) {
        return Promise.resolve(null)
      }

      const cleanPlaceId = placeId ? placeId.replace(/^places\//, '') : ''

      return new Promise((resolve) => {
        // Method A: Query Google PlacesService for full establishment metadata (name, types, etc.)
        if (cleanPlaceId && placesService) {
          placesService.getDetails(
            {
              placeId: cleanPlaceId,
              fields: ['name', 'geometry', 'formatted_address', 'address_components', 'types'],
            },
            (place, status) => {
              if (
                status === window.google.maps.places.PlacesServiceStatus.OK &&
                place &&
                place.geometry?.location
              ) {
                const lat = place.geometry.location.lat()
                const lng = place.geometry.location.lng()
                const placeTypes = place.types || []
                const placeName = place.name || (description ? description.split(',')[0] : '')

                let buildingName = placeName
                let roadName = ''
                let sublocality = ''
                let pincode = ''
                let city = ''
                let state = ''

                for (const comp of place.address_components || []) {
                  const types = comp.types || []

                  if (
                    types.includes('premise') ||
                    types.includes('subpremise') ||
                    types.includes('establishment') ||
                    types.includes('point_of_interest')
                  ) {
                    if (!buildingName) buildingName = comp.long_name
                  } else if (types.includes('route')) {
                    roadName = comp.long_name
                  } else if (
                    types.includes('sublocality_level_1') ||
                    types.includes('sublocality_level_2') ||
                    types.includes('sublocality') ||
                    types.includes('neighborhood')
                  ) {
                    if (!sublocality) sublocality = comp.long_name
                  } else if (types.includes('locality')) {
                    city = comp.long_name
                    if (!sublocality) sublocality = comp.long_name
                  } else if (types.includes('administrative_area_level_2') && !city) {
                    city = comp.long_name
                  } else if (types.includes('administrative_area_level_1')) {
                    state = comp.long_name
                  } else if (types.includes('postal_code')) {
                    pincode = comp.long_name
                  }
                }

                if (!buildingName) {
                  buildingName = placeName || (place.formatted_address || '').split(',')[0]
                }

                const category = inferPlaceCategory(
                  placeTypes,
                  `${placeName} ${buildingName} ${place.formatted_address || ''} ${description || ''}`
                )

                resolve({
                  name: placeName || buildingName,
                  buildingName: buildingName || placeName,
                  roadName,
                  sublocality: sublocality || 'Ahmedabad',
                  city: city || 'Ahmedabad',
                  state: state || 'Gujarat',
                  pincode,
                  latitude: lat,
                  longitude: lng,
                  formattedAddress: place.formatted_address || description || '',
                  placeTypes,
                  category,
                  isCompanyOrOffice: category === 'commercial',
                  isResidentialSociety: category === 'residential',
                })
                return
              }

              // Fallback to Geocoder if PlacesService getDetails did not succeed
              runGeocoderFallback()
            }
          )
          return
        }

        runGeocoderFallback()

        function runGeocoderFallback() {
          if (!geocoder) {
            resolve(null)
            return
          }

          const handleGeocodeResult = (
            results: google.maps.GeocoderResult[] | null,
            status: google.maps.GeocoderStatus
          ) => {
            if (status === window.google.maps.GeocoderStatus.OK && results?.[0]) {
              const place = results[0]
              const lat = place.geometry.location.lat()
              const lng = place.geometry.location.lng()
              const placeTypes = place.types || []

              let buildingName = ''
              let roadName = ''
              let sublocality = ''
              let pincode = ''
              let city = ''
              let state = ''

              for (const comp of place.address_components) {
                const types = comp.types

                if (
                  types.includes('premise') ||
                  types.includes('subpremise') ||
                  types.includes('establishment') ||
                  types.includes('point_of_interest')
                ) {
                  if (!buildingName) buildingName = comp.long_name
                } else if (types.includes('route')) {
                  roadName = comp.long_name
                } else if (
                  types.includes('sublocality_level_1') ||
                  types.includes('sublocality_level_2') ||
                  types.includes('sublocality') ||
                  types.includes('neighborhood')
                ) {
                  if (!sublocality) sublocality = comp.long_name
                } else if (types.includes('locality')) {
                  city = comp.long_name
                  if (!sublocality) sublocality = comp.long_name
                } else if (types.includes('administrative_area_level_2') && !city) {
                  city = comp.long_name
                } else if (types.includes('administrative_area_level_1')) {
                  state = comp.long_name
                } else if (types.includes('postal_code')) {
                  pincode = comp.long_name
                }
              }

              const fallbackName = description ? description.split(',')[0].trim() : ''
              if (!buildingName && fallbackName) {
                buildingName = fallbackName
              } else if (!buildingName && place.address_components.length > 0) {
                buildingName = place.address_components[0].long_name
              }

              const category = inferPlaceCategory(
                placeTypes,
                `${buildingName} ${place.formatted_address} ${description || ''}`
              )

              resolve({
                name: buildingName || place.formatted_address.split(',')[0],
                buildingName,
                roadName,
                sublocality,
                city: city || 'Ahmedabad',
                state: state || 'Gujarat',
                pincode,
                latitude: lat,
                longitude: lng,
                formattedAddress: place.formatted_address,
                placeTypes,
                category,
                isCompanyOrOffice: category === 'commercial',
                isResidentialSociety: category === 'residential',
              })
            } else if (cleanPlaceId && description && geocoder) {
              geocoder.geocode({ address: description }, handleGeocodeResult)
            } else {
              resolve(null)
            }
          }

          if (cleanPlaceId) {
            geocoder.geocode({ placeId: cleanPlaceId }, handleGeocodeResult)
          } else if (description) {
            geocoder.geocode({ address: description }, handleGeocodeResult)
          } else {
            resolve(null)
          }
        }
      })
    },
    [isLoaded]
  )

  return { isLoaded, loadError, getPredictions, getPlaceDetails }
}
