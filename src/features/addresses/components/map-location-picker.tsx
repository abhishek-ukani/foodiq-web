import { useState, useCallback, useRef, useEffect } from 'react'
import { GoogleMap } from '@react-google-maps/api'
import {
  Search,
  MapPin,
  Navigation,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  useGooglePlaces,
  type GooglePlacePrediction,
} from '@/features/addresses/hooks/use-google-places'

export interface PinnedLocationData {
  latitude: number
  longitude: number
  buildingName: string
  roadName: string
  sublocality: string
  pincode: string
  formattedAddress: string
}

export function MapLocationPicker({
  initialLocation,
  onConfirmLocation,
  onCancel,
  onManualAddressFallback,
}: {
  initialLocation?: { lat: number; lng: number } | null
  onConfirmLocation: (data: PinnedLocationData) => void
  onCancel?: () => void
  onManualAddressFallback?: () => void
}) {
  const defaultCenter = initialLocation || { lat: 23.0392, lng: 72.5085 } // Bodakdev / Sindhubhavan Road, Ahmedabad
  const [center, setCenter] = useState(defaultCenter)
  const mapRef = useRef<google.maps.Map | null>(null)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isProgrammaticMoveRef = useRef<boolean>(false)

  // Geocoding state
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [quotaExceeded, setQuotaExceeded] = useState(false)
  const [isLocatingGPS, setIsLocatingGPS] = useState(false)

  // Pinned location data state
  const [pinnedData, setPinnedData] = useState<PinnedLocationData>({
    latitude: defaultCenter.lat,
    longitude: defaultCenter.lng,
    buildingName: '',
    roadName: '',
    sublocality: 'Ahmedabad',
    pincode: '',
    formattedAddress: '',
  })

  // Google Places hook for top search bar
  const { isLoaded, loadError, getPredictions, getPlaceDetails } = useGooglePlaces()
  const [searchInput, setSearchInput] = useState('')
  const [predictions, setPredictions] = useState<GooglePlacePrediction[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Initialize geocoder whenever Google Maps is loaded
  useEffect(() => {
    if (isLoaded && window.google?.maps && !geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder()
    }
  }, [isLoaded])

  // Reverse geocode helper function with 500ms debounce
  const runReverseGeocode = useCallback((lat: number, lng: number) => {
    if (!window.google?.maps) return

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      if (!geocoderRef.current) {
        geocoderRef.current = new window.google.maps.Geocoder()
      }

      setIsGeocoding(true)

      geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
        setIsGeocoding(false)
        if (status === window.google.maps.GeocoderStatus.OK && results?.[0]) {
          const place = results[0]
          let buildingName = ''
          let roadName = ''
          let sublocality = ''
          let pincode = ''

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
            } else if (types.includes('locality') && !sublocality) {
              sublocality = comp.long_name
            } else if (types.includes('postal_code')) {
              pincode = comp.long_name
            }
          }

          // Fallback for sublocality if it's 'Ahmedabad' or empty
          if (!sublocality || sublocality === 'Ahmedabad') {
            const parts = (place.formatted_address || '').split(',').map((s) => s.trim())
            const candidate = parts.find(
              (p) => p && p !== 'Ahmedabad' && p !== 'Gujarat' && p !== 'India' && !p.match(/^\d{6}$/)
            )
            if (candidate) sublocality = candidate
          }

          if (!buildingName && place.address_components.length > 0) {
            buildingName = place.address_components[0].long_name
          }

          setPinnedData({
            latitude: lat,
            longitude: lng,
            buildingName,
            roadName,
            sublocality: sublocality || 'Ahmedabad',
            pincode,
            formattedAddress: place.formatted_address,
          })
        } else {
          // If OVER_QUERY_LIMIT or REQUEST_DENIED quota error occurred
          if (status === 'OVER_QUERY_LIMIT' || status === 'REQUEST_DENIED') {
            setQuotaExceeded(true)
          }
          // Fallback update lat/lng so button is still actionable
          setPinnedData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
          }))
        }
      })
    }, 500)
  }, [])

  // Sync center and pan map whenever initialLocation changes
  useEffect(() => {
    if (initialLocation && initialLocation.lat && initialLocation.lng) {
      setCenter(initialLocation)
      setPinnedData((prev) => ({
        ...prev,
        latitude: initialLocation.lat,
        longitude: initialLocation.lng,
      }))
      if (mapRef.current && window.google?.maps) {
        isProgrammaticMoveRef.current = true
        window.google.maps.event.trigger(mapRef.current, 'resize')
        mapRef.current.panTo(initialLocation)
        mapRef.current.setZoom(17)
      }
      runReverseGeocode(initialLocation.lat, initialLocation.lng)
    }
  }, [initialLocation?.lat, initialLocation?.lng, runReverseGeocode])

  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map
      if (window.google?.maps && !geocoderRef.current) {
        geocoderRef.current = new window.google.maps.Geocoder()
      }
      if (initialLocation && initialLocation.lat && initialLocation.lng) {
        map.panTo(initialLocation)
        map.setZoom(17)
        runReverseGeocode(initialLocation.lat, initialLocation.lng)
      }
    },
    [initialLocation, runReverseGeocode]
  )

  // Reverse geocode when map stops moving (only when user manually drags/pans)
  const handleMapIdle = useCallback(() => {
    if (!mapRef.current) return
    const currentCenter = mapRef.current.getCenter()
    if (!currentCenter) return

    const lat = currentCenter.lat()
    const lng = currentCenter.lng()

    setCenter({ lat, lng })

    if (isProgrammaticMoveRef.current) {
      isProgrammaticMoveRef.current = false
      return
    }

    runReverseGeocode(lat, lng)
  }, [runReverseGeocode])

  // Handle GPS location click with user permission prompt handling
  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    setIsLocatingGPS(true)
    const toastId = toast.loading('Detecting your current location...')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingGPS(false)
        toast.dismiss(toastId)
        toast.success('Location updated!')
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setCenter(newPos)
        if (mapRef.current) {
          isProgrammaticMoveRef.current = true
          mapRef.current.panTo(newPos)
          mapRef.current.setZoom(17)
        }
        runReverseGeocode(newPos.lat, newPos.lng)
      },
      (err) => {
        setIsLocatingGPS(false)
        toast.dismiss(toastId)
        console.warn('Geolocation error:', err.message)
        if (err.code === err.PERMISSION_DENIED) {
          toast.error('Location permission was denied. Please select location on the map.')
        } else {
          toast.error('Could not fetch location. Please drag the pin on map.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [runReverseGeocode])

  // Handle Search input typing
  useEffect(() => {
    if (!searchInput.trim() || !isLoaded) {
      setPredictions([])
      return
    }

    const timer = setTimeout(async () => {
      const preds = await getPredictions(searchInput)
      setPredictions(preds)
    }, 250)

    return () => clearTimeout(timer)
  }, [searchInput, isLoaded, getPredictions])

  // Select place from search predictions
  const handleSelectPrediction = async (pred: GooglePlacePrediction) => {
    isProgrammaticMoveRef.current = true
    const searchDescription = pred.description || (pred.secondaryText ? `${pred.mainText}, ${pred.secondaryText}` : pred.mainText)
    const details = await getPlaceDetails(pred.placeId, searchDescription)
    if (details && details.latitude && details.longitude) {
      const newPos = { lat: details.latitude, lng: details.longitude }
      setCenter(newPos)
      if (mapRef.current) {
        mapRef.current.panTo(newPos)
        mapRef.current.setZoom(17)
      }
      setSearchInput(pred.mainText)
      setIsSearchOpen(false)

      const secondaryParts = (pred.secondaryText || '').split(',').map((s) => s.trim())
      const inferredArea =
        secondaryParts.find(
          (p) => p && p !== 'Ahmedabad' && p !== 'Gujarat' && p !== 'India' && !p.match(/^\d{6}$/)
        ) || 'Ahmedabad'

      setPinnedData({
        latitude: details.latitude,
        longitude: details.longitude,
        buildingName: details.buildingName || pred.mainText,
        roadName: details.roadName || (secondaryParts[0] !== inferredArea ? secondaryParts[0] : ''),
        sublocality: details.sublocality && details.sublocality !== 'Ahmedabad' ? details.sublocality : inferredArea,
        pincode: details.pincode,
        formattedAddress: details.formattedAddress || `${pred.mainText}, ${pred.secondaryText}`,
      })
    } else {
      toast.error('Could not fetch coordinates for selected location')
    }
  }

  // Handle API load error or ApiNotActivatedMapError
  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center bg-card rounded-2xl border size-full">
        <AlertTriangle className="size-12 text-amber-500" />
        <div className="space-y-1">
          <h3 className="font-semibold text-xl">Google Maps API Notice</h3>
          <p className="text-muted-foreground text-sm max-w-md">
            Maps JavaScript API is not active. You can proceed directly with manual address entry using our local area autocomplete.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-4">
          {onManualAddressFallback && (
            <Button type="button" size="lg" onClick={onManualAddressFallback}>
              Enter Address Manually
            </Button>
          )}
          {onCancel && (
            <Button type="button" size="lg" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row size-full overflow-hidden bg-background">
      
      {/* MAP AREA (Left / Main - Fills full space) */}
      <div className="relative flex-1 min-h-[350px] md:min-h-[500px] bg-muted overflow-hidden">
        
        {/* Floating Top Controls Header Bar - High Contrast Solid Card Styling */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-3 pointer-events-none">
          {/* Back button & Title badge */}
          <div className="flex items-center gap-2 pointer-events-auto shrink-0">
            {onCancel && (
              <button
                type="button"
                className="size-10 rounded-full shadow-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={onCancel}
              >
                <ArrowLeft className="size-5" />
              </button>
            )}
            <span className="hidden sm:inline-flex bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-bold px-4 py-2.5 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
              Select Delivery Location
            </span>
          </div>

          {/* Search Bar Overlay - High Contrast White Background */}
          <div className="pointer-events-auto flex-1 max-w-sm ml-auto">
            <div className="relative">
              <Input
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  setIsSearchOpen(true)
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search area, building, street..."
                className="h-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm pl-10 pr-4 shadow-xl rounded-xl border border-slate-300 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-primary font-medium placeholder:text-slate-400"
              />
              <Search className="absolute left-3 top-3 size-4 text-slate-500 dark:text-slate-400 pointer-events-none" />
            </div>

            {/* Search Dropdown Predictions */}
            {isSearchOpen && predictions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden z-30 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {predictions.map((p) => (
                  <button
                    key={p.placeId}
                    type="button"
                    onClick={() => handleSelectPrediction(p)}
                    className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-start gap-2.5"
                  >
                    <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.mainText}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{p.secondaryText}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center Pin Indicator Overlay */}
        <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-full pointer-events-none flex flex-col items-center">
          <div className="bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-lg mb-1 whitespace-nowrap animate-bounce">
            Place pin on exact location
          </div>
          <div className="relative flex items-center justify-center">
            <div className="size-8 rounded-full bg-emerald-500/30 animate-ping absolute" />
            <div className="size-9 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center shadow-xl">
              <MapPin className="size-5 fill-white/20" />
            </div>
          </div>
          <div className="size-2 rounded-full bg-slate-900 mt-0.5 shadow-md" />
        </div>

        {/* Floating Bottom Left Control: Current Location Button */}
        <div className="absolute bottom-4 left-4 z-20">
          <Button
            type="button"
            size="sm"
            onClick={handleUseCurrentLocation}
            disabled={isLocatingGPS}
            className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold shadow-xl border border-slate-200 dark:border-slate-700 rounded-full h-10 px-4 text-xs"
          >
            <Navigation className={`size-4 mr-2 text-emerald-600 ${isLocatingGPS ? 'animate-spin' : ''}`} />
            Use my current location
          </Button>
        </div>

        {/* Google Map Viewport */}
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={center}
            zoom={16}
            onLoad={onMapLoad}
            onIdle={handleMapIdle}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              gestureHandling: 'greedy',
            }}
          />
        ) : (
          <div className="size-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading map...</p>
          </div>
        )}
      </div>

      {/* RIGHT SIDE PANEL: Address summary & confirmation action */}
      <div className="w-full md:w-80 lg:w-96 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l bg-background shadow-xl shrink-0 z-20">
        <div className="space-y-4">
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">Deliver To</h3>
            <p className="text-muted-foreground text-xs mt-0.5">
              Drag the map or search your area to set the delivery location.
            </p>
          </div>

          <Card className="border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/20 shadow-sm">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-sm text-foreground truncate">
                  <MapPin className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{pinnedData.sublocality || 'Ahmedabad'}</span>
                </div>
                <button
                  type="button"
                  disabled={isLocatingGPS}
                  className="text-xs font-bold text-primary hover:underline px-2 py-0.5"
                  onClick={handleUseCurrentLocation}
                >
                  Change
                </button>
              </div>

              <p className="text-muted-foreground text-xs leading-relaxed line-clamp-4 font-medium">
                {isGeocoding
                  ? 'Updating address details...'
                  : pinnedData.formattedAddress ||
                    `${pinnedData.buildingName ? pinnedData.buildingName + ', ' : ''}${
                      pinnedData.roadName ? pinnedData.roadName + ', ' : ''
                    }${pinnedData.sublocality || ''} ${pinnedData.pincode || ''}`}
              </p>
            </CardContent>
          </Card>

          {quotaExceeded && (
            <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/50 p-3 rounded-xl border border-amber-200 dark:border-amber-800">
              ⚠️ Google Geocoding quota reached for this key. Pin location saved, click below to fill building/street details.
            </p>
          )}

          {onManualAddressFallback && (
            <button
              type="button"
              onClick={onManualAddressFallback}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground underline w-full text-center block pt-2 transition-colors"
            >
              Skip map & enter address manually
            </button>
          )}
        </div>

        <div className="pt-6 space-y-3 border-t">
          <Button
            type="button"
            size="lg"
            onClick={() => onConfirmLocation(pinnedData)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg h-12 text-sm rounded-xl"
          >
            Add Address Details
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onCancel}
              className="w-full h-11 text-xs sm:text-sm font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
