import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Minus,
  Moon,
  Navigation,
  Plus,
  ShoppingBag,
  Sparkles,
  Sun,
  Trash2,
  Utensils,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EmptyState } from '@/components/common/empty-state'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AddressFlowDialog } from '@/features/addresses/components/address-flow-dialog'
import { useAddresses, useUpdateAddress } from '@/features/addresses/hooks/use-addresses'
import { usePlaceOrder } from '@/features/checkout/hooks/use-checkout'
import {
  useDeliveryAreas,
  useDeliveryFeeRules,
  useKitchenLocation,
} from '@/features/addresses/hooks/use-delivery-zones'
import {
  resolveDeliveryCharge,
  type DeliveryResolutionResult,
} from '@/features/checkout/services/delivery-charge-resolver'
import {
  useCartSummary,
  useRemoveCartItem,
  useUpdateCartItemQuantity,
} from '@/features/cart/hooks/use-cart'
import { customizationsTotal, type SelectedCustomization } from '@/features/cart/services/cart-service'
import { useMealTiming } from '@/features/menu/hooks/use-meal-timing'
import { CURRENCY_SYMBOL, ROUTES } from '@/constants'
import type { MealType, PaymentMethod, Tables } from '@/types/database.types'

export function CheckoutPage() {
  const navigate = useNavigate()
  // Delivery date is fixed to today (cannot be changed by user)
  const deliveryDate = dayjs().format('YYYY-MM-DD')
  const timing = useMealTiming(deliveryDate)

  const isToday = true

  // Auto-detect meal type from the active menu tab
  const mealType: MealType = timing.activeSlot
  const { items, itemCount, subtotal, hasUnavailableItems, unavailableItemsMap, isPending } =
    useCartSummary(mealType)
  const updateQuantity = useUpdateCartItemQuantity()
  const removeItem = useRemoveCartItem()

  const handleRemoveUnavailable = () => {
    for (const [itemId] of unavailableItemsMap) {
      removeItem.mutate(itemId)
    }
  }
  const { data: addresses, isPending: addressesPending } = useAddresses()
  
  // Zone Data Hooks (Standard delivery_areas + distance fee rules)
  const { data: areas = [] } = useDeliveryAreas()
  const { data: feeRules = [] } = useDeliveryFeeRules()
  const { data: kitchenLoc } = useKitchenLocation()

  const placeOrder = usePlaceOrder()
  const updateAddress = useUpdateAddress()

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [manageAddressesOpen, setManageAddressesOpen] = useState(false)
  // Payment method is always Cash on Delivery (COD)
  const paymentMethod: PaymentMethod = 'cash'
  const [instructions, setInstructions] = useState('')
  // Prompt for preferred time if address doesn't have one set
  const [showTimePrompt, setShowTimePrompt] = useState(false)
  const [promptedTime, setPromptedTime] = useState('')

  const selectedAddress = useMemo(
    () => addresses?.find((a) => a.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  )

  // Auto-suggest address based on meal type
  useEffect(() => {
    if (!addresses?.length || selectedAddressId) return
    
    // Priority: address tagged for this meal type > tagged 'both' > default > first
    const mealTagged = addresses.find(
      (a) => a.meal_type_tag === mealType
    )
    const bothTagged = addresses.find((a) => a.meal_type_tag === 'both')
    const defaultAddr = addresses.find((a) => a.is_default)
    
    const best = mealTagged ?? bothTagged ?? defaultAddr ?? addresses[0]
    setSelectedAddressId(best.id)
  }, [addresses, mealType, selectedAddressId])

  // When meal type changes and user hasn't manually selected, re-suggest
  useEffect(() => {
    if (!addresses?.length) return

    const mealTagged = addresses.find((a) => a.meal_type_tag === mealType)
    if (mealTagged && mealTagged.id !== selectedAddressId) {
      setSelectedAddressId(mealTagged.id)
    }
  }, [mealType]) // intentionally only re-run when mealType changes

  // Check if selected address needs preferred time prompt
  useEffect(() => {
    if (selectedAddress && !selectedAddress.preferred_time) {
      setShowTimePrompt(true)
    } else {
      setShowTimePrompt(false)
      setPromptedTime('')
    }
  }, [selectedAddress])

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

  // Check if the current meal cutoff has passed
  const isTimingCutoffPassed = useMemo(() => {
    if (isOnly24x7Items) return false
    if (!isToday) return false
    const mealTiming = timing.slots[mealType]
    return mealTiming ? !mealTiming.isOpen : false
  }, [isOnly24x7Items, isToday, mealType, timing.slots])

  const canSubmit = Boolean(
    selectedAddressId &&
      items.length &&
      !hasUnavailableItems &&
      !isTimingCutoffPassed &&
      !placeOrder.isPending,
  )

  const handleSavePreferredTime = () => {
    if (!selectedAddressId || !promptedTime) return
    updateAddress.mutate(
      { id: selectedAddressId, input: { preferred_time: `${promptedTime}:00` } },
      {
        onSuccess: () => {
          setShowTimePrompt(false)
          toast.success('Preferred time saved to your address')
        },
      },
    )
  }

  const handlePlaceOrder = () => {
    if (!selectedAddressId) return

    // Snapshot preferred time from address (or from prompt if just entered)
    const preferredTime = selectedAddress?.preferred_time
      ? selectedAddress.preferred_time.slice(0, 5)
      : promptedTime || null

    placeOrder.mutate(
      {
        addressId: selectedAddressId,
        deliveryDate,
        deliverySlotId: null, // No more slot picker — kept for backward compat
        paymentMethod,
        specialInstructions: instructions.trim() || null,
        paymentReference: null,
        deliveryCharge: deliveryFee,
        zoneType: deliveryResolution.zoneType,
        isOutOfZone: deliveryResolution.isOutOfZone,
        zoneLabel: deliveryResolution.zoneLabel,
        preferredLunchTime: preferredTime
          ? `Preferred: ${preferredTime}`
          : `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} delivery`,
      },
      {
        onSuccess: (order) => navigate(ROUTES.orderSuccess(order.id)),
        onError: (error) => toast.error(error.message),
      },
    )
  }

  const handleAddressSaved = (address: Tables<'addresses'> | null) => {
    if (address) setSelectedAddressId(address.id)
    setAddressDialogOpen(false)
  }

  if (isPending || addressesPending) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added any dishes yet. Explore today's freshly prepared menu and add meals to place an order."
          action={
            <Button asChild size="lg" className="rounded-xl px-6">
              <Link to={ROUTES.menu}>Browse Today&apos;s Menu</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const MealIcon = mealType === 'dinner' ? Moon : Sun

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-4 py-5 sm:py-6 pb-28 lg:pb-12">
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          
          {/* ── Meal type indicator (auto-detected) ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-card/60 p-4">
            <div className="flex items-center gap-3">
              <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                mealType === 'dinner' 
                  ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                  : 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400'
              }`}>
                <MealIcon className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-sm capitalize">
                  {mealType === 'dinner' ? '🌙' : '☀️'} {mealType} Order
                </p>
                <p className="text-xs text-muted-foreground">
                  {dayjs(deliveryDate).format('ddd, D MMM YYYY')}
                  {timing.slots[mealType]?.isOpen && timing.slots[mealType]?.minutesRemaining
                    ? ` · ${timing.slots[mealType]!.minutesRemaining} min left to order`
                    : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <div className="flex rounded-lg border bg-muted/40 p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => timing.setActiveSlot('lunch')}
                  disabled={!timing.slots.lunch?.isOpen}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    mealType === 'lunch'
                      ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground'
                  }`}
                >
                  ☀️ Lunch {!timing.slots.lunch?.isOpen ? '(Closed)' : ''}
                </button>
                <button
                  type="button"
                  onClick={() => timing.setActiveSlot('dinner')}
                  disabled={!timing.slots.dinner?.isOpen}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    mealType === 'dinner'
                      ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground'
                  }`}
                >
                  🌙 Dinner {!timing.slots.dinner?.isOpen ? '(Closed)' : ''}
                </button>
              </div>
            </div>
          </div>

          {isTimingCutoffPassed && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertDescription>
                Ordering for today's {mealType} is closed.
              </AlertDescription>
            </Alert>
          )}

          {/* ── Order Items Section (Unified Cart) ── */}
          <Card className="overflow-hidden border-border/80 shadow-sm">
            <div className="flex items-center justify-between border-b px-4 sm:px-5 py-3.5 bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  <ShoppingBag className="size-4" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm sm:text-base text-foreground leading-tight">Order Items</h2>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'} in your order
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-xs text-primary font-semibold hover:text-primary gap-1 h-8 px-2.5"
              >
                <Link to={ROUTES.menu}>
                  <Plus className="size-3.5" />
                  Add dishes
                </Link>
              </Button>
            </div>

            <CardContent className="p-4 sm:p-5 space-y-4">
              {hasUnavailableItems && (
                <Alert
                  variant="destructive"
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4 shrink-0" />
                    <AlertDescription className="text-xs">
                      Some items are unavailable or not part of today&apos;s {mealType} menu.
                    </AlertDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 text-xs border-destructive text-destructive hover:bg-destructive hover:text-white h-8"
                    onClick={handleRemoveUnavailable}
                  >
                    Remove unavailable items
                  </Button>
                </Alert>
              )}

              <div className="divide-y divide-border/60">
                {items.map((item) => {
                  const unavailabilityReason = unavailableItemsMap.get(item.id)
                  const isAvailable = !unavailabilityReason
                  const basePrice = item.food_item_variants
                    ? item.food_item_variants.price
                    : item.food_items.price
                  const addOns = (item.customizations as SelectedCustomization[] | null) ?? []
                  const unitPrice = basePrice + customizationsTotal(addOns)
                  const itemTotal = unitPrice * item.quantity

                  return (
                    <div
                      key={item.id}
                      className={`py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                        !isAvailable ? 'opacity-65' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        {/* Food Image */}
                        <div className="bg-muted relative size-16 sm:size-20 shrink-0 overflow-hidden rounded-xl border border-border/70">
                          {item.food_items.image_url ? (
                            <img
                              src={item.food_items.image_url}
                              alt={item.food_items.name}
                              className={`size-full object-cover ${!isAvailable ? 'grayscale opacity-60' : ''}`}
                            />
                          ) : (
                            <div className="size-full flex items-center justify-center text-muted-foreground/60 bg-muted/40">
                              <Utensils className="size-5" />
                            </div>
                          )}
                        </div>

                        {/* Dish Details */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-semibold text-sm sm:text-base text-foreground">
                              {item.food_items.name}
                            </span>
                            {item.food_item_variants && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 border-emerald-300 text-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300"
                              >
                                {item.food_item_variants.label}
                              </Badge>
                            )}
                            {!isAvailable && (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                {unavailabilityReason}
                              </Badge>
                            )}
                          </div>

                          {/* Customizations summary */}
                          {addOns.length > 0 && (
                            <p className="text-muted-foreground text-xs leading-relaxed">
                              + {addOns.map((c) => c.name).join(', ')}
                            </p>
                          )}

                          {/* Special instructions */}
                          {item.special_instructions && (
                            <p className="text-xs text-muted-foreground/80 italic">
                              &ldquo;{item.special_instructions}&rdquo;
                            </p>
                          )}

                          {/* Unit price indicator */}
                          <p className="text-xs font-medium text-muted-foreground">
                            {CURRENCY_SYMBOL}{unitPrice} each
                          </p>
                        </div>
                      </div>

                      {/* Stepper + Total Price + Delete button */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                        {/* Stepper Controls */}
                        <div className="flex items-center gap-1 rounded-xl border bg-muted/30 p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            disabled={!isAvailable}
                            onClick={() => {
                              if (item.quantity <= 1) {
                                removeItem.mutate(item.id)
                              } else {
                                updateQuantity.mutate({ id: item.id, quantity: item.quantity - 1 })
                              }
                            }}
                            aria-label={item.quantity <= 1 ? 'Remove item' : 'Decrease quantity'}
                          >
                            {item.quantity <= 1 ? (
                              <Trash2 className="size-3.5 text-destructive" />
                            ) : (
                              <Minus className="size-3.5" />
                            )}
                          </Button>

                          <span className="w-7 text-center font-bold text-xs sm:text-sm tabular-nums">
                            {item.quantity}
                          </span>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                            disabled={!isAvailable || item.quantity >= 10}
                            onClick={() =>
                              updateQuantity.mutate({ id: item.id, quantity: item.quantity + 1 })
                            }
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3.5" />
                          </Button>
                        </div>

                        {/* Item line price */}
                        <div className="text-right min-w-[70px]">
                          <span className="font-bold text-sm sm:text-base text-foreground">
                            {CURRENCY_SYMBOL}{itemTotal}
                          </span>
                        </div>

                        {/* Direct remove icon (desktop) */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0 hidden sm:flex"
                          onClick={() => removeItem.mutate(item.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* ── Delivery address (single selected + manage option) ── */}
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 font-medium">
                  <MapPin className="size-4 text-emerald-600" aria-hidden />
                  Delivery address
                </p>
                {addresses && addresses.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary font-medium hover:text-primary gap-1"
                    onClick={() => setManageAddressesOpen(true)}
                  >
                    Manage delivery address
                  </Button>
                )}
              </div>

              {addressesPending ? (
                <Skeleton className="h-24 w-full rounded-xl" />
              ) : !addresses?.length ? (
                <div className="text-center py-6 border border-dashed rounded-xl space-y-3">
                  <p className="text-xs text-muted-foreground">No delivery addresses saved yet.</p>
                  <Button size="sm" onClick={() => setAddressDialogOpen(true)}>
                    <Plus className="size-3.5 mr-1" /> Pin Location on Map & Add Address
                  </Button>
                </div>
              ) : selectedAddress ? (
                <div className="rounded-xl border border-primary/30 bg-primary/[0.03] p-4 space-y-2 relative transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="capitalize text-xs font-semibold px-2 py-0.5 border-primary/40 text-primary bg-primary/5">
                        {selectedAddress.label}
                      </Badge>
                      <span className="font-semibold text-sm text-foreground">
                        {selectedAddress.contact_name}
                      </span>
                      {selectedAddress.contact_phone && (
                        <span className="text-xs text-muted-foreground">· {selectedAddress.contact_phone}</span>
                      )}
                      {selectedAddress.is_default && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          Default
                        </Badge>
                      )}
                      {selectedAddress.meal_type_tag !== 'both' && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          selectedAddress.meal_type_tag === 'lunch'
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}>
                          {selectedAddress.meal_type_tag === 'lunch' ? '☀️ Lunch Address' : '🌙 Dinner Address'}
                        </span>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setManageAddressesOpen(true)}
                      className="text-xs h-8 shrink-0 hover:bg-primary hover:text-white"
                    >
                      Change
                    </Button>
                  </div>

                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {selectedAddress.address_line1}
                    {selectedAddress.address_line2 ? `, ${selectedAddress.address_line2}` : ''}
                    {selectedAddress.landmark ? `, ${selectedAddress.landmark}` : ''}, {selectedAddress.city}{' '}
                    {selectedAddress.pincode}
                  </p>

                  {selectedAddress.preferred_time && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                      <Clock className="size-3 text-muted-foreground" />
                      <span>Preferred delivery: <strong className="text-foreground">{selectedAddress.preferred_time.slice(0, 5)}</strong></span>
                    </div>
                  )}
                </div>
              ) : null}

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

              {/* Preferred time prompt — shown only if selected address has no preferred_time */}
              {showTimePrompt && selectedAddress && (
                <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-orange-800 dark:text-orange-300">
                    <Clock className="size-4 text-orange-500" />
                    What time do you prefer delivery here?
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    This helps us plan our delivery route. You only need to set it once — it'll be saved to this address.
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={promptedTime}
                      onChange={(e) => setPromptedTime(e.target.value)}
                      className="max-w-[140px] text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSavePreferredTime}
                      disabled={!promptedTime || updateAddress.isPending}
                      className="text-xs"
                    >
                      {updateAddress.isPending ? <Loader2 className="size-3.5 animate-spin" /> : 'Save'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTimePrompt(false)}
                      className="text-xs text-muted-foreground"
                    >
                      Skip
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manage Addresses Selection Dialog */}
          <Dialog open={manageAddressesOpen} onOpenChange={setManageAddressesOpen}>
            <DialogContent className="max-w-md sm:max-w-lg max-h-[85vh] flex flex-col p-5">
              <DialogHeader>
                <div className="flex items-center justify-between pr-6">
                  <DialogTitle className="text-base font-bold">
                    Select Delivery Address
                  </DialogTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1 h-8"
                    onClick={() => {
                      setManageAddressesOpen(false)
                      setAddressDialogOpen(true)
                    }}
                  >
                    <Plus className="size-3.5" />
                    Add new
                  </Button>
                </div>
              </DialogHeader>

              <div className="overflow-y-auto space-y-2.5 py-2 pr-1 flex-1">
                {addresses?.map((address) => {
                  const isSelected = address.id === selectedAddressId
                  return (
                    <div
                      key={address.id}
                      onClick={() => {
                        setSelectedAddressId(address.id)
                        setManageAddressesOpen(false)
                      }}
                      className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'hover:border-gray-300 hover:bg-muted/40'
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-xs capitalize px-2 py-0.5 rounded-md bg-muted">
                            {address.label}
                          </span>
                          <span className="font-medium text-xs text-foreground">
                            {address.contact_name}
                          </span>
                          {address.is_default && (
                            <Badge variant="secondary" className="text-[10px] px-1 py-0">Default</Badge>
                          )}
                          {address.meal_type_tag !== 'both' && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              address.meal_type_tag === 'lunch'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-indigo-100 text-indigo-700'
                            }`}>
                              {address.meal_type_tag === 'lunch' ? '☀️ Lunch' : '🌙 Dinner'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {address.address_line1}
                          {address.address_line2 ? `, ${address.address_line2}` : ''}
                          {address.landmark ? `, ${address.landmark}` : ''}, {address.city} {address.pincode}
                        </p>
                        {address.preferred_time && (
                          <p className="text-[11px] text-muted-foreground">
                            🕐 Preferred: {address.preferred_time.slice(0, 5)}
                          </p>
                        )}
                      </div>

                      <Button
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs h-7 shrink-0 ml-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedAddressId(address.id)
                          setManageAddressesOpen(false)
                        }}
                      >
                        {isSelected ? 'Selected' : 'Deliver here'}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </DialogContent>
          </Dialog>

          {/* 2-Step Address Flow Dialog (Map Location Picker + Details Form) */}
          <AddressFlowDialog
            open={addressDialogOpen}
            onOpenChange={setAddressDialogOpen}
            onSaved={handleAddressSaved}
          />

          {/* ── Payment method (Always Cash on Delivery) ── */}
          <Card>
            <CardContent className="space-y-3 pt-6">
              <p className="font-medium">Payment method</p>
              <div className="flex items-center gap-3.5 rounded-xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-4">
                <div className="size-9 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    Cash on delivery (COD)
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pay in cash to our delivery executive when your meal arrives.
                  </p>
                </div>
              </div>
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

              {/* Meal type badge in summary */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-3">
                <MealIcon className="size-3.5" />
                <span className="capitalize">{mealType} delivery · {dayjs(deliveryDate).format('D MMM')}</span>
                {selectedAddress?.preferred_time && (
                  <span>· Preferred: {selectedAddress.preferred_time.slice(0, 5)}</span>
                )}
              </div>

              <Button
                className="w-full font-bold h-11 rounded-xl text-sm"
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
                  `Place order · ${CURRENCY_SYMBOL}${total}`
                )}
              </Button>

              <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-foreground" size="sm" asChild>
                <Link to={ROUTES.menu}>
                  <Plus className="mr-1 size-3.5" /> Add more items from menu
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Mobile Sticky Checkout Bar ── */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-background/95 backdrop-blur-md border-t p-3 sm:p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] block lg:hidden">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              To Pay
            </p>
            <p className="text-lg font-extrabold text-foreground leading-tight">
              {CURRENCY_SYMBOL}{total}
            </p>
          </div>

          <Button
            size="lg"
            className="flex-1 max-w-[220px] font-bold rounded-xl h-11 text-sm shadow-md"
            disabled={!canSubmit || placeOrder.isPending}
            onClick={handlePlaceOrder}
          >
            {placeOrder.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Placing…
              </>
            ) : deliveryResolution.isOutOfZone ? (
              'Request Delivery'
            ) : (
              'Place order'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
