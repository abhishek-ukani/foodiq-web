import { useEffect, useState, useRef, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Home,
  Info,
  Loader2,
  MapPin,
  MapPinOff,
  Moon,
  Navigation,
  Search,
  Sparkles,
  Sun,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/input'
import { FloatingInput } from '@/components/ui/floating-input'
import { DEFAULT_KITCHEN_LOCATION } from '@/constants'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { addressSchema, type AddressInput } from '@/features/addresses/schemas/address-schema'
import { useCreateAddress, useUpdateAddress } from '@/features/addresses/hooks/use-addresses'
import { useAuth } from '@/hooks/use-auth'
import {
  useDeliveryAreas,
  useDeliveryFeeRules,
  useKitchenLocation,
  useDeliverySettings,
} from '@/features/addresses/hooks/use-delivery-zones'
import { resolveDeliveryCharge } from '@/features/checkout/services/delivery-charge-resolver'
import { calculateGoogleRoadDistance } from '@/services/google-routes-service'
import { OutOfDeliveryAreaNotice } from '@/features/addresses/components/out-of-delivery-area-notice'
import {
  useGooglePlaces,
  inferPlaceCategory,
  type GooglePlacePrediction,
  type ParsedPlaceDetails,
  type PlaceCategory,
} from '@/features/addresses/hooks/use-google-places'
import type { PinnedLocationData } from '@/features/addresses/components/map-location-picker'
import type { Tables } from '@/types/database.types'

interface ExtractedAddressMetadata {
  floor?: string
  unit?: string
}

export function isPlusCode(text?: string | null): boolean {
  if (!text) return false
  return /^[2-9CFGHJMRPVX]{4,8}\+[2-9CFGHJMRPVX]{2,3}$/i.test(text.trim())
}

function extractDetailsFromAddress(formattedAddress: string): ExtractedAddressMetadata {
  if (!formattedAddress) return {}
  const result: ExtractedAddressMetadata = {}

  // Strip leading Plus Codes (e.g. "2CCV+HMX, Ahmedabad...") before parsing to prevent "2C" from being misidentified as unit
  const cleanedAddress = formattedAddress.replace(/^[2-9CFGHJMRPVX]{4,8}\+[2-9CFGHJMRPVX]{2,3},?\s*/i, '')

  // 1. Detect floor (e.g. "9th Floor", "Floor 9", "Ground Floor", "Basement")
  const floorMatch = cleanedAddress.match(
    /\b(\d{1,2}(?:st|nd|rd|th)?\s+floor|floor\s+\d{1,2}|ground\s+floor|basement)\b/i
  )
  if (floorMatch) {
    result.floor = floorMatch[0].trim()
  }

  // 2. Detect unit/office/block/flat (e.g. "Office 702", "Unit 401", "Suite B", "Block A", "Flat 402", "Plot 12", or starting with "901, BLOCK-A")
  const unitMatch =
    cleanedAddress.match(
      /\b((?:office|unit|cabin|desk|suite|flat|room|block|plot|shop|bldg|house|no\.?)\s*#?[\w-]+(?:\s*,\s*block-?[a-z0-9]+)?)/i
    ) || cleanedAddress.match(/^(\d{1,4}[a-z]?(?:\s*,\s*block-?[a-z0-9]+)?)/i)

  if (unitMatch) {
    result.unit = unitMatch[0].trim()
  }

  return result
}

const DEFAULT_VALUES: AddressInput = {
  label: 'home',
  custom_label: '',
  contact_name: '',
  contact_phone: '',
  place_category: 'general',
  company_name: '',
  floor_no: '',
  tower_block: '',
  unit_no: '',
  building_name: '',
  road_name: '',
  landmark: '',
  pincode: '',
  latitude: null,
  longitude: null,
  sublocality: '',
  delivery_instructions: '',
  meal_type_tag: 'both',
  preferred_time: '',
}

export function AddressForm({
  address,
  pinnedLocation,
  onOpenMap,
  onClearLocation,
  onSaved,
  onCancel,
}: {
  address?: Tables<'addresses'> | null
  pinnedLocation?: PinnedLocationData | null
  onOpenMap?: (location?: {
    latitude: number
    longitude: number
    buildingName?: string
    roadName?: string
    sublocality?: string
    pincode?: string
    formattedAddress?: string
  }) => void
  onClearLocation?: () => void
  onSaved: (address: Tables<'addresses'> | null) => void
  onCancel?: () => void
}) {
  const createAddress = useCreateAddress()
  const updateAddress = useUpdateAddress()
  const isEditing = Boolean(address)

  // Logged-in user details for auto-filling contact info
  const { user, profile } = useAuth()
  const userFullName =
    profile?.full_name ||
    (user?.user_metadata?.full_name as string) ||
    (user?.user_metadata?.name as string) ||
    ''
  const rawPhone =
    profile?.phone ||
    user?.phone ||
    (user?.user_metadata?.phone as string) ||
    ''
  const userPhone = rawPhone.replace(/^\+91/, '').replace(/\D/g, '').slice(-10)

  // Delivery areas dataset (Standard list of serviceable areas)
  const { data: areas = [] } = useDeliveryAreas()
  const { data: feeRules = [] } = useDeliveryFeeRules()
  const { data: kitchenLoc } = useKitchenLocation()
  const { data: deliverySettings } = useDeliverySettings()

  // Google Places SDK
  const { isLoaded: isGoogleLoaded, getPredictions, getPlaceDetails } = useGooglePlaces()

  // Smart Search States
  const [searchInput, setSearchInput] = useState('')
  const [predictions, setPredictions] = useState<GooglePlacePrediction[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<ParsedPlaceDetails | null>(null)
  const [showAdvancedFields, setShowAdvancedFields] = useState(false)
  const [isLocatingGPS, setIsLocatingGPS] = useState(false)

  const searchContainerRef = useRef<HTMLDivElement | null>(null)
  const isSelectingPlaceRef = useRef(false)

  const form = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: pinnedLocation
      ? {
        ...DEFAULT_VALUES,
        contact_name: userFullName,
        contact_phone: userPhone,
        building_name: pinnedLocation.buildingName || '',
        road_name: pinnedLocation.roadName || '',
        sublocality: pinnedLocation.sublocality || '',
        pincode: pinnedLocation.pincode || '',
        latitude: pinnedLocation.latitude ?? null,
        longitude: pinnedLocation.longitude ?? null,
      }
      : {
        ...DEFAULT_VALUES,
        contact_name: userFullName,
        contact_phone: userPhone,
      },
  })

  const watchLabel = form.watch('label')
  const watchBuildingName = form.watch('building_name')
  const watchRoadName = form.watch('road_name')
  const watchSublocality = form.watch('sublocality')
  const watchPincode = form.watch('pincode')
  const watchLat = form.watch('latitude')
  const watchLng = form.watch('longitude')

  // Helper to trigger map picker centered on current place or pinned coords
  const handleOpenMapWithCurrentLocation = () => {
    if (!onOpenMap) return
    const lat = form.getValues('latitude') || selectedPlace?.latitude || pinnedLocation?.latitude
    const lng = form.getValues('longitude') || selectedPlace?.longitude || pinnedLocation?.longitude
    if (lat && lng) {
      onOpenMap({
        latitude: Number(lat),
        longitude: Number(lng),
        buildingName:
          form.getValues('building_name') ||
          selectedPlace?.buildingName ||
          selectedPlace?.name ||
          pinnedLocation?.buildingName ||
          '',
        roadName:
          form.getValues('road_name') ||
          selectedPlace?.roadName ||
          pinnedLocation?.roadName ||
          '',
        sublocality:
          form.getValues('sublocality') ||
          selectedPlace?.sublocality ||
          pinnedLocation?.sublocality ||
          '',
        pincode:
          form.getValues('pincode') ||
          selectedPlace?.pincode ||
          pinnedLocation?.pincode ||
          '',
        formattedAddress:
          selectedPlace?.formattedAddress || pinnedLocation?.formattedAddress || '',
      })
    } else {
      onOpenMap()
    }
  }

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Initialize form when editing or pinned location changes
  useEffect(() => {
    if (pinnedLocation) {
      isSelectingPlaceRef.current = true
      setIsDropdownOpen(false)
      setPredictions([])

      const rawTitle = pinnedLocation.buildingName || pinnedLocation.sublocality || ''
      const resolvedTitle = isPlusCode(rawTitle)
        ? (pinnedLocation.sublocality && !isPlusCode(pinnedLocation.sublocality)
            ? pinnedLocation.sublocality
            : pinnedLocation.roadName || 'Pinned Location')
        : (rawTitle || 'Pinned Location')

      // 1. Dynamically infer the place category based on the pinned place name and full address
      const fullText = `${pinnedLocation.buildingName} ${pinnedLocation.roadName} ${pinnedLocation.sublocality} ${pinnedLocation.formattedAddress || ''}`
      const newCategory = inferPlaceCategory([], fullText)
      form.setValue('place_category', newCategory)

      // 2. Extract unit/floor details from the new pinned address string (clears old place units like 501)
      const extracted = extractDetailsFromAddress(pinnedLocation.formattedAddress || '')
      form.setValue('floor_no', extracted.floor || '')

      // Prevent unit_no from being polluted with Block name or duplicating building name
      if (extracted.unit) {
        if (/^(?:block|tower)\b/i.test(extracted.unit)) {
          form.setValue('tower_block', extracted.unit)
          form.setValue('unit_no', '')
        } else if (extracted.unit.toLowerCase() !== resolvedTitle.toLowerCase()) {
          form.setValue('unit_no', extracted.unit)
        } else {
          form.setValue('unit_no', '')
        }
      } else {
        form.setValue('unit_no', '')
      }

      // 3. Update form values with the newly confirmed pinned location from map
      form.setValue('building_name', isPlusCode(resolvedTitle) ? '' : resolvedTitle)
      form.setValue('latitude', pinnedLocation.latitude, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
      form.setValue('longitude', pinnedLocation.longitude, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
      if (pinnedLocation.roadName) {
        form.setValue('road_name', pinnedLocation.roadName)
      }
      if (pinnedLocation.sublocality) {
        form.setValue('sublocality', pinnedLocation.sublocality)
      }
      if (pinnedLocation.pincode && /^\d{6}$/.test(pinnedLocation.pincode.trim())) {
        form.setValue('pincode', pinnedLocation.pincode.trim())
      }

      // 4. Update company name and label according to new category
      if (newCategory === 'commercial') {
        form.setValue('company_name', isPlusCode(resolvedTitle) ? '' : resolvedTitle)
        form.setValue('label', 'work')
      } else {
        form.setValue('company_name', '')
        form.setValue('label', 'home')
      }

      setSearchInput(isPlusCode(resolvedTitle) ? '' : resolvedTitle)

      const updatedPlace: ParsedPlaceDetails = {
        name: isPlusCode(resolvedTitle) ? (pinnedLocation.sublocality || 'Pinned Location') : resolvedTitle,
        buildingName: isPlusCode(pinnedLocation.buildingName) ? '' : (pinnedLocation.buildingName || resolvedTitle),
        roadName: pinnedLocation.roadName || '',
        sublocality: pinnedLocation.sublocality || 'Ahmedabad',
        pincode: pinnedLocation.pincode || '',
        latitude: pinnedLocation.latitude,
        longitude: pinnedLocation.longitude,
        formattedAddress:
          pinnedLocation.formattedAddress ||
          `${resolvedTitle}, ${pinnedLocation.roadName || ''}, ${pinnedLocation.sublocality || ''}`,
        placeTypes: [],
        category: newCategory,
        isCompanyOrOffice: newCategory === 'commercial',
        isResidentialSociety: newCategory === 'residential',
      }

      setSelectedPlace(updatedPlace)
    } else if (address) {
      const parts = (address.address_line1 || '').split(', ')
      const unit = parts.length > 1 ? parts[0] : ''
      const bName = parts.length > 1 ? parts.slice(1).join(', ') : address.address_line1
      const lat = address.latitude ? Number(address.latitude) : null
      const lng = address.longitude ? Number(address.longitude) : null

      form.reset({
        label: (address.label as any) || 'home',
        custom_label: address.custom_label || '',
        contact_name: address.contact_name,
        contact_phone: address.contact_phone,
        place_category: address.label === 'work' ? 'commercial' : 'residential',
        company_name: '',
        floor_no: '',
        tower_block: '',
        unit_no: unit,
        building_name: isPlusCode(bName) ? '' : (bName || ''),
        road_name: address.address_line2 ?? '',
        landmark: address.landmark ?? '',
        pincode: address.pincode,
        latitude: lat,
        longitude: lng,
        sublocality: address.sublocality ?? '',
        delivery_instructions: '',
        meal_type_tag: address.meal_type_tag || 'both',
        preferred_time: address.preferred_time ? address.preferred_time.slice(0, 5) : '',
      })

      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        const placeTitle = isPlusCode(bName)
          ? (address.sublocality || address.address_line2 || 'Saved Location')
          : (bName || address.sublocality || 'Saved Location')

        setSelectedPlace({
          name: placeTitle,
          buildingName: isPlusCode(bName) ? '' : (bName || ''),
          roadName: address.address_line2 || '',
          sublocality: address.sublocality || 'Ahmedabad',
          city: address.city || 'Ahmedabad',
          state: address.state || 'Gujarat',
          pincode: address.pincode || '',
          latitude: lat,
          longitude: lng,
          formattedAddress: [address.address_line1, address.address_line2, address.sublocality, address.city, address.pincode].filter(Boolean).join(', '),
          placeTypes: [],
          category: address.label === 'work' ? 'commercial' : 'residential',
          isCompanyOrOffice: address.label === 'work',
          isResidentialSociety: address.label !== 'work',
        })
      }
      setShowAdvancedFields(true)
    } else {
      form.reset({
        ...DEFAULT_VALUES,
        contact_name: userFullName,
        contact_phone: userPhone,
      })
    }
  }, [pinnedLocation, address, form, userFullName, userPhone])

  // Auto-populate contact details from logged-in user if not editing
  useEffect(() => {
    if (!isEditing) {
      if (!form.getValues('contact_name') && userFullName) {
        form.setValue('contact_name', userFullName)
      }
      if (!form.getValues('contact_phone') && userPhone) {
        form.setValue('contact_phone', userPhone)
      }
    }
  }, [isEditing, userFullName, userPhone, form])

  // Omnisearch Predictions fetcher
  useEffect(() => {
    if (isSelectingPlaceRef.current) {
      isSelectingPlaceRef.current = false
      setPredictions([])
      setIsDropdownOpen(false)
      return
    }

    if (!searchInput.trim() || !isGoogleLoaded) {
      setPredictions([])
      setIsDropdownOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const preds = await getPredictions(searchInput)
        setPredictions(preds)
        setIsDropdownOpen(true)
      } catch (err) {
        console.error('Failed to get predictions:', err)
      } finally {
        setIsSearching(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [searchInput, isGoogleLoaded, getPredictions])

  // Handle Selection of a Place from Omnisearch
  const handleSelectPlace = async (pred: GooglePlacePrediction) => {
    isSelectingPlaceRef.current = true
    setIsDropdownOpen(false)
    setPredictions([])
    setSearchInput(pred.mainText)
    setIsSearching(true)

    try {
      const details = await getPlaceDetails(pred.placeId, pred.description)
      if (!details) return

      if (!details.latitude || !details.longitude) {
        toast.error('Could not get coordinates for this place. Please choose on map.')
      }

      setSelectedPlace(details)

      const category: PlaceCategory = details.category || pred.category || 'general'
      form.setValue('place_category', category)

      console.log(
        `%c[FoodIQ:AddressForm] 🔍 Google Place Selected: "${details.name || pred.mainText}"`,
        'color: #3b82f6; font-weight: bold;',
        {
          name: details.name || pred.mainText,
          address: details.formattedAddress,
          pincode: details.pincode,
          coordinates: { lat: details.latitude, lng: details.longitude },
          category,
        }
      )

      // Always populate building_name with resolved place name so validation never fails
      const rawName = details.name || details.buildingName || pred.mainText
      const resolvedName = isPlusCode(rawName)
        ? (details.sublocality && !isPlusCode(details.sublocality) ? details.sublocality : details.roadName || '')
        : rawName
      form.setValue('building_name', isPlusCode(resolvedName) ? '' : resolvedName)

      // Auto-extract floor and unit/office from address string
      const fullAddr = details.formattedAddress || pred.description || ''
      const extracted = extractDetailsFromAddress(fullAddr)

      form.setValue('floor_no', extracted.floor || '')
      if (extracted.unit) {
        if (/^(?:block|tower)\b/i.test(extracted.unit)) {
          form.setValue('tower_block', extracted.unit)
          form.setValue('unit_no', '')
        } else if (extracted.unit.toLowerCase() !== resolvedName.toLowerCase()) {
          form.setValue('unit_no', extracted.unit)
        } else {
          form.setValue('unit_no', category === 'commercial' ? 'Main Office' : '')
        }
      } else {
        form.setValue('unit_no', category === 'commercial' ? 'Main Office' : '')
      }

      // Auto-set label chip & company details
      if (category === 'commercial') {
        form.setValue('label', 'work')
        form.setValue('place_category', 'commercial')
        form.setValue('company_name', resolvedName)
      } else {
        form.setValue('label', 'home')
        form.setValue('place_category', 'residential')
        form.setValue('company_name', '')
      }

      // Set base location fields
      if (details.roadName) form.setValue('road_name', details.roadName)
      if (details.sublocality) form.setValue('sublocality', details.sublocality)
      if (details.pincode && /^\d{6}$/.test(details.pincode.trim())) {
        form.setValue('pincode', details.pincode.trim())
      }
      if (details.latitude && details.longitude) {
        form.setValue('latitude', details.latitude, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
        form.setValue('longitude', details.longitude, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
      }
    } finally {
      setIsSearching(false)
      setPredictions([])
      setIsDropdownOpen(false)
    }
  }

  // Handle GPS "Use My Location"
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return
    setIsLocatingGPS(true)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        if (pos.coords.accuracy > 1000) {
          toast(
            `Desktop Wi-Fi location is approximate (~${Math.round(pos.coords.accuracy / 1000)} km accuracy). Adjust pin on map if needed.`,
            { id: 'wifi-accuracy-toast', duration: 4000, icon: '📍' },
          )
        }
        form.setValue('latitude', latitude, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
        form.setValue('longitude', longitude, { shouldDirty: true, shouldTouch: true, shouldValidate: true })

        if (window.google?.maps?.Geocoder) {
          const geocoder = new window.google.maps.Geocoder()
          geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
            setIsLocatingGPS(false)
            if (status === 'OK' && results?.[0]) {
              const place = results[0]
              let sublocality = ''
              let pincode = ''
              let road = ''
              let city = ''
              let state = ''

              for (const c of place.address_components) {
                if (c.types.includes('sublocality')) sublocality = c.long_name
                if (c.types.includes('postal_code')) pincode = c.long_name
                if (c.types.includes('route')) road = c.long_name
                if (c.types.includes('locality')) city = c.long_name
                if (!city && c.types.includes('administrative_area_level_2')) city = c.long_name
                if (c.types.includes('administrative_area_level_1')) state = c.long_name
              }

              if (sublocality) form.setValue('sublocality', sublocality)
              if (pincode && /^\d{6}$/.test(pincode.trim())) form.setValue('pincode', pincode.trim())
              if (road) form.setValue('road_name', road)

              setSelectedPlace({
                name: place.formatted_address.split(',')[0],
                buildingName: '',
                roadName: road,
                sublocality: sublocality || 'Ahmedabad',
                city: city || 'Ahmedabad',
                state: state || 'Gujarat',
                pincode: pincode || '',
                latitude,
                longitude,
                formattedAddress: place.formatted_address,
                placeTypes: place.types || [],
                category: 'general',
                isCompanyOrOffice: false,
                isResidentialSociety: false,
              })
              setShowAdvancedFields(true)
            }
          })
        } else {
          setIsLocatingGPS(false)
          setShowAdvancedFields(true)
        }
      },
      (err) => {
        console.warn('Geolocation error:', err)
        setIsLocatingGPS(false)
        setShowAdvancedFields(true)
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  // Exact Google Routes driving distance
  const [googleRoadDistance, setGoogleRoadDistance] = useState<number | null>(null)

  const activeLat = selectedPlace?.latitude != null ? selectedPlace.latitude : watchLat
  const activeLng = selectedPlace?.longitude != null ? selectedPlace.longitude : watchLng

  const hasValidLocation = useMemo(() => {
    const lat = activeLat != null && !isNaN(Number(activeLat)) ? Number(activeLat) : null
    const lng = activeLng != null && !isNaN(Number(activeLng)) ? Number(activeLng) : null
    return Boolean(lat && lng && lat !== 0 && lng !== 0 && (selectedPlace || pinnedLocation || (isEditing && address)))
  }, [activeLat, activeLng, selectedPlace, pinnedLocation, isEditing, address])

  // Fully resets location state from form and clears parent dialog state
  const handleResetLocation = () => {
    setSelectedPlace(null)
    setSearchInput('')
    setPredictions([])
    setIsDropdownOpen(false)
    form.setValue('latitude', null, { shouldValidate: true, shouldDirty: true })
    form.setValue('longitude', null, { shouldValidate: true, shouldDirty: true })
    form.setValue('building_name', '', { shouldValidate: true, shouldDirty: true })
    form.setValue('road_name', '', { shouldDirty: true })
    form.setValue('sublocality', '', { shouldDirty: true })
    form.setValue('pincode', '', { shouldValidate: true, shouldDirty: true })
    form.setValue('unit_no', '', { shouldDirty: true })
    form.setValue('tower_block', '', { shouldDirty: true })
    form.setValue('company_name', '', { shouldDirty: true })
    onClearLocation?.()
  }

  useEffect(() => {
    const lat = activeLat != null && !isNaN(Number(activeLat)) ? Number(activeLat) : null
    const lng = activeLng != null && !isNaN(Number(activeLng)) ? Number(activeLng) : null

    if (lat && lng && lat !== 0 && lng !== 0) {
      let isMounted = true
      setGoogleRoadDistance(null) // Reset while resolving new coordinates
      calculateGoogleRoadDistance(lat, lng, kitchenLoc?.lat, kitchenLoc?.lng)
        .then((res) => {
          if (isMounted) {
            if (res && res.km > 0) {
              setGoogleRoadDistance(res.km)
            } else {
              setGoogleRoadDistance(null)
            }
          }
        })
        .catch(() => {
          if (isMounted) setGoogleRoadDistance(null)
        })
      return () => {
        isMounted = false
      }
    } else {
      setGoogleRoadDistance(null)
    }
  }, [activeLat, activeLng, kitchenLoc?.lat, kitchenLoc?.lng])

  // Calculate delivery charge and serviceability dynamically via distance from kitchen
  const resolvedDelivery = useMemo(() => {
    // Search result coordinates and pincode take immediate precedence over form state
    const rawLat = selectedPlace?.latitude != null ? selectedPlace.latitude : watchLat
    const rawLng = selectedPlace?.longitude != null ? selectedPlace.longitude : watchLng
    const lat = rawLat != null && !isNaN(Number(rawLat)) ? Number(rawLat) : null
    const lng = rawLng != null && !isNaN(Number(rawLng)) ? Number(rawLng) : null
    const sublocality = selectedPlace?.sublocality || watchSublocality || ''
    const pincode = selectedPlace?.pincode || watchPincode || ''
    const road = selectedPlace?.roadName || watchRoadName || ''
    const building = selectedPlace?.name || selectedPlace?.buildingName || watchBuildingName || ''

    return resolveDeliveryCharge(
      {
        latitude: lat,
        longitude: lng,
        sublocality,
        pincode,
        address_line1: building,
        address_line2: road,
      },
      {
        settings: deliverySettings,
        kitchenLocation: kitchenLoc ?? { ...DEFAULT_KITCHEN_LOCATION },
        areas,
        feeRules,
        overrideDistanceKm: googleRoadDistance,
      },
    )
  }, [
    watchSublocality,
    watchBuildingName,
    watchRoadName,
    watchPincode,
    watchLat,
    watchLng,
    selectedPlace,
    deliverySettings,
    areas,
    feeRules,
    kitchenLoc,
    googleRoadDistance,
  ])

  // Submit Handler: Compiles into standard database schema
  const onSubmit = async (values: AddressInput) => {
    let line1 = values.unit_no

    if (values.place_category === 'commercial') {
      const parts: string[] = []
      if (values.unit_no) parts.push(values.unit_no)
      if (values.floor_no) parts.push(values.floor_no)
      if (values.company_name) parts.push(values.company_name)
      if (values.building_name) parts.push(values.building_name)
      line1 = parts.join(', ')
    } else if (values.place_category === 'residential') {
      const parts: string[] = []
      if (values.unit_no) parts.push(values.unit_no)
      if (values.tower_block) parts.push(values.tower_block)
      if (values.building_name) parts.push(values.building_name)
      line1 = parts.join(', ')
    } else {
      line1 = values.unit_no ? `${values.unit_no}, ${values.building_name}` : values.building_name
    }

    const lat = selectedPlace?.latitude ?? values.latitude
    const lng = selectedPlace?.longitude ?? values.longitude

    if (!hasValidLocation || lat == null || lng == null || isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      toast.error('Delivery location is compulsory. Please select your location on the map.')
      handleOpenMapWithCurrentLocation()
      return
    }

    if (resolvedDelivery.isOutOfZone) {
      toast.error('This address is outside our delivery area. Please select a deliverable location in Ahmedabad.')
      return
    }

    const resolvedCity =
      pinnedLocation?.city ||
      selectedPlace?.city ||
      address?.city ||
      'Ahmedabad'
    const resolvedState =
      pinnedLocation?.state ||
      selectedPlace?.state ||
      address?.state ||
      'Gujarat'

    const payload = {
      label:
        values.label === 'other' && values.custom_label
          ? (values.custom_label as any)
          : values.label,
      contact_name: values.contact_name,
      contact_phone: values.contact_phone,
      address_line1: line1,
      address_line2: values.road_name || null,
      landmark: values.delivery_instructions || values.landmark || null,
      city: resolvedCity,
      state: resolvedState,
      pincode: values.pincode,
      latitude: lat,
      longitude: lng,
      sublocality: values.sublocality || (resolvedDelivery.isOutOfZone ? null : resolvedDelivery.zoneLabel.split(' ')[0]),
      meal_type_tag: values.meal_type_tag,
      preferred_time: values.preferred_time ? `${values.preferred_time}:00` : null,
    }

    console.log(
      `%c[FoodIQ:AddressForm] 💾 Saving Address Payload (${isEditing ? 'UPDATE' : 'CREATE'}):`,
      'color: #06b6d4; font-weight: bold;',
      payload
    )

    if (isEditing && address) {
      updateAddress.mutate({ id: address.id, input: payload }, { onSuccess: () => onSaved(null) })
    } else {
      createAddress.mutate(payload, { onSuccess: (created) => onSaved(created) })
    }
  }

  const isPending = createAddress.isPending || updateAddress.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-1" noValidate>
        {/* ================================================================= */}
        {/* 1. OMNISEARCH BAR: Smart Location & Landmark Search               */}
        {/* ================================================================= */}
        <div ref={searchContainerRef} className="relative z-30 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary animate-pulse" />
              Smart Place Search
            </span>
            <span className="text-[11px] font-normal text-muted-foreground">
              Offices, Tech Parks, Societies & Landmarks
            </span>
          </label>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 flex items-center">
              {isSearching ? (
                <Loader2 className="absolute left-3.5 size-4 text-primary animate-spin pointer-events-none" />
              ) : (
                <Search className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
              )}
              <Input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  if (selectedPlace) {
                    setSelectedPlace(null)
                  }
                }}
                onFocus={() => predictions.length > 0 && setIsDropdownOpen(true)}
                placeholder="Search company (TCS, Simform, DevX), building, or society..."
                className="pl-10 pr-24 h-12 text-sm rounded-xl border-2 focus-visible:border-primary shadow-sm bg-background transition-all"
              />

              <div className="absolute right-2 flex items-center gap-1">
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('')
                      setPredictions([])
                      setIsDropdownOpen(false)
                    }}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
                  >
                    <X className="size-3.5" />
                  </button>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocatingGPS}
                  className="h-8 px-2.5 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 rounded-lg gap-1"
                  title="Detect GPS location"
                >
                  {isLocatingGPS ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Navigation className="size-3.5" />
                  )}
                  <span className="hidden sm:inline">GPS</span>
                </Button>
              </div>
            </div>

            {onOpenMap && (
              <Button
                type="button"
                onClick={handleOpenMapWithCurrentLocation}
                variant="outline"
                className="h-12 px-3.5 rounded-xl border-2 font-bold text-xs shrink-0 flex items-center gap-1.5 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-all shadow-sm"
              >
                <MapPin className="size-4 text-emerald-600" />
                <span className="hidden sm:inline">Choose on</span> Map
              </Button>
            )}
          </div>

          {/* Service Area Clarification Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left">
            <Info className="size-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-amber-950 dark:text-amber-200">
                Service Area Notice
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Daily individual meal delivery is currently available across select <strong className="text-foreground">West Ahmedabad zones</strong>. For <strong className="text-foreground">bulk & party orders, we deliver across all of Ahmedabad</strong>! Non-Ahmedabad cities are excluded from search.
              </p>
            </div>
          </div>

          {/* Autocomplete Predictions Dropdown: Hidden when a place is already confirmed */}
          {!selectedPlace && isDropdownOpen && predictions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-popover border rounded-xl shadow-xl overflow-hidden z-50 divide-y max-h-72 overflow-y-auto">
              {predictions.map((pred) => {
                const cat = pred.category || 'general'
                return (
                  <button
                    key={pred.placeId}
                    type="button"
                    onClick={() => handleSelectPlace(pred)}
                    className="w-full text-left px-4 py-3 hover:bg-accent/60 transition-colors flex items-start gap-3 group"
                  >
                    <div className="size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-muted group-hover:bg-primary/15 text-muted-foreground group-hover:text-primary transition-colors">
                      {cat === 'commercial' ? (
                        <Building2 className="size-4" />
                      ) : cat === 'residential' ? (
                        <Home className="size-4" />
                      ) : (
                        <MapPin className="size-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground truncate">
                          {pred.mainText}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${cat === 'commercial'
                              ? 'bg-blue-100 text-blue-700'
                              : cat === 'residential'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-muted text-muted-foreground'
                            }`}
                        >
                          {cat === 'commercial'
                            ? '🏢 Office / Tech Park'
                            : cat === 'residential'
                              ? '🏡 Society / Home'
                              : '📍 Landmark'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {pred.secondaryText || pred.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Zero results state when search has no predictions in boundary */}
          {!selectedPlace && isDropdownOpen && !isSearching && searchInput.trim().length >= 3 && predictions.length === 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-popover border border-amber-500/20 rounded-xl shadow-xl p-4 z-50 animate-in fade-in-50 text-left">
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPinOff className="size-4" />
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-xs text-foreground">
                    No daily meal delivery in this area
                  </h5>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Daily fresh meal delivery is currently limited to select <strong className="text-foreground">West Ahmedabad zones</strong>. However, for <strong className="text-foreground">bulk and party orders, we deliver across all of Ahmedabad!</strong>
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    {onOpenMap && (
                      <button
                        type="button"
                        onClick={handleOpenMapWithCurrentLocation}
                        className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <MapPin className="size-3" /> Pin on map
                      </button>
                    )}
                    <a
                      href="/contact"
                      className="text-xs text-amber-700 dark:text-amber-400 font-bold hover:underline"
                    >
                      Inquire for Party Order →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* 2. VERIFIED LOCATION BANNER: Shown when place is selected         */}
        {/* ================================================================= */}
        {selectedPlace && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 relative overflow-hidden transition-all animate-in fade-in-50">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-foreground">
                      {selectedPlace.name || selectedPlace.buildingName || 'Location Confirmed'}
                    </h4>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                      {watchLabel === 'work'
                        ? 'Corporate Office'
                        : watchLabel === 'home'
                          ? 'Residential Society'
                          : 'Verified Location'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {selectedPlace.formattedAddress}
                  </p>

                  {/* Delivery Fee Notice */}
                  <div className="mt-2 text-xs font-semibold">
                    {resolvedDelivery.zoneClassification === 'zone_a' && !resolvedDelivery.isOutOfZone ? (
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <Sparkles className="size-3.5 shrink-0" />
                        <span>
                          Standard Delivery Zone • Delivery Fee:{' '}
                          {resolvedDelivery.fee === 0
                            ? deliverySettings?.free_delivery_radius_km
                              ? `Free (within ${deliverySettings.free_delivery_radius_km} km)`
                              : 'Free'
                            : `₹${resolvedDelivery.fee}`}
                          {resolvedDelivery.distanceKm !== null ? ` (${resolvedDelivery.distanceKm} km)` : ''}
                        </span>
                      </div>
                    ) : resolvedDelivery.zoneClassification === 'zone_b' ? (
                      <div className="flex items-start gap-2 text-amber-700 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 mt-2">
                        <Navigation className="size-4 shrink-0 mt-0.5 text-amber-600" />
                        <div className="space-y-0.5 text-left">
                          <p className="font-semibold text-xs text-amber-900 dark:text-amber-200">
                            Extended Delivery Zone {resolvedDelivery.distanceKm !== null ? `(${resolvedDelivery.distanceKm} km)` : ''} • Delivery Fee: ₹{resolvedDelivery.fee}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-normal leading-relaxed">
                            {resolvedDelivery.isZoneBDisabled
                              ? 'Delivery to extended zones is currently paused due to peak kitchen rush.'
                              : 'Takes 50–65 mins. Order is subject to kitchen & rider availability during peak rush.'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2.5">
                        <OutOfDeliveryAreaNotice
                          pincode={selectedPlace.pincode || form.getValues('pincode')}
                          formattedAddress={selectedPlace.formattedAddress}
                          partyPhone={deliverySettings?.party_order_phone}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {onOpenMap && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleOpenMapWithCurrentLocation}
                    className="text-xs h-7 px-2.5 rounded-lg gap-1 border-emerald-500/40 text-emerald-700 font-semibold hover:bg-emerald-50"
                  >
                    <MapPin className="size-3" />
                    Adjust Pin
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (onOpenMap) {
                      handleOpenMapWithCurrentLocation()
                    } else {
                      handleResetLocation()
                    }
                  }}
                  className="text-xs h-7 px-2.5 rounded-lg font-semibold"
                >
                  Change
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 2b. LOCATION REQUIRED BANNER: Shown when NO location is confirmed */}
        {/* ================================================================= */}
        {!hasValidLocation && (
          <div className="rounded-xl border-2 border-dashed border-amber-500/50 bg-amber-500/10 p-5 text-center space-y-3 animate-in fade-in-50">
            <div className="flex items-center justify-center gap-2 text-amber-800 dark:text-amber-200 font-bold text-sm">
              <MapPin className="size-4 text-amber-600 animate-bounce" />
              Delivery Location Required
            </div>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Please choose your delivery location on the map. We use your exact map coordinates to calculate road distance and ensure we can deliver fresh to you.
            </p>
            {onOpenMap && (
              <Button
                type="button"
                onClick={handleOpenMapWithCurrentLocation}
                className="h-10 px-5 rounded-xl font-bold text-xs gap-1.5 shadow-sm"
              >
                <MapPin className="size-3.5" />
                Select Location on Map
              </Button>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* 3. ADDRESS LABEL SELECTOR                                          */}
        {/* ================================================================= */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
            Save Address As
          </label>
          <div className="flex items-center gap-2">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'work', label: 'Office / Work', icon: Building2 },
              { id: 'other', label: 'Other', icon: MapPin },
            ].map((chip) => {
              const Icon = chip.icon
              const isSelected = watchLabel === chip.id
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => {
                    form.setValue('label', chip.id as any)
                    if (chip.id === 'home') {
                      form.setValue('place_category', 'residential')
                    } else if (chip.id === 'work') {
                      form.setValue('place_category', 'commercial')
                      if (!form.getValues('company_name')) {
                        const bName = form.getValues('building_name')
                        if (bName && bName !== 'Pinned Location') {
                          form.setValue('company_name', bName)
                        }
                      }
                    } else {
                      form.setValue('place_category', 'general')
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-background hover:bg-accent text-foreground border-input'
                    }`}
                >
                  <Icon className="size-3.5" />
                  {chip.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ================================================================= */}
        {/* 4. ADAPTIVE TAILORED INPUTS BASED ON LABEL (HOME vs WORK vs OTHER) */}
        {/* ================================================================= */}
        {watchLabel === 'home' && (
          <div className="space-y-4 rounded-xl border bg-card/60 p-4 shadow-sm animate-in fade-in-50">
            <div className="flex items-center gap-2 border-b pb-2">
              <Home className="size-4 text-emerald-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Home / Residential Delivery Details
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="unit_no"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FloatingInput
                        label="Flat / House / Door No. *"
                        placeholder="e.g. Flat 402, House 12"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tower_block"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FloatingInput
                        label="Tower / Block / Floor (Optional)"
                        placeholder="e.g. Tower B, Block 4, 3rd Floor"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="building_name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingInput
                      label="Society / Apartment / Building Name *"
                      placeholder="e.g. Goyal Intercity, Godrej Garden City"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="delivery_instructions"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingInput
                      label="Delivery Instructions / Gate Landmark (Optional)"
                      placeholder="e.g. Ring bell, leave with security guard, Gate 2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {watchLabel === 'work' && (
          <div className="space-y-4 rounded-xl border bg-card/60 p-4 shadow-sm animate-in fade-in-50">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-blue-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Office & Work Delivery Details
                </h4>
              </div>
            </div>

            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingInput
                      label="Company / Office Name *"
                      placeholder="e.g. Tech Mahindra, DevX, Simform"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="unit_no"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FloatingInput
                        label="Office / Unit / Desk No. *"
                        placeholder="e.g. Office 702, Desk 12, Reception"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="floor_no"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FloatingInput
                        label="Floor No. (Optional)"
                        placeholder="e.g. 7th Floor, Ground Floor"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="building_name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingInput
                      label="Building / Tech Park Name *"
                      placeholder="e.g. Zion Z1, Mondeal Heights"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="delivery_instructions"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingInput
                      label="Delivery Instructions (Optional)"
                      placeholder="e.g. Drop at reception, call when rider reaches entrance"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {watchLabel === 'other' && (
          <div className="space-y-4 rounded-xl border bg-card/60 p-4 shadow-sm animate-in fade-in-50">
            <div className="flex items-center gap-2 border-b pb-2">
              <MapPin className="size-4 text-purple-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Other Delivery Location Details
              </h4>
            </div>

            <FormField
              control={form.control}
              name="custom_label"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingInput
                      label="Save Address As (e.g. Gym, Friend's Place) *"
                      placeholder="e.g. Gym, Clubhouse, Friend's Flat"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="unit_no"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FloatingInput
                        label="House / Flat / Unit No. *"
                        placeholder="e.g. Flat 101, Room 5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="building_name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FloatingInput
                        label="Building / Premise / Society Name *"
                        placeholder="e.g. Platinum Fitness, Sunrise Tower"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="delivery_instructions"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingInput
                      label="Delivery Instructions (Optional)"
                      placeholder="e.g. Wait near main lobby, call on arrival"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* ================================================================= */}
        {/* 4b. COLLAPSIBLE ROAD, AREA & PINCODE (AUTO-FILLED FROM MAP)       */}
        {/* ================================================================= */}
        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => setShowAdvancedFields(!showAdvancedFields)}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors py-1 group"
          >
            {showAdvancedFields ? (
              <>
                <ChevronUp className="size-3.5 text-primary shrink-0" />
                <span>Hide Road, Area & Pincode</span>
              </>
            ) : (
              <>
                <ChevronDown className="size-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                <span className="truncate text-left">
                  Road, Area & Pincode:{' '}
                  <span className="font-normal text-muted-foreground">
                    {[watchRoadName, watchSublocality || 'Ahmedabad', watchPincode].filter(Boolean).join(', ')} (Auto-filled from map)
                  </span>
                </span>
              </>
            )}
          </button>

          {showAdvancedFields && (
            <div className="mt-2.5 p-3.5 rounded-xl border bg-muted/20 space-y-3 animate-in fade-in-50">
              <p className="text-[11px] text-muted-foreground">
                These details were auto-detected from your map pin. You can adjust them here if needed.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="road_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingInput label="Road / Main Avenue (Optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sublocality"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingInput label="Area / Locality (Ahmedabad) *" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="max-w-[200px]">
                <FormField
                  control={form.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingInput label="Pincode *" maxLength={6} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </div>
        {/* ================================================================= */}
        {/* 4b. MEAL DELIVERY PREFERENCES                                      */}
        {/* ================================================================= */}
        <div className="space-y-4 rounded-xl border bg-card/60 p-4 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-2">
            <Clock className="size-4 text-orange-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Delivery Preferences
            </h4>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">
              Use this address for
            </label>
            <div className="flex items-center gap-2">
              {[
                { id: 'lunch' as const, label: 'Lunch', icon: Sun },
                { id: 'dinner' as const, label: 'Dinner', icon: Moon },
                { id: 'both' as const, label: 'Both', icon: Clock },
              ].map((chip) => {
                const Icon = chip.icon
                const isSelected = form.watch('meal_type_tag') === chip.id
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => form.setValue('meal_type_tag', chip.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${isSelected
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : 'bg-background hover:bg-accent text-foreground border-input'
                      }`}
                  >
                    <Icon className="size-3.5" />
                    {chip.label}
                  </button>
                )
              })}
            </div>
          </div>

          <FormField
            control={form.control}
            name="preferred_time"
            render={({ field }) => (
              <FormItem>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Preferred delivery time (optional)
                </label>
                <FormControl>
                  <Input
                    type="time"
                    placeholder="e.g. 12:30"
                    className="max-w-[160px] text-sm"
                    {...field}
                  />
                </FormControl>
                <p className="text-[11px] text-muted-foreground">
                  We'll use this to plan our delivery route. You only need to set it once.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ================================================================= */}
        {/* 5. CONTACT DETAILS                                                */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
          <FormField
            control={form.control}
            name="contact_name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingInput label="Contact Name *" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_phone"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingInput type="tel" label="Mobile Phone (10 digits) *" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ================================================================= */}
        {/* 6. SUBMIT BUTTONS                                                 */}
        {/* ================================================================= */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            type="submit"
            disabled={isPending || !hasValidLocation || resolvedDelivery.isOutOfZone}
            className="flex-1 sm:flex-none font-bold text-sm h-11 px-8 rounded-xl shadow-md disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" /> Saving…
              </>
            ) : !hasValidLocation ? (
              'Select Location on Map to Save'
            ) : resolvedDelivery.isOutOfZone ? (
              'Outside Delivery Area'
            ) : isEditing ? (
              'Update Address'
            ) : (
              'Save Delivery Address'
            )}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="h-11 px-6 rounded-xl"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
