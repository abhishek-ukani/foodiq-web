import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import dayjs from 'dayjs'
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  CreditCard,
  Plus,
  ArrowRight,
  ChevronLeft,
  Sun,
  Moon,
  UtensilsCrossed,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { useAddresses } from '@/features/addresses/hooks/use-addresses'
import { AddressFlowDialog } from '@/features/addresses/components/address-flow-dialog'
import { fetchActiveDeliverySlots } from '@/features/checkout/services/checkout-service'
import {
  useActivePlanVariants,
  useActiveMealOptions,
  useSubscriptionSettings,
  useKitchenClosedDates,
  useSubscriptionQuote,
  useCreateSubscription,
} from '../hooks/use-subscriptions'
import { CURRENCY_SYMBOL, ROUTES } from '@/constants'
import type { Tables } from '@/types/database.types'

export function SubscriptionCheckoutPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const variantSlug = searchParams.get('variant') || ''
  const slotParam = (searchParams.get('slot') as 'lunch' | 'dinner' | 'both') || 'lunch'
  const thaliParam = searchParams.get('thali') || ''

  // Require authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(`${ROUTES.login}?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`, {
        replace: true,
      })
    }
  }, [authLoading, isAuthenticated, navigate])

  const { data: variants, isLoading: variantsLoading } = useActivePlanVariants()
  const { data: mealOptions, isLoading: thalisLoading } = useActiveMealOptions()
  const { data: settings } = useSubscriptionSettings()
  const { data: closedDates } = useKitchenClosedDates()
  const { data: addresses, isLoading: addressesLoading } = useAddresses()

  // Selected variant
  const selectedVariant = useMemo(() => {
    if (!variants?.length) return null
    if (variantSlug) {
      const match = variants.find((v) => v.slug === variantSlug)
      if (match) return match
    }
    return variants[0]
  }, [variants, variantSlug])

  // Form states
  const [selectedThaliId, setSelectedThaliId] = useState<string>(thaliParam)
  const [mealSlot, setMealSlot] = useState<'lunch' | 'dinner' | 'both'>(slotParam)
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash' | 'bank_transfer'>('upi')
  const [deliverySlots, setDeliverySlots] = useState<Tables<'delivery_slots'>[]>([])
  const [selectedDeliverySlotId, setSelectedDeliverySlotId] = useState<string | null>(null)
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(true)

  // Default to matching thali or first thali
  useEffect(() => {
    if (mealOptions?.length) {
      if (thaliParam && mealOptions.some((t) => t.id === thaliParam)) {
        setSelectedThaliId(thaliParam)
      } else if (!selectedThaliId || !mealOptions.some((t) => t.id === selectedThaliId)) {
        setSelectedThaliId(mealOptions[0].id)
      }
    }
  }, [mealOptions, thaliParam, selectedThaliId])

  const activeThali = useMemo(() => {
    return mealOptions?.find((t) => t.id === selectedThaliId) || mealOptions?.[0] || null
  }, [mealOptions, selectedThaliId])

  // Load delivery slots
  useEffect(() => {
    fetchActiveDeliverySlots()
      .then((slots) => setDeliverySlots(slots || []))
      .catch((err) => console.error('Failed to load delivery slots:', err))
  }, [])

  // Auto-pick default address
  useEffect(() => {
    if (addresses?.length && !selectedAddressId) {
      const def = addresses.find((a) => a.is_default) || addresses[0]
      setSelectedAddressId(def.id)
    }
  }, [addresses, selectedAddressId])

  // Filter delivery slots matching slot
  const relevantDeliverySlots = useMemo(() => {
    if (!deliverySlots.length) return []
    if (mealSlot === 'both') {
      return deliverySlots
    }
    return deliverySlots.filter((s) => s.meal_type === mealSlot)
  }, [deliverySlots, mealSlot])

  // Auto-select slot if matching
  useEffect(() => {
    if (relevantDeliverySlots.length && !selectedDeliverySlotId) {
      setSelectedDeliverySlotId(relevantDeliverySlots[0].id)
    }
  }, [relevantDeliverySlots, selectedDeliverySlotId])

  // Calculate default valid start date
  useEffect(() => {
    if (settings && selectedVariant && !startDate) {
      const minLead = settings.min_lead_days ?? 1
      let candidate = dayjs().add(minLead, 'day')

      const allowedDays = selectedVariant.delivery_days || [1, 2, 3, 4, 5]
      const closedSet = new Set(closedDates || [])

      // Loop up to 14 days to find first valid delivery date
      for (let i = 0; i < 14; i++) {
        const dStr = candidate.format('YYYY-MM-DD')
        const dayOfWeek = candidate.day() === 0 ? 7 : candidate.day()

        if (
          selectedVariant.schedule_type === 'every_other_day' ||
          allowedDays.includes(dayOfWeek)
        ) {
          if (!closedSet.has(dStr)) {
            setStartDate(dStr)
            break
          }
        }
        candidate = candidate.add(1, 'day')
      }
    }
  }, [settings, selectedVariant, closedDates, startDate])

  // Server quote query
  const { data: quote, isLoading: quoteLoading } = useSubscriptionQuote(
    selectedVariant?.id,
    mealSlot,
    selectedThaliId,
  )

  const createMutation = useCreateSubscription()

  const handleConfirmSubscription = async () => {
    if (!selectedVariant || !selectedAddressId || !startDate) return

    await createMutation.mutateAsync({
      variantId: selectedVariant.id,
      mealSlot,
      mealThaliId: selectedThaliId || null,
      startDate,
      addressId: selectedAddressId,
      deliverySlotId: selectedDeliverySlotId,
      paymentMethod,
    })

    navigate(ROUTES.mySubscription)
  }

  const minDateStr = dayjs()
    .add(settings?.min_lead_days ?? 1, 'day')
    .format('YYYY-MM-DD')
  const maxDateStr = dayjs()
    .add(settings?.max_start_lead_days ?? 30, 'day')
    .format('YYYY-MM-DD')

  if (variantsLoading || authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!selectedVariant) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 space-y-4">
        <p className="text-muted-foreground text-sm">Plan variant not found.</p>
        <Button asChild>
          <Link to={ROUTES.plans}>Browse Meal Plans</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-16 pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
            <Link to={ROUTES.plans}>
              <ChevronLeft className="size-4" />
              Back to Plans
            </Link>
          </Button>
        </div>

        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
            Complete Your Subscription
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Set your delivery address, preferred timing, and starting date.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* ── LEFT 2 COLUMNS: CONFIGURATION ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* 1. Selected Plan Banner */}
            <Card className="border-2 border-primary/20 bg-card">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="font-display text-xl font-bold">
                      {selectedVariant.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedVariant.duration_meal_days} meal-days validity • Up to{' '}
                      {selectedVariant.skip_limit} delivery skips allowed
                    </p>
                  </div>
                  {selectedVariant.discount_percentage > 0 && (
                    <Badge variant="default" className="bg-emerald-600 font-bold text-xs">
                      {selectedVariant.discount_percentage}% OFF
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-2">
                <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-lg border border-emerald-200/50">
                  <Sparkles className="size-3.5 text-emerald-600 shrink-0" />
                  <span>Includes complimentary add-ons in every meal (Salad, Pickle &amp; Chutney) ✨</span>
                </div>

                {selectedVariant.has_weekly_sweet && (
                  <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 px-3 py-1.5 rounded-lg border border-amber-200/50">
                    <Sparkles className="size-3.5 text-amber-600 shrink-0" />
                    <span>Includes complimentary homemade Kathiyawadi sweet every week 🍬</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2. Meal / Thali Choice */}
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <UtensilsCrossed className="size-4 text-primary" />
                  Select Kathiyawadi Meal Option
                </CardTitle>
                <CardDescription className="text-xs">
                  Choose your thali preference. The subscription price updates based on your chosen meal.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="grid grid-cols-2 gap-2.5">
                  {thalisLoading
                    ? [1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 rounded-xl bg-muted/60 animate-pulse border" />
                      ))
                    : mealOptions?.map((thali) => {
                        const isSelected = selectedThaliId === thali.id
                        return (
                          <button
                            key={thali.id}
                            type="button"
                            onClick={() => setSelectedThaliId(thali.id)}
                            className={`text-left p-3 rounded-xl border transition-all relative flex flex-col justify-between min-h-[68px] ${
                              isSelected
                                ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                                : 'border-input hover:bg-muted/40 text-muted-foreground'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1 w-full">
                              <span
                                className={`font-semibold text-xs leading-tight ${
                                  isSelected ? 'text-foreground font-bold' : 'text-foreground/90'
                                }`}
                              >
                                {thali.name}
                              </span>
                              {isSelected ? (
                                <span className="size-2 rounded-full bg-primary shrink-0 mt-0.5 shadow-xs" />
                              ) : (
                                <span className="size-2 rounded-full border border-border/80 shrink-0 mt-0.5" />
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1">
                              {thali.description || 'Authentic Kathiyawadi meal'}
                            </p>
                          </button>
                        )
                      })}
                </div>
              </CardContent>
            </Card>

            {/* 3. Meal Slot Choice */}
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  Select Delivery Slot
                </CardTitle>
                <CardDescription className="text-xs">
                  Choose whether you want lunch, dinner, or both meals delivered.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMealSlot('lunch')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all min-h-[50px] ${
                      mealSlot === 'lunch'
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                        : 'border-input hover:bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <Sun className="size-4 text-amber-500 mb-1" />
                    <span>Lunch</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMealSlot('dinner')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all min-h-[50px] ${
                      mealSlot === 'dinner'
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                        : 'border-input hover:bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <Moon className="size-4 text-indigo-500 mb-1" />
                    <span>Dinner</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMealSlot('both')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all min-h-[50px] ${
                      mealSlot === 'both'
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                        : 'border-input hover:bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <UtensilsCrossed className="size-4 text-primary mb-1" />
                    <span>Both (2x)</span>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* 3. Start Date Picker */}
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="size-4 text-primary" />
                  Subscription Start Date
                </CardTitle>
                <CardDescription className="text-xs">
                  Your daily meals and delivery ledger will begin on this day.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2">
                <Input
                  type="date"
                  min={minDateStr}
                  max={maxDateStr}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full sm:w-60 text-xs min-h-[44px]"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Minimum booking lead time is {settings?.min_lead_days ?? 1} day. Delivery dates
                  automatically align with your plan's schedule.
                </p>
              </CardContent>
            </Card>

            {/* 4. Delivery Address Selection */}
            <Card>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="size-4 text-primary" />
                    Delivery Address
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAddressDialogOpen(true)}
                    className="gap-1 text-xs h-8 border-primary/40 text-primary"
                  >
                    <Plus className="size-3.5" />
                    Add Address
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  Hot tiffins will be delivered to this location in Ahmedabad.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 pt-1">
                {addressesLoading ? (
                  <Skeleton className="h-20 w-full rounded-xl" />
                ) : addresses && addresses.length > 0 ? (
                  <RadioGroup
                    value={selectedAddressId}
                    onValueChange={setSelectedAddressId}
                    className="space-y-2.5"
                  >
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id
                      return (
                        <label
                          key={addr.id}
                          className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary/5 font-medium'
                              : 'border-border hover:bg-muted/30 text-muted-foreground'
                          }`}
                        >
                          <RadioGroupItem value={addr.id} className="mt-0.5" />
                          <div className="space-y-0.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">
                                {addr.contact_name}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                • {addr.contact_phone}
                              </span>
                              {addr.is_default && (
                                <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-foreground/90 leading-tight">
                              {addr.address_line1}
                              {addr.address_line2 ? `, ${addr.address_line2}` : ''}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {addr.landmark ? `Near ${addr.landmark}, ` : ''}
                              {addr.city} {addr.pincode}
                            </p>
                          </div>
                        </label>
                      )
                    })}
                  </RadioGroup>
                ) : (
                  <div className="py-6 text-center space-y-2">
                    <p className="text-xs text-muted-foreground">No saved addresses found.</p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setAddressDialogOpen(true)}
                      className="gap-1 text-xs"
                    >
                      <Plus className="size-3.5" />
                      Add Delivery Address
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 5. Payment Selection */}
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CreditCard className="size-4 text-primary" />
                  Payment Method
                </CardTitle>
                <CardDescription className="text-xs">
                  Prepay securely or pay via Cash/UPI on the first delivery.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer min-h-[44px] ${
                      paymentMethod === 'upi'
                        ? 'border-primary bg-primary/5 font-semibold text-foreground'
                        : 'border-border text-muted-foreground hover:bg-muted/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="text-primary focus:ring-primary size-4"
                    />
                    <span>UPI / QR / Netbanking</span>
                  </label>

                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer min-h-[44px] ${
                      paymentMethod === 'cash'
                        ? 'border-primary bg-primary/5 font-semibold text-foreground'
                        : 'border-border text-muted-foreground hover:bg-muted/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      className="text-primary focus:ring-primary size-4"
                    />
                    <span>Cash on First Delivery</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT 1 COLUMN: ORDER SUMMARY & SUBMIT ── */}
          <div className="space-y-4 lg:sticky lg:top-24">
            <Card className="border-2 border-primary/30 shadow-sm bg-card">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base font-bold">Subscription Summary</CardTitle>
                <CardDescription className="text-xs">
                  Server-calculated authoritative quote
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 pt-1 space-y-3">
                {quoteLoading ? (
                  <div className="space-y-2 py-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-6 w-full mt-2" />
                  </div>
                ) : quote ? (
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Meal Option</span>
                      <span className="font-semibold text-foreground">
                        {quote.meal_thali_name || activeThali?.name || 'Regular Thali'}
                      </span>
                    </div>

                    <div className="flex justify-between text-muted-foreground">
                      <span>Plan Duration</span>
                      <span className="font-semibold text-foreground">
                        {quote.duration_meal_days} Meal-Days
                      </span>
                    </div>

                    <div className="flex justify-between text-muted-foreground">
                      <span>Meals per day</span>
                      <span className="font-semibold text-foreground">
                        {mealSlot === 'both' ? '2 (Lunch + Dinner)' : '1 Meal'}
                      </span>
                    </div>

                    <div className="flex justify-between text-muted-foreground">
                      <span>Base Meal Rate</span>
                      <span className="font-semibold text-foreground">
                        {CURRENCY_SYMBOL}
                        {quote.base_mrp || quote.base_thali_price} / meal
                      </span>
                    </div>

                    <div className="flex justify-between text-muted-foreground">
                      <span>Original Subtotal</span>
                      <span className="line-through">
                        {CURRENCY_SYMBOL}
                        {Math.round(quote.original_price).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {quote.discount_amount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Plan Discount ({quote.discount_percentage}%)</span>
                        <span>
                          -{CURRENCY_SYMBOL}
                          {Math.round(quote.discount_amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-muted-foreground">
                      <span>Complimentary Add-ons</span>
                      <span className="text-emerald-600 font-semibold">Included (FREE)</span>
                    </div>

                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery Fee</span>
                      <span className="text-emerald-600 font-bold">FREE</span>
                    </div>

                    <div className="pt-2 border-t flex justify-between items-baseline">
                      <div>
                        <span className="font-bold text-sm text-foreground">Total Payable</span>
                        <p className="text-[10px] text-emerald-600 font-medium">
                          You save {CURRENCY_SYMBOL}{Math.round(quote.discount_amount).toLocaleString('en-IN')} on this plan
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-display text-2xl font-extrabold text-foreground">
                          {CURRENCY_SYMBOL}
                          {Math.round(quote.final_price).toLocaleString('en-IN')}
                        </span>
                        <p className="text-[10px] text-muted-foreground">
                          ≈ {CURRENCY_SYMBOL}
                          {Math.round(
                            quote.final_price /
                              (mealSlot === 'both'
                                ? quote.duration_meal_days * 2
                                : quote.duration_meal_days),
                          )}{' '}
                          / meal
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Terms agreement */}
                <div className="pt-2 border-t text-[11px] text-muted-foreground space-y-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 rounded text-primary focus:ring-primary size-3.5"
                    />
                    <span>
                      I agree to the FoodIQ subscription policy. I can skip meals on delivery day before
                      the slot cutoff (10:00 AM Lunch / 07:00 PM Dinner) to extend my plan.
                    </span>
                  </label>
                </div>

                <Button
                  size="lg"
                  disabled={
                    !selectedAddressId ||
                    !startDate ||
                    !agreedToTerms ||
                    createMutation.isPending ||
                    quoteLoading
                  }
                  onClick={handleConfirmSubscription}
                  className="w-full gap-2 font-bold text-sm bg-primary text-primary-foreground min-h-[48px] shadow-sm hover:bg-primary/95"
                >
                  {createMutation.isPending ? (
                    'Activating Plan...'
                  ) : (
                    <>
                      <span>Confirm &amp; Subscribe</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>

                <p className="text-[10px] text-center text-muted-foreground">
                  🔒 Safe &amp; verified Ahmedabad homemade tiffin service.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add New Address Dialog Flow */}
      <AddressFlowDialog
        open={addressDialogOpen}
        onOpenChange={setAddressDialogOpen}
        onSaved={(newAddress) => {
          if (newAddress) {
            setSelectedAddressId(newAddress.id)
          }
          setAddressDialogOpen(false)
        }}
      />
    </div>
  )
}
