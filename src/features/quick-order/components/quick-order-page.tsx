import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  MessageSquare,
  Minus,
  Moon,
  Plus,
  RefreshCw,
  Sparkles,
  Sun,
  Utensils,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EmptyState } from '@/components/common/empty-state'
import { useAuth } from '@/hooks/use-auth'
import { useMealTiming } from '@/features/menu/hooks/use-meal-timing'
import { useQuickOrderContext, useSubmitQuickOrder } from '../hooks/use-quick-order'
import { ChangeMealDrawer } from './change-meal-drawer'
import { ChangeAddressDrawer } from './change-address-drawer'
import { AddressFlowDialog } from '@/features/addresses/components/address-flow-dialog'
import { CURRENCY_SYMBOL, ROUTES } from '@/constants'
import { cn } from '@/lib/utils'
import type { MealType, Tables } from '@/types/database.types'
import type { ThaliFoodItem } from '../services/quick-order-service'
import type { ResolvedOptionItem } from '@/features/menu/services/thali-customizer-service'

const QUICK_NOTE_CHIPS = ['Less spicy', 'Extra crispy bhakhri', 'Ring the bell', 'Leave at door']

export function QuickOrderPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, isAuthenticated, isLoading: authLoading } = useAuth()

  // 1. Mandatory Security / Subscription Eligibility Guard
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate(ROUTES.login, { state: { from: location }, replace: true })
        return
      }
      if (profile && profile.is_subscription_eligible !== true) {
        toast.error(
          'Quick daily ordering is currently reserved for active daily subscribers. Please order from our standard menu.',
          { duration: 5000 },
        )
        navigate(ROUTES.menu, { replace: true })
      }
    }
  }, [authLoading, isAuthenticated, profile, navigate, location])

  // 2. Meal Timing & Slot Auto-Detection (Lunch / Dinner)
  const todayStr = useMemo(() => dayjs().format('YYYY-MM-DD'), [])
  const timing = useMealTiming(todayStr)
  const [selectedSlot, setSelectedSlot] = useState<MealType>('lunch')

  // Auto-set slot once timing loads
  useEffect(() => {
    if (timing.activeSlot) {
      setSelectedSlot(timing.activeSlot)
    }
  }, [timing.activeSlot])

  const activeSlotInfo = timing.slots[selectedSlot]
  const isSlotOpen = activeSlotInfo?.isOpen ?? true

  // 3. Quick Order State
  const [selectedThaliId, setSelectedThaliId] = useState<string | null>(null)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [selectedSabjiIds, setSelectedSabjiIds] = useState<string[]>([])
  const [selectedBreadIds, setSelectedBreadIds] = useState<string[]>([])

  // Drawers
  const [changeMealOpen, setChangeMealOpen] = useState(false)
  const [changeAddressOpen, setChangeAddressOpen] = useState(false)
  const [createAddressOpen, setCreateAddressOpen] = useState(false)
  const [showNotes, setShowNotes] = useState(false)

  // 4. Load Direct Order Context
  const {
    data: context,
    isLoading: contextLoading,
    isError,
    refetch,
  } = useQuickOrderContext(selectedThaliId, selectedSlot, selectedAddressId)

  const submitOrder = useSubmitQuickOrder()

  // Sync default selected Thali and Address from context
  useEffect(() => {
    if (context) {
      if (!selectedThaliId && context.selectedThali) {
        setSelectedThaliId(context.selectedThali.id)
      }
      if (!selectedAddressId && context.defaultAddress) {
        setSelectedAddressId(context.defaultAddress.id)
      }
    }
  }, [context, selectedThaliId, selectedAddressId])

  // 5. Pre-select defaults for Sabjis and Breads whenever option groups change
  const sabjiGroups = context?.sabjiGroups || []
  const breadGroups = context?.breadGroups || []
  const otherGroups = context?.otherGroups || []

  // Primary Sabji group
  const primarySabjiGroup = sabjiGroups[0] || null
  const sabjiMin = primarySabjiGroup?.min_select ?? 1
  const sabjiMax = primarySabjiGroup?.max_select ?? 1

  // Primary Bread group
  const primaryBreadGroup = breadGroups[0] || null
  const breadMin = primaryBreadGroup?.min_select ?? 1
  const breadMax = primaryBreadGroup?.max_select ?? 1

  useEffect(() => {
    if (primarySabjiGroup) {
      const avail = primarySabjiGroup.options.filter((o) => o.is_available && !o.is_cutoff_closed)
      if (avail.length > 0) {
        // Pre-select defaults or first options up to min_select
        setSelectedSabjiIds((prev) => {
          const validPrev = prev.filter((id) => avail.some((o) => o.id === id))
          if (validPrev.length >= sabjiMin) return validPrev

          const fresh: string[] = [...validPrev]
          // Prioritize explicitly default items
          avail
            .filter((o) => o.is_default && !fresh.includes(o.id))
            .forEach((o) => {
              if (fresh.length < sabjiMin) fresh.push(o.id)
            })
          // Fill remaining
          avail.forEach((o) => {
            if (fresh.length < sabjiMin && !fresh.includes(o.id)) fresh.push(o.id)
          })
          return fresh
        })
      }
    }
  }, [primarySabjiGroup, sabjiMin])

  useEffect(() => {
    if (primaryBreadGroup) {
      const avail = primaryBreadGroup.options.filter((o) => o.is_available && !o.is_cutoff_closed)
      if (avail.length > 0) {
        setSelectedBreadIds((prev) => {
          const validPrev = prev.filter((id) => avail.some((o) => o.id === id))
          if (validPrev.length >= breadMin) return validPrev

          const fresh: string[] = [...validPrev]
          avail
            .filter((o) => o.is_default && !fresh.includes(o.id))
            .forEach((o) => {
              if (fresh.length < breadMin) fresh.push(o.id)
            })
          avail.forEach((o) => {
            if (fresh.length < breadMin && !fresh.includes(o.id)) fresh.push(o.id)
          })
          return fresh
        })
      }
    }
  }, [primaryBreadGroup, breadMin])

  // Handlers for Sabji Toggles
  const handleToggleSabji = (opt: ResolvedOptionItem) => {
    if (!opt.is_available || opt.is_cutoff_closed) return

    setSelectedSabjiIds((prev) => {
      const isAlreadySelected = prev.includes(opt.id)

      if (sabjiMax === 1) {
        // Single selection
        return [opt.id]
      }

      if (isAlreadySelected) {
        // Only allow unselecting if remaining won't violate min (unless switching)
        return prev.filter((id) => id !== opt.id)
      } else {
        if (prev.length < sabjiMax) {
          return [...prev, opt.id]
        } else {
          // Replace the oldest selection if at max limit
          return [...prev.slice(1), opt.id]
        }
      }
    })
  }

  // Handlers for Bread Toggles
  const handleToggleBread = (opt: ResolvedOptionItem) => {
    if (!opt.is_available || opt.is_cutoff_closed) return

    setSelectedBreadIds((prev) => {
      const isAlreadySelected = prev.includes(opt.id)

      if (breadMax === 1) {
        return [opt.id]
      }

      if (isAlreadySelected) {
        return prev.filter((id) => id !== opt.id)
      } else {
        if (prev.length < breadMax) {
          return [...prev, opt.id]
        } else {
          return [...prev.slice(1), opt.id]
        }
      }
    })
  }

  // 6. Validation Checks
  const isSabjiValid = selectedSabjiIds.length >= sabjiMin && selectedSabjiIds.length <= sabjiMax
  const isBreadValid = selectedBreadIds.length >= breadMin && selectedBreadIds.length <= breadMax
  const hasAddress = Boolean(context?.defaultAddress)
  const isOrderValid = isSabjiValid && isBreadValid && hasAddress && isSlotOpen && !submitOrder.isPending

  // 7. Pricing Calculations
  const currentThali = context?.selectedThali || null
  const basePrice = currentThali?.price ?? 0

  // Calculate any price deltas on chosen items
  const allResolvedOptions = useMemo(() => {
    return (context?.resolvedGroups || []).flatMap((g) => g.options)
  }, [context?.resolvedGroups])

  const sabjiDeltaTotal = selectedSabjiIds.reduce((sum, id) => {
    const item = allResolvedOptions.find((o) => o.id === id)
    return sum + (item?.price_delta ?? 0)
  }, 0)

  const breadDeltaTotal = selectedBreadIds.reduce((sum, id) => {
    const item = allResolvedOptions.find((o) => o.id === id)
    return sum + (item?.price_delta ?? 0)
  }, 0)

  const mealUnitPrice = basePrice + sabjiDeltaTotal + breadDeltaTotal
  const subtotal = mealUnitPrice * quantity
  const deliveryFee = context?.deliveryResolution.fee ?? 0
  const grandTotal = subtotal + deliveryFee

  // 8. Place Order Submission
  const handlePlaceOrder = () => {
    if (!context || !currentThali) return

    if (!context.defaultAddress) {
      toast.error('Please choose or add a delivery address.')
      setChangeAddressOpen(true)
      return
    }

    if (!isSlotOpen) {
      toast.error(`Ordering for ${selectedSlot === 'lunch' ? 'Lunch' : 'Dinner'} is closed.`)
      return
    }

    if (!isSabjiValid) {
      toast.error(`Please select ${sabjiMin === 1 ? 'a Sabji' : `${sabjiMin} Sabjis`}.`)
      return
    }

    if (!isBreadValid) {
      toast.error('Please select your preferred Bread.')
      return
    }

    // Build customizations list
    const customizations: {
      id: string
      name: string
      price_delta: number
      group_name?: string
    }[] = []

    // 1. Sabji items
    selectedSabjiIds.forEach((id) => {
      const opt = primarySabjiGroup?.options.find((o) => o.id === id)
      if (opt) {
        customizations.push({
          id: opt.id,
          name: opt.label,
          price_delta: opt.price_delta,
          group_name: primarySabjiGroup.name,
        })
      }
    })

    // 2. Bread items
    selectedBreadIds.forEach((id) => {
      const opt = primaryBreadGroup?.options.find((o) => o.id === id)
      if (opt) {
        customizations.push({
          id: opt.id,
          name: opt.label,
          price_delta: opt.price_delta,
          group_name: primaryBreadGroup.name,
        })
      }
    })

    // 3. Auto-include defaults from other required groups (Rice, Accompaniments, etc.)
    otherGroups.forEach((group) => {
      if (group.is_required) {
        const available = group.options.filter((o) => o.is_available && !o.is_cutoff_closed)
        const chosen = available.find((o) => o.is_default) || available[0]
        if (chosen) {
          customizations.push({
            id: chosen.id,
            name: chosen.label,
            price_delta: chosen.price_delta,
            group_name: group.name,
          })
        }
      }
    })

    const variantId = currentThali.food_item_variants?.[0]?.id ?? null

    submitOrder.mutate(
      {
        thaliId: currentThali.id,
        variantId,
        quantity,
        addressId: context.defaultAddress.id,
        deliveryDate: todayStr,
        mealType: selectedSlot,
        specialInstructions: specialInstructions.trim() || null,
        customizations,
        deliveryCharge: deliveryFee,
        isOutOfZone: context.deliveryResolution.isOutOfZone,
        zoneType: context.deliveryResolution.zoneType,
        zoneLabel: context.deliveryResolution.zoneLabel,
      },
      {
        onSuccess: (createdOrder) => {
          toast.success('Your daily meal order has been placed!')
          navigate(ROUTES.orderSuccess(createdOrder.id))
        },
        onError: (err: any) => {
          toast.error(err?.message || 'Could not place order. Please try again.')
        },
      },
    )
  }

  // 9. Loading & Error States
  if (authLoading || (contextLoading && !context)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3.5 w-28" />
          </div>
        </div>
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    )
  }

  if (isError || !context) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          icon={AlertCircle}
          title="Could not load daily order"
          description="We had trouble loading today's menu options. Please tap below to retry."
          action={
            <Button onClick={() => refetch()} className="rounded-xl">
              <RefreshCw className="size-4 mr-2" />
              Try Again
            </Button>
          }
        />
      </div>
    )
  }

  const isFavoriteThali =
    currentThali &&
    currentThali.id === context.favoriteThaliId &&
    (context.orderCounts[currentThali.id] ?? 0) > 1

  const isRecentThali =
    currentThali && currentThali.id === context.recentThaliId && !isFavoriteThali

  const customerFirstName = profile?.full_name?.split(' ')[0] || 'Subscriber'

  return (
    <div className="min-h-screen bg-neutral-50/60 pb-32">
      {/* ── Mobile Top Sticky Header ──────────────────────────── */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border/70 px-4 py-3">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold">
              <Zap className="size-4 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-display font-bold text-base leading-tight text-foreground">
                  Daily Quick Order
                </h1>
                <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary py-0 px-1.5 font-semibold">
                  Express
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Namaste, {customerFirstName} 👋
              </p>
            </div>
          </div>

          {/* Slot Toggle: Lunch / Dinner */}
          <div className="flex items-center p-0.5 bg-neutral-200/60 rounded-full text-xs">
            <button
              type="button"
              onClick={() => setSelectedSlot('lunch')}
              className={cn(
                'px-2.5 py-1 rounded-full font-semibold transition-all flex items-center gap-1 min-h-[30px]',
                selectedSlot === 'lunch'
                  ? 'bg-white text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Sun className="size-3 text-amber-500" />
              <span>Lunch</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedSlot('dinner')}
              className={cn(
                'px-2.5 py-1 rounded-full font-semibold transition-all flex items-center gap-1 min-h-[30px]',
                selectedSlot === 'dinner'
                  ? 'bg-white text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Moon className="size-3 text-indigo-400" />
              <span>Dinner</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-3.5 pt-3.5 space-y-3.5">
        {/* ── Cutoff Notice / Kitchen Status ───────────────────── */}
        {!isSlotOpen ? (
          <Alert variant="destructive" className="rounded-2xl border-destructive/20 bg-destructive/10 text-destructive py-3">
            <AlertCircle className="size-4" />
            <AlertDescription className="text-xs font-medium">
              Ordering for {selectedSlot === 'lunch' ? 'Lunch' : 'Dinner'} is closed
              {activeSlotInfo?.formattedCutoff ? ` (Cutoff was ${activeSlotInfo.formattedCutoff})` : ''}.
              You can toggle to {selectedSlot === 'lunch' ? 'Dinner' : 'Lunch'} above to place orders.
            </AlertDescription>
          </Alert>
        ) : activeSlotInfo?.formattedCutoff ? (
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="size-3.5 text-amber-600 shrink-0" />
              <span>
                {selectedSlot === 'lunch' ? 'Lunch' : 'Dinner'} cutoff: {activeSlotInfo.formattedCutoff}
              </span>
            </div>
            {activeSlotInfo.isClosingSoon && activeSlotInfo.minutesRemaining !== null ? (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 animate-pulse">
                {activeSlotInfo.minutesRemaining}m left
              </Badge>
            ) : null}
          </div>
        ) : null}

        {/* ── 1. Active Meal Card (Default Most Recent/Ordered) ── */}
        <section aria-labelledby="meal-heading">
          <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
            <CardContent className="p-3.5 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Utensils className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 id="meal-heading" className="font-bold text-base text-foreground leading-tight">
                        {currentThali?.name || 'Gujarati Thali'}
                      </h2>
                      {isFavoriteThali ? (
                        <Badge variant="secondary" className="text-[10px] bg-amber-500/15 text-amber-700 border-amber-500/20 px-1.5 py-0 font-medium">
                          <Sparkles className="size-2.5 mr-0.5 inline" />
                          Your Favorite ({context.orderCounts[currentThali.id]} orders)
                        </Badge>
                      ) : isRecentThali ? (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground px-1.5 py-0">
                          Last Ordered
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-xs text-primary font-bold mt-0.5">
                      {CURRENCY_SYMBOL}
                      {mealUnitPrice}{' '}
                      <span className="text-[11px] font-normal text-muted-foreground">/ meal</span>
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setChangeMealOpen(true)}
                  className="rounded-xl h-8 px-2.5 text-xs font-semibold shrink-0"
                >
                  Change Meal
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── 2. SABJI SELECTION (Front and Center) ─────────────── */}
        <section aria-labelledby="sabji-heading" className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500" />
              <h2 id="sabji-heading" className="font-bold text-sm sm:text-base text-foreground">
                {primarySabjiGroup?.name || 'Select Today’s Sabji'}
              </h2>
            </div>
            <Badge
              variant={isSabjiValid ? 'default' : 'outline'}
              className={cn(
                'text-[11px] font-semibold transition-colors',
                isSabjiValid ? 'bg-emerald-600 text-white' : 'text-amber-600 border-amber-300',
              )}
            >
              {isSabjiValid ? (
                <>
                  <Check className="size-3 mr-1 inline stroke-[3]" />
                  {selectedSabjiIds.length}/{sabjiMax} Selected
                </>
              ) : (
                `Choose ${sabjiMin === 1 ? '1 Sabji' : `${sabjiMin} Sabjis`} (${selectedSabjiIds.length}/${sabjiMax})`
              )}
            </Badge>
          </div>

          {primarySabjiGroup && primarySabjiGroup.options.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {primarySabjiGroup.options.map((opt) => {
                const isSelected = selectedSabjiIds.includes(opt.id)
                const isAvailable = opt.is_available && !opt.is_cutoff_closed

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => handleToggleSabji(opt)}
                    className={cn(
                      'w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 min-h-[58px]',
                      !isAvailable
                        ? 'opacity-40 bg-neutral-100/50 border-dashed border-border cursor-not-allowed'
                        : isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600 shadow-xs'
                          : 'border-border/80 bg-card hover:bg-neutral-50/80 hover:border-border',
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Veg indicator dot */}
                      <span className="flex size-4 items-center justify-center rounded-xs border border-emerald-600 p-0.5 shrink-0">
                        <span className="size-2 rounded-full bg-emerald-600" />
                      </span>
                      <div className="min-w-0">
                        <span className="font-semibold text-sm sm:text-base text-foreground block truncate">
                          {opt.label}
                        </span>
                        {opt.price_delta > 0 ? (
                          <span className="text-[11px] font-semibold text-emerald-600">
                            +{CURRENCY_SYMBOL}
                            {opt.price_delta}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">Today&apos;s Fresh Cooking</span>
                        )}
                      </div>
                    </div>

                    <div
                      className={cn(
                        'size-6 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-muted-foreground/30',
                      )}
                    >
                      {isSelected ? <Check className="size-3.5 stroke-[3]" /> : null}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <Card className="rounded-xl border-dashed p-4 text-center text-xs text-muted-foreground">
              Today&apos;s fresh sabji menu is being prepared by the kitchen.
            </Card>
          )}
        </section>

        {/* ── 3. BREAD SELECTION (Front and Center) ─────────────── */}
        <section aria-labelledby="bread-heading" className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-amber-500" />
              <h2 id="bread-heading" className="font-bold text-sm sm:text-base text-foreground">
                {primaryBreadGroup?.name || 'Select your Bread'}
              </h2>
            </div>
            <Badge
              variant={isBreadValid ? 'default' : 'outline'}
              className={cn(
                'text-[11px] font-semibold transition-colors',
                isBreadValid ? 'bg-amber-600 text-white' : 'text-amber-600 border-amber-300',
              )}
            >
              {isBreadValid ? (
                <>
                  <Check className="size-3 mr-1 inline stroke-[3]" />
                  Selected
                </>
              ) : (
                'Choose Bread'
              )}
            </Badge>
          </div>

          {primaryBreadGroup && primaryBreadGroup.options.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {primaryBreadGroup.options.map((opt) => {
                const isSelected = selectedBreadIds.includes(opt.id)
                const isAvailable = opt.is_available && !opt.is_cutoff_closed

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => handleToggleBread(opt)}
                    className={cn(
                      'text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-2 min-h-[58px]',
                      !isAvailable
                        ? 'opacity-40 bg-neutral-100/50 border-dashed border-border cursor-not-allowed'
                        : isSelected
                          ? 'border-amber-600 bg-amber-50/70 ring-1 ring-amber-600 shadow-xs'
                          : 'border-border/80 bg-card hover:bg-neutral-50/80 hover:border-border',
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-sm text-foreground block truncate">
                        {opt.label}
                      </span>
                      {opt.price_delta > 0 ? (
                        <span className="text-[11px] font-semibold text-amber-600">
                          +{CURRENCY_SYMBOL}
                          {opt.price_delta}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Standard</span>
                      )}
                    </div>

                    <div
                      className={cn(
                        'size-5 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                        isSelected
                          ? 'bg-amber-600 border-amber-600 text-white'
                          : 'border-muted-foreground/30',
                      )}
                    >
                      {isSelected ? <Check className="size-3 stroke-[3]" /> : null}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <Card className="rounded-xl border-dashed p-4 text-center text-xs text-muted-foreground">
              Hot Phulka Rotli & Bhakhari are freshly prepared with every meal.
            </Card>
          )}
        </section>

        {/* ── 4. Fixed Items Included (Reassurance for customer) ─ */}
        <section aria-labelledby="included-heading">
          <Card className="rounded-2xl border-border/70 bg-card/60 shadow-xs">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2">
                <Sparkles className="size-3.5 text-amber-500" />
                <span id="included-heading">Also Included in your {currentThali?.name || 'Meal'}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Gujarati Dal', 'Steamed Rice', 'Fresh Salad', 'Pickle (Aachar)'].map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 text-[11px] text-foreground font-medium"
                  >
                    <CheckCircle2 className="size-3 text-emerald-600" />
                    {name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── 5. Delivery Address Card ─────────────────────────── */}
        <section aria-labelledby="address-heading">
          <Card className="rounded-2xl border-border/80 shadow-xs">
            <CardContent className="p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span id="address-heading" className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                        Delivering To
                      </span>
                      {context.defaultAddress?.label ? (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 capitalize font-medium">
                          {context.defaultAddress.label}
                        </Badge>
                      ) : null}
                    </div>

                    {context.defaultAddress ? (
                      <p className="text-xs font-medium text-foreground mt-1 line-clamp-2 leading-relaxed">
                        {context.defaultAddress.address_line1}
                        {context.defaultAddress.address_line2 ? `, ${context.defaultAddress.address_line2}` : ''}
                        {context.defaultAddress.landmark ? `, ${context.defaultAddress.landmark}` : ''}
                        {context.defaultAddress.pincode ? ` - ${context.defaultAddress.pincode}` : ''}
                      </p>
                    ) : (
                      <p className="text-xs text-amber-600 font-medium mt-1">
                        No delivery address set. Please add one.
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                      <span className="text-muted-foreground">Delivery:</span>
                      <span className={cn('font-semibold', deliveryFee === 0 ? 'text-emerald-600' : 'text-foreground')}>
                        {deliveryFee === 0 ? 'FREE' : `${CURRENCY_SYMBOL}${deliveryFee}`}
                      </span>
                      {context.deliveryResolution.zoneLabel && context.deliveryResolution.zoneLabel !== 'Address required' ? (
                        <span className="text-muted-foreground text-[10px]">
                          ({context.deliveryResolution.zoneLabel})
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (context.addresses.length === 0) {
                      setCreateAddressOpen(true)
                    } else {
                      setChangeAddressOpen(true)
                    }
                  }}
                  className="rounded-xl h-8 px-2.5 text-xs font-semibold shrink-0"
                >
                  {context.defaultAddress ? 'Change' : 'Add'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── 6. Meal Quantity & Optional Special Note ─────────── */}
        <div className="flex items-center justify-between gap-3 px-1">
          <span className="text-sm font-semibold text-foreground">Meal Quantity</span>
          <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-1 shadow-2xs">
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="size-8 rounded-lg flex items-center justify-center text-foreground hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-6 text-center font-bold text-sm text-foreground">{quantity}</span>
            <button
              type="button"
              disabled={quantity >= 10}
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              className="size-8 rounded-lg flex items-center justify-center text-foreground hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Optional Notes Toggle */}
        <div className="pt-1">
          {!showNotes ? (
            <button
              type="button"
              onClick={() => setShowNotes(true)}
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1 px-1"
            >
              <MessageSquare className="size-3.5" />
              <span>+ Add special instruction or note</span>
            </button>
          ) : (
            <div className="space-y-2 p-3 bg-card rounded-xl border border-border/80">
              <div className="flex items-center justify-between">
                <label htmlFor="special-notes" className="text-xs font-semibold text-foreground">
                  Special Note for Kitchen
                </label>
                <button
                  type="button"
                  onClick={() => setShowNotes(false)}
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Hide
                </button>
              </div>
              <Input
                id="special-notes"
                placeholder="e.g., less spicy, extra crispy bhakhri..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                maxLength={120}
                className="h-10 text-xs rounded-lg"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_NOTE_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setSpecialInstructions((prev) =>
                        prev ? (prev.includes(chip) ? prev : `${prev}, ${chip}`) : chip,
                      )
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-muted-foreground hover:text-foreground hover:bg-neutral-200"
                  >
                    +{chip}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── 7. STICKY BOTTOM ACTION BAR (1-Tap Direct Confirmation) ─ */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-md border-t border-border shadow-xl p-3 sm:p-4 pb-safe">
        <div className="mx-auto max-w-lg flex items-center justify-between gap-3">
          {/* Price summary */}
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-extrabold text-xl sm:text-2xl text-foreground">
                {CURRENCY_SYMBOL}
                {grandTotal}
              </span>
              <span className="text-[11px] text-muted-foreground">
                ({quantity} {quantity > 1 ? 'meals' : 'meal'})
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
              <span>Cash on Delivery</span>
            </div>
          </div>

          {/* 1-Tap Place Order Button */}
          <Button
            type="button"
            disabled={!isOrderValid}
            onClick={handlePlaceOrder}
            className="flex-1 max-w-[220px] sm:max-w-[240px] h-12 sm:h-13 rounded-xl font-bold text-sm sm:text-base shadow-md bg-primary hover:bg-primary/90 text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {submitOrder.isPending ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                <span>Placing Order...</span>
              </>
            ) : !isSlotOpen ? (
              <span>Kitchen Closed</span>
            ) : !isSabjiValid ? (
              <span>Pick {sabjiMin === 1 ? 'Sabji' : 'Sabjis'}</span>
            ) : !isBreadValid ? (
              <span>Pick Bread</span>
            ) : !hasAddress ? (
              <span>Add Address</span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <span>Place Order</span>
                <ArrowRight className="size-4" />
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* ── Drawers & Modals ─────────────────────────────────── */}
      {currentThali ? (
        <ChangeMealDrawer
          open={changeMealOpen}
          onOpenChange={setChangeMealOpen}
          thalis={context.thaliList}
          selectedThaliId={currentThali.id}
          recentThaliId={context.recentThaliId}
          favoriteThaliId={context.favoriteThaliId}
          orderCounts={context.orderCounts}
          onSelectThali={(thali: ThaliFoodItem) => {
            setSelectedThaliId(thali.id)
            setSelectedSabjiIds([])
            setSelectedBreadIds([])
          }}
        />
      ) : null}

      <ChangeAddressDrawer
        open={changeAddressOpen}
        onOpenChange={setChangeAddressOpen}
        addresses={context.addresses}
        selectedAddressId={context.defaultAddress?.id ?? null}
        onSelectAddress={(addr: Tables<'addresses'>) => {
          setSelectedAddressId(addr.id)
        }}
        onAddressCreated={(newAddr: Tables<'addresses'>) => {
          setSelectedAddressId(newAddr.id)
          refetch()
        }}
      />

      <AddressFlowDialog
        open={createAddressOpen}
        onOpenChange={setCreateAddressOpen}
        onSaved={(newAddr: Tables<'addresses'> | null) => {
          if (newAddr) {
            setSelectedAddressId(newAddr.id)
            refetch()
          }
        }}
      />
    </div>
  )
}
