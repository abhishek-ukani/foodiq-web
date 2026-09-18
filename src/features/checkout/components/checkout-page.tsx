import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  ChevronLeft,
  Loader2,
  MapPin,
  Navigation,
  Plus,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EmptyState } from '@/components/common/empty-state'
import { AddressFlowDialog } from '@/features/addresses/components/address-flow-dialog'
import { useAddresses } from '@/features/addresses/hooks/use-addresses'
import { useActiveDeliverySlots, usePlaceOrder } from '@/features/checkout/hooks/use-checkout'
import {
  useDeliveryAreas,
  useDeliveryFeeRules,
  useKitchenLocation,
} from '@/features/addresses/hooks/use-delivery-zones'
import {
  resolveDeliveryCharge,
  type DeliveryResolutionResult,
} from '@/features/checkout/services/delivery-charge-resolver'
import { useCartSummary } from '@/features/cart/hooks/use-cart'
import { useMealTiming } from '@/features/menu/hooks/use-meal-timing'
import { CURRENCY_SYMBOL, ROUTES } from '@/constants'
import type { MealType, PaymentMethod, Tables } from '@/types/database.types'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal, hasUnavailableItems } = useCartSummary()
  const { data: addresses, isPending: addressesPending } = useAddresses()
  
  // Zone Data Hooks (Standard delivery_areas + distance fee rules)
  const { data: areas = [] } = useDeliveryAreas()
  const { data: feeRules = [] } = useDeliveryFeeRules()
  const { data: kitchenLoc } = useKitchenLocation()

  const placeOrder = usePlaceOrder()
  const { data: dbSlots = [] } = useActiveDeliverySlots()

  const [deliveryDate, setDeliveryDate] = useState(dayjs().format('YYYY-MM-DD'))
  const timing = useMealTiming(deliveryDate)

  const isToday = deliveryDate === dayjs().format('YYYY-MM-DD')

  // Fallback to standard slots if admin hasn't configured custom slots yet
  const slots = useMemo(() => {
    if (dbSlots && dbSlots.length > 0) {
      return dbSlots
    }
    return [
      {
        id: 'lunch',
        branch_id: '',
        label: 'Lunch (Deliver Before 1:30 PM)',
        meal_type: 'lunch' as MealType,
        start_time: '12:00:00',
        end_time: '13:30:00',
        cutoff_time: '11:30:00',
        max_orders: null,
        display_order: 1,
        is_active: true,
        created_at: '',
        updated_at: '',
      },
      {
        id: 'dinner',
        branch_id: '',
        label: 'Dinner (Deliver Before 8:00 PM)',
        meal_type: 'dinner' as MealType,
        start_time: '19:00:00',
        end_time: '20:30:00',
        cutoff_time: '20:00:00',
        max_orders: null,
        display_order: 2,
        is_active: true,
        created_at: '',
        updated_at: '',
      },
    ]
  }, [dbSlots])

  const getSlotCutoffInfo = (slot: { meal_type: MealType; cutoff_time: string | null }) => {
    const todayStr = dayjs().format('YYYY-MM-DD')
    if (deliveryDate > todayStr) {
      return { isPassed: false, formattedCutoff: '' }
    }
    if (deliveryDate < todayStr) {
      return { isPassed: true, formattedCutoff: 'Past date' }
    }
    const mealTiming = timing.slots[slot.meal_type]
    if (mealTiming) {
      return {
        isPassed: !mealTiming.isOpen,
        formattedCutoff: mealTiming.formattedCutoff,
      }
    }
    if (!slot.cutoff_time) return { isPassed: false, formattedCutoff: '' }
    const parts = slot.cutoff_time.slice(0, 5).split(':').map(Number)
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return { isPassed: false, formattedCutoff: '' }
    const cutoffDateTime = dayjs().hour(parts[0]).minute(parts[1]).second(0)
    const isPassed = dayjs().isAfter(cutoffDateTime)
    const d = new Date()
    d.setHours(parts[0], parts[1], 0, 0)
    const formattedCutoff = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    return { isPassed, formattedCutoff }
  }

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [selectedSlotId, setSelectedSlotId] = useState<string>('')
  const [customDeliveryTime, setCustomDeliveryTime] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [paymentReference, setPaymentReference] = useState('')
  const [instructions, setInstructions] = useState('')

  // Set default selected slot based on active timing or first available slot
  useEffect(() => {
    if (!slots.length) return
    const isCurrentValid = slots.some((s) => s.id === selectedSlotId) || selectedSlotId === 'custom'
    if (!selectedSlotId || !isCurrentValid) {
      const preferred =
        slots.find((s) => s.meal_type === timing.activeSlot && !getSlotCutoffInfo(s).isPassed) ||
        slots.find((s) => !getSlotCutoffInfo(s).isPassed) ||
        slots[0]
      if (preferred) setSelectedSlotId(preferred.id)
    }
  }, [slots, timing.activeSlot, deliveryDate, selectedSlotId])

  const selectedAddress = useMemo(
    () => addresses?.find((a) => a.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  )

  // Preselect default address when loaded
  useEffect(() => {
    if (addresses?.length && !selectedAddressId) {
      const def = addresses.find((a) => a.is_default) ?? addresses[0]
      setSelectedAddressId(def.id)
    }
  }, [addresses, selectedAddressId])

  // Resolve delivery charge based on selected address
  const deliveryResolution: DeliveryResolutionResult = useMemo(() => {
    return resolveDeliveryCharge(
      selectedAddress,
      areas,
      feeRules,
      kitchenLoc,
    )
  }, [selectedAddress, areas, feeRules, kitchenLoc])

  const deliveryFee = deliveryResolution.fee
  const total = subtotal + deliveryFee

  const isOnly24x7Items =
    items.length > 0 &&
    items.every((ci) => {
      const catType = (ci.food_items as any)?.categories?.category_type
      const catSlug = (ci.food_items as any)?.categories?.slug || ''
      return (
        ci.food_items.kind === 'single' &&
        (catType === 'snack' ||
          catType === 'beverage' ||
          catType === 'sweet' ||
          catSlug.includes('snack') ||
          catSlug.includes('farsan') ||
          catSlug.includes('nasta'))
      )
    })

  const isTimingCutoffPassed = useMemo(() => {
    if (isOnly24x7Items) return false
    if (!isToday) return false
    if (selectedSlotId === 'custom') {
      return slots.every((s) => getSlotCutoffInfo(s).isPassed)
    }
    const currentSlot = slots.find((s) => s.id === selectedSlotId)
    return currentSlot ? getSlotCutoffInfo(currentSlot).isPassed : false
  }, [isOnly24x7Items, isToday, selectedSlotId, slots, timing.slots])

  const canSubmit = Boolean(
    selectedAddressId &&
      items.length &&
      !hasUnavailableItems &&
      !isTimingCutoffPassed &&
      !placeOrder.isPending,
  )

  const handlePlaceOrder = () => {
    if (!selectedAddressId) return

    const chosenSlot = slots.find((s) => s.id === selectedSlotId)
    const isCustom = selectedSlotId === 'custom'

    const preferredTime = isCustom
      ? customDeliveryTime.trim()
        ? `Before ${customDeliveryTime.trim()}`
        : 'As soon as possible'
      : chosenSlot
      ? chosenSlot.label
      : 'Standard delivery'

    const deliverySlotId =
      !isCustom && chosenSlot && chosenSlot.id !== 'lunch' && chosenSlot.id !== 'dinner'
        ? chosenSlot.id
        : null

    placeOrder.mutate(
      {
        addressId: selectedAddressId,
        deliveryDate,
        deliverySlotId,
        paymentMethod,
        specialInstructions: instructions.trim() || null,
        paymentReference: paymentMethod === 'upi' ? paymentReference.trim() || null : null,
        deliveryCharge: deliveryFee,
        zoneType: deliveryResolution.zoneType,
        isOutOfZone: deliveryResolution.isOutOfZone,
        zoneLabel: deliveryResolution.zoneLabel,
        preferredLunchTime: preferredTime,
      },
      {
        onSuccess: (order) => navigate(ROUTES.orderSuccess(order.id)),
        onError: (error) => toast.error(error.message),
      },
    )
  }

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId)
  }

  const handleAddressSaved = (address: Tables<'addresses'> | null) => {
    if (address) setSelectedAddressId(address.id)
    setAddressDialogOpen(false)
  }

  if (hasUnavailableItems) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="size-4" />
          <AlertDescription>
            Your cart contains items that are currently out of stock or unavailable. Please return to your cart and remove them before placing an order.
          </AlertDescription>
        </Alert>
        <Button asChild>
          <Link to={ROUTES.cart}>Return to cart</Link>
        </Button>
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add a few dishes before checking out."
          action={
            <Button asChild>
              <Link to={ROUTES.menu}>Browse menu</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display mb-8 text-3xl font-semibold">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          
          {/* ── Delivery address ── */}
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 font-medium">
                  <MapPin className="size-4" aria-hidden />
                  Delivery address
                </p>
                <Button variant="ghost" size="sm" onClick={() => setAddressDialogOpen(true)}>
                  <Plus className="size-3.5" aria-hidden />
                  Add new address
                </Button>
              </div>

              {addressesPending ? (
                <Skeleton className="h-20 w-full rounded-lg" />
              ) : !addresses?.length ? (
                <div className="text-center py-6 border border-dashed rounded-lg space-y-3">
                  <p className="text-xs text-muted-foreground">No delivery addresses saved yet.</p>
                  <Button size="sm" onClick={() => setAddressDialogOpen(true)}>
                    <Plus className="size-3.5 mr-1" /> Pin Location on Map & Add Address
                  </Button>
                </div>
              ) : (
                <RadioGroup value={selectedAddressId ?? undefined} onValueChange={handleAddressSelect}>
                  <div className="space-y-2">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        htmlFor={`addr-${address.id}`}
                        className="hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-3 text-sm cursor-pointer"
                      >
                        <RadioGroupItem value={address.id} id={`addr-${address.id}`} className="mt-0.5" />
                        <div>
                          <p className="font-medium capitalize">
                            {address.label} — {address.contact_name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {address.address_line1}
                            {address.address_line2 ? `, ${address.address_line2}` : ''}
                            {address.landmark ? `, ${address.landmark}` : ''}, {address.city}{' '}
                            {address.pincode}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {/* Delivery Resolution Status Banner */}
              {selectedAddress && (
                <div className="pt-2">
                  {!deliveryResolution.isOutOfZone ? (
                    <div className="bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-between rounded-lg border p-3.5 text-xs font-medium">
                      <div className="flex items-center gap-2">
                        <Sparkles className="size-4 text-emerald-600 shrink-0" />
                        <span>
                          {deliveryResolution.fee === 0 ? (
                            '🎉 Free Delivery for this address!'
                          ) : (
                            <>
                              Verified Delivery Zone ({deliveryResolution.zoneLabel}): Delivery Fee{' '}
                              <strong className="font-semibold">{CURRENCY_SYMBOL}{deliveryResolution.fee}</strong>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-300 rounded-lg border p-3.5 text-xs space-y-1">
                      <div className="flex items-center gap-2 font-semibold">
                        <Navigation className="size-4 text-amber-600 shrink-0" />
                        <span>Request Delivery to Your Location</span>
                      </div>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        We don't have a fixed delivery charge for this area yet, but we will reach out to you as soon as your order is placed to confirm delivery details!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2-Step Address Flow Dialog (Map Location Picker + Details Form) */}
          <AddressFlowDialog
            open={addressDialogOpen}
            onOpenChange={setAddressDialogOpen}
            onSaved={handleAddressSaved}
          />

          {/* ── Delivery timing & Preferred Lunch Time ── */}
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div>
                <p className="font-medium">Preferred Delivery Window</p>
                <p className="text-muted-foreground text-xs">
                  Choose when you prefer your meal delivered.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="delivery-date" className="mb-1.5 block text-sm font-medium">
                    Delivery Date
                  </Label>
                  <Input
                    id="delivery-date"
                    type="date"
                    min={dayjs().format('YYYY-MM-DD')}
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="mb-1.5 block text-sm font-medium">
                    Target Meal Window
                  </Label>
                  <RadioGroup
                    value={selectedSlotId}
                    onValueChange={setSelectedSlotId}
                    className="grid grid-cols-1 gap-2"
                  >
                    {slots.map((slot) => {
                      const { isPassed, formattedCutoff } = getSlotCutoffInfo(slot)
                      const isDisabled = isPassed && !isOnly24x7Items
                      return (
                        <label
                          key={slot.id}
                          htmlFor={`slot-${slot.id}`}
                          className={`hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-xs font-medium ${
                            isDisabled ? 'opacity-50 bg-muted cursor-not-allowed' : ''
                          }`}
                        >
                          <RadioGroupItem
                            value={slot.id}
                            id={`slot-${slot.id}`}
                            disabled={isDisabled}
                          />
                          <span>
                            {slot.meal_type === 'lunch' ? '🍱' : '🍲'} {slot.label}{' '}
                            {isPassed && formattedCutoff ? `— Closed (${formattedCutoff})` : isPassed ? '— Closed' : ''}
                          </span>
                        </label>
                      )
                    })}
                    <label
                      htmlFor="slot-custom"
                      className="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-xs font-medium"
                    >
                      <RadioGroupItem value="custom" id="slot-custom" />
                      <span>🕒 Specific Time Request</span>
                    </label>
                  </RadioGroup>
                </div>
              </div>

              {isTimingCutoffPassed && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTriangle className="size-4" />
                  <AlertDescription>
                    Cutoff time for the selected delivery window has passed. Please select another slot or a future delivery date.
                  </AlertDescription>
                </Alert>
              )}

              {selectedSlotId === 'custom' && (
                <div className="pt-1">
                  <Label htmlFor="custom-time" className="mb-1 block text-xs text-muted-foreground">
                    Enter your preferred time (e.g. 1:15 PM or 7:45 PM)
                  </Label>
                  <Input
                    id="custom-time"
                    placeholder="e.g. 1:15 PM"
                    value={customDeliveryTime}
                    onChange={(e) => setCustomDeliveryTime(e.target.value)}
                    className="max-w-xs text-xs"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Payment method ── */}
          <Card>
            <CardContent className="space-y-4 pt-6">
              <p className="font-medium">Payment method</p>
              <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label htmlFor="pay-cash" className="hover:bg-muted/50 flex items-center gap-2 rounded-lg border p-3 text-sm cursor-pointer">
                    <RadioGroupItem value="cash" id="pay-cash" />
                    Cash on delivery
                  </label>
                  <label htmlFor="pay-upi" className="hover:bg-muted/50 flex items-center gap-2 rounded-lg border p-3 text-sm cursor-pointer">
                    <RadioGroupItem value="upi" id="pay-upi" />
                    UPI / Online
                  </label>
                </div>
              </RadioGroup>

              {paymentMethod === 'upi' ? (
                <div className="space-y-3 rounded-lg border p-4 bg-muted/20">
                  <p className="text-xs text-muted-foreground">
                    Pay via UPI on delivery or via payment link sent by kitchen staff.
                  </p>
                  <Input
                    placeholder="Optional: UPI UTR reference number"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="text-xs"
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* ── Special instructions ── */}
          <Card>
            <CardContent className="space-y-2 pt-6">
              <Label htmlFor="instructions" className="font-medium">
                Special instructions (optional)
              </Label>
              <Textarea
                id="instructions"
                placeholder="e.g. Less spicy, ring the bell, leave at security desk..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* ── Order summary sidebar ── */}
        <div>
          <Card className="sticky top-20">
            <CardContent className="space-y-4 pt-6">
              <p className="font-medium">Price Summary</p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{CURRENCY_SYMBOL}{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery charge</span>
                  <span>
                    {deliveryResolution.isOutOfZone ? (
                      <span className="text-amber-600 font-medium text-xs">To be confirmed</span>
                    ) : deliveryFee === 0 ? (
                      <span className="font-medium text-emerald-600">Free</span>
                    ) : (
                      `${CURRENCY_SYMBOL}${deliveryFee}`
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-between border-t pt-4 font-semibold">
                <span>Total</span>
                <span>{CURRENCY_SYMBOL}{total}</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={!canSubmit || placeOrder.isPending}
                onClick={handlePlaceOrder}
              >
                {placeOrder.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Placing order…
                  </>
                ) : deliveryResolution.isOutOfZone ? (
                  'Request Delivery & Place Order'
                ) : (
                  'Place order'
                )}
              </Button>

              <Button variant="ghost" className="w-full" size="sm" asChild>
                <Link to={ROUTES.cart}>
                  <ChevronLeft className="mr-1 size-3.5" /> Back to cart
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
