import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  ChevronLeft,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  ShoppingBag,
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
import { AddressForm } from '@/features/addresses/components/address-form'
import { useAddresses } from '@/features/addresses/hooks/use-addresses'
import {
  useActiveDeliverySlots,
  useActiveUpiQr,
  usePlaceOrder,
} from '@/features/checkout/hooks/use-checkout'
import { useResolveDelivery } from '@/features/checkout/hooks/use-resolve-delivery'
import { useCartSummary } from '@/features/cart/hooks/use-cart'
import { CURRENCY_SYMBOL, ROUTES } from '@/constants'
import type { PaymentMethod, Tables } from '@/types/database.types'
import type { DeliveryResult } from '@/features/checkout/services/resolve-delivery-service'

// ---------------------------------------------------------------------------
// Helper: Delivery Status Banner
// ---------------------------------------------------------------------------

function DeliveryStatusBanner({
  isPending,
  data,
  isError,
  onRetry,
}: {
  isPending: boolean
  data?: DeliveryResult
  isError: boolean
  onRetry: () => void
}) {
  if (isPending) {
    return (
      <div className="bg-muted/40 text-muted-foreground flex items-center gap-2 rounded-lg border p-3.5 text-xs font-medium">
        <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
        <span>Calculating delivery availability for selected address…</span>
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="warning">
        <AlertTriangle className="size-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>We couldn't determine your delivery availability right now.</span>
          <Button variant="ghost" size="sm" onClick={onRetry} className="gap-1 text-xs">
            <RefreshCw className="size-3.5" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!data) return null

  if (!data.deliverable) {
    const isBlocked = data.zone_type === 'BLOCKED'
    return (
      <Alert variant="destructive">
        <AlertTriangle className="size-4" />
        <AlertDescription>
          {isBlocked
            ? 'We do not deliver to this area at present. Please select another address.'
            : data.distance_km != null
            ? `Address is outside our ${data.distance_km} km service radius. Please choose a closer location.`
            : 'Delivery is unavailable for this location. Please try another address.'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 flex items-center justify-between rounded-lg border p-3.5 text-xs text-emerald-900 dark:text-emerald-200">
      <span className="font-medium">
        {data.zone_type === 'FREE' ? (
          '🎉 Free Delivery available for this address!'
        ) : (
          <>
            Delivery available! Charge:{' '}
            <strong className="font-semibold">{CURRENCY_SYMBOL}{data.fee}</strong>
            {data.distance_km != null ? ` (${data.distance_km} km away)` : ''}
          </>
        )}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main checkout page
// ---------------------------------------------------------------------------

export function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal } = useCartSummary()
  const { data: addresses, isPending: addressesPending } = useAddresses()
  const { data: slots, isPending: slotsPending } = useActiveDeliverySlots()
  const { data: upiQr } = useActiveUpiQr()
  const placeOrder = usePlaceOrder()
  const resolveDelivery = useResolveDelivery()

  const [deliveryDate, setDeliveryDate] = useState(dayjs().format('YYYY-MM-DD'))

  const isToday = deliveryDate === dayjs().format('YYYY-MM-DD')
  const currentTimeStr = dayjs().format('HH:mm')

  const isLunchCutoffPassed = isToday && currentTimeStr >= '11:30'
  const isDinnerCutoffPassed = isToday && currentTimeStr >= '23:00'

  // Dynamic default: Lunch if ordering before 11:30 AM, else Dinner
  const initialMealOption = useMemo<'lunch' | 'dinner'>(() => {
    const currentHM = dayjs().format('HH:mm')
    return currentHM < '11:30' ? 'lunch' : 'dinner'
  }, [])

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [deliveryTimeOption, setDeliveryTimeOption] = useState<'lunch' | 'dinner' | 'custom'>(initialMealOption)
  const [customDeliveryTime, setCustomDeliveryTime] = useState('')
  const [slotId, setSlotId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [paymentReference, setPaymentReference] = useState('')
  const [instructions, setInstructions] = useState('')

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

  // When the selected address changes, reset any previous delivery resolution
  useEffect(() => {
    resolveDelivery.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddressId])

  // Auto-trigger delivery check when an address is selected
  useEffect(() => {
    if (!selectedAddress) return
    resolveDelivery.mutate({
      locality: selectedAddress.address_line1 || selectedAddress.city || undefined,
      pincode: selectedAddress.pincode || undefined,
      lat: selectedAddress.latitude ?? undefined,
      lng: selectedAddress.longitude ?? undefined,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddress])

  // Derived delivery state
  const deliveryResolved = resolveDelivery.data
  const deliveryFee = deliveryResolved?.deliverable ? (deliveryResolved.fee ?? 0) : null
  const total = deliveryFee !== null ? subtotal + deliveryFee : subtotal

  const isTimingCutoffPassed =
    isToday &&
    ((deliveryTimeOption === 'lunch' && isLunchCutoffPassed) ||
      (deliveryTimeOption === 'dinner' && isDinnerCutoffPassed))

  // Order can proceed if an address is selected, deliverable, and cutoff hasn't passed
  const canSubmit = Boolean(
    selectedAddressId &&
      items.length &&
      deliveryResolved?.deliverable === true &&
      !resolveDelivery.isPending &&
      !isTimingCutoffPassed,
  )

  const handlePlaceOrder = () => {
    if (!selectedAddressId || !deliveryResolved?.deliverable) return

    const timeLabel =
      deliveryTimeOption === 'lunch'
        ? 'Deliver before 1:30 PM (Lunch)'
        : deliveryTimeOption === 'dinner'
        ? 'Deliver before 8:00 PM (Dinner)'
        : customDeliveryTime
        ? `Deliver before ${customDeliveryTime}`
        : 'Deliver before requested time'

    const fullInstructions = [
      `[Target Delivery: ${timeLabel}]`,
      instructions.trim(),
    ]
      .filter(Boolean)
      .join('\n')

    const effectiveSlotId = slotId || slots?.[0]?.id || undefined

    placeOrder.mutate(
      {
        addressId: selectedAddressId,
        deliveryDate,
        deliverySlotId: effectiveSlotId as any,
        paymentMethod,
        specialInstructions: fullInstructions,
        paymentReference: paymentMethod === 'upi' ? paymentReference.trim() || null : null,
        deliveryCharge: deliveryResolved.fee,
        zoneType: deliveryResolved.zone_type,
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
    setShowAddressForm(false)
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
                {addresses?.length && !showAddressForm ? (
                  <Button variant="ghost" size="sm" onClick={() => setShowAddressForm(true)}>
                    <Plus className="size-3.5" aria-hidden />
                    Add new
                  </Button>
                ) : null}
              </div>

              {addressesPending ? (
                <Skeleton className="h-20 w-full rounded-lg" />
              ) : showAddressForm || !addresses?.length ? (
                <AddressForm
                  onSaved={handleAddressSaved}
                  onCancel={addresses?.length ? () => setShowAddressForm(false) : undefined}
                />
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
                          <p className="text-muted-foreground">
                            {address.address_line1}
                            {address.landmark ? `, ${address.landmark}` : ''}, {address.city},{' '}
                            {address.state} {address.pincode}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {/* Delivery resolution status banner */}
              {selectedAddress && (
                <DeliveryStatusBanner
                  isPending={resolveDelivery.isPending}
                  data={resolveDelivery.data}
                  isError={resolveDelivery.isError}
                  onRetry={() =>
                    resolveDelivery.mutate({
                      locality: selectedAddress.address_line1 || selectedAddress.city || undefined,
                      pincode: selectedAddress.pincode || undefined,
                      lat: selectedAddress.latitude ?? undefined,
                      lng: selectedAddress.longitude ?? undefined,
                    })
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* ── Delivery timing & Deliver-Before Preference ── */}
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div>
                <p className="font-medium">Delivery Timing Preference</p>
                <p className="text-muted-foreground text-xs">
                  Choose when you need your meal delivered (e.g., before lunch or dinner).
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
                    Deliver Before Time
                  </Label>
                  <RadioGroup
                    value={deliveryTimeOption}
                    onValueChange={(v) => setDeliveryTimeOption(v as 'lunch' | 'dinner' | 'custom')}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2"
                  >
                    <label className={`hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-xs font-medium ${isLunchCutoffPassed ? 'opacity-50 bg-muted cursor-not-allowed' : ''}`}>
                      <RadioGroupItem value="lunch" id="time-lunch" disabled={isLunchCutoffPassed} />
                      <span>🍱 Lunch {isLunchCutoffPassed ? '(Closed)' : '(Before 1:30 PM)'}</span>
                    </label>
                    <label className={`hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-xs font-medium ${isDinnerCutoffPassed ? 'opacity-50 bg-muted cursor-not-allowed' : ''}`}>
                      <RadioGroupItem value="dinner" id="time-dinner" disabled={isDinnerCutoffPassed} />
                      <span>🍲 Dinner {isDinnerCutoffPassed ? '(Closed)' : '(Before 8:00 PM)'}</span>
                    </label>
                    <label className="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-xs font-medium">
                      <RadioGroupItem value="custom" id="time-custom" />
                      <span>🕒 Custom Time</span>
                    </label>
                  </RadioGroup>
                </div>
              </div>

              {isTimingCutoffPassed && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTriangle className="size-4" />
                  <AlertDescription>
                    Ordering for today's {deliveryTimeOption === 'lunch' ? 'Lunch (Cutoff 11:30 AM)' : 'Dinner'} is closed. Please select Dinner or choose a future delivery date.
                  </AlertDescription>
                </Alert>
              )}

              {deliveryTimeOption === 'custom' && (
                <div className="pt-1">
                  <Label htmlFor="custom-time" className="mb-1 block text-xs text-muted-foreground">
                    Enter your preferred time (e.g. 1:00 PM or 7:30 PM)
                  </Label>
                  <Input
                    id="custom-time"
                    placeholder="e.g. 1:00 PM"
                    value={customDeliveryTime}
                    onChange={(e) => setCustomDeliveryTime(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
              )}

              {slots && slots.length > 0 && (
                <div className="pt-2">
                  <Label className="mb-1.5 block text-xs text-muted-foreground">
                    Optional: Select specific kitchen window
                  </Label>
                  <RadioGroup value={slotId ?? undefined} onValueChange={setSlotId}>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {slots.map((slot) => (
                        <label
                          key={slot.id}
                          htmlFor={`slot-${slot.id}`}
                          className="hover:bg-muted/50 flex items-center gap-2 rounded-lg border p-2.5 text-xs cursor-pointer"
                        >
                          <RadioGroupItem value={slot.id} id={`slot-${slot.id}`} />
                          {slot.label}
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
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
                    UPI
                  </label>
                </div>
              </RadioGroup>

              {paymentMethod === 'upi' ? (
                <div className="space-y-3 rounded-lg border p-4">
                  {upiQr?.qr_image_url ? (
                    <img
                      src={upiQr.qr_image_url}
                      alt="UPI QR code"
                      className="mx-auto size-48 rounded-lg"
                    />
                  ) : (
                    <p className="text-muted-foreground text-center text-sm">
                      QR code not available right now — you can still place the order and pay via UPI ID.
                    </p>
                  )}
                  {upiQr?.upi_id ? (
                    <p className="text-center text-sm font-medium">
                      UPI ID: <span className="font-mono">{upiQr.upi_id}</span>
                    </p>
                  ) : null}
                  <Input
                    placeholder="Enter UPI reference / Transaction ID"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
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
                placeholder="e.g. Make it extra spicy, ring the bell twice, or leave at door..."
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
                    {resolveDelivery.isPending ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : deliveryResolved?.deliverable ? (
                      deliveryResolved.fee === 0 ? (
                        <span className="font-medium text-emerald-600">Free</span>
                      ) : (
                        `${CURRENCY_SYMBOL}${deliveryResolved.fee}`
                      )
                    ) : (
                      '—'
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-between border-t pt-4 font-semibold">
                <span>Total</span>
                <span>{CURRENCY_SYMBOL}{total}</span>
              </div>

              {!deliveryResolved?.deliverable && selectedAddress ? (
                <p className="text-destructive text-xs font-medium">
                  Confirm your delivery area to continue.
                </p>
              ) : null}

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
