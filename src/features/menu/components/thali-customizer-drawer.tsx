import { useState, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Minus, Plus, X, MessageSquare, AlertCircle, CalendarOff, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useFoodItemBySlug } from '@/features/menu/hooks/use-menu-queries'
import { useMealTiming } from '@/features/menu/hooks/use-meal-timing'
import { DynamicThaliOptionPicker } from '@/features/menu/components/dynamic-thali-option-picker'
import { ItemCustomizationPicker } from '@/features/menu/components/item-customization-picker'
import { useAddToCart } from '@/features/cart/hooks/use-cart'
import { useAuth } from '@/hooks/use-auth'
import { CURRENCY_SYMBOL, ROUTES } from '@/constants'
import type { MealType } from '@/types/database.types'

type ThaliCustomizerDrawerProps = {
  slug: string | null
  isOpen: boolean
  onClose: () => void
  date?: string
  mealType?: MealType
}

export function ThaliCustomizerDrawer({
  slug,
  isOpen,
  onClose,
  date,
  mealType = 'lunch',
}: ThaliCustomizerDrawerProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const addToCart = useAddToCart()

  const { data: item, isPending } = useFoodItemBySlug(slug || '')
  const timing = useMealTiming(date)
  const isSlotOpen = timing.slots[mealType]?.isOpen ?? true

  const [quantity, setQuantity] = useState(1)
  const [instructions, setInstructions] = useState('')
  const [showInstructions, setShowInstructions] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [groupAddOns, setGroupAddOns] = useState<{ id: string; name: string; price_delta: number }[]>([])
  const [customAddonMap, setCustomAddonMap] = useState<Map<string, { id: string; name: string; price_delta: number }>>(new Map())
  const [selectedOptionItems, setSelectedOptionItems] = useState<{ id: string; name: string; price_delta: number; group_name?: string }[]>([])
  const [isOptionSelectionValid, setIsOptionSelectionValid] = useState(true)

  const variants = useMemo(
    () => (item?.food_item_variants || []).filter((v) => v.is_active !== false),
    [item],
  )
  const hasVariants = variants.length > 1
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

  const activeVariant = useMemo(() => {
    if (!variants.length) return null
    return variants.find((v) => v.id === selectedVariantId) || variants[0]
  }, [variants, selectedVariantId])

  // Reset local state when opened with a different item
  const resetState = useCallback(() => {
    setQuantity(1)
    setInstructions('')
    setShowInstructions(false)
    setSelectedIds(new Set())
    setSelectedVariantId(null)
    setSelectedOptionItems([])
    setIsOptionSelectionValid(true)
  }, [])

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
      setTimeout(resetState, 200)
    }
  }

  const handleAddOnOptionsLoaded = useCallback((addOns: { id: string; name: string; price_delta: number }[]) => {
    setGroupAddOns((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(addOns)) return prev
      return addOns
    })
  }, [])

  const handleSelectionChange = useCallback((
    _selMap: Record<string, string[]>,
    isValid: boolean,
    selectedItems?: { id: string; name: string; price_delta: number; group_name?: string }[],
  ) => {
    setIsOptionSelectionValid(isValid)
    if (selectedItems) {
      setSelectedOptionItems(selectedItems)
    }
  }, [])

  const basePrice = activeVariant ? activeVariant.price : (item?.price ?? 0)
  const strikePrice =
    activeVariant?.compare_price && activeVariant.compare_price > basePrice
      ? activeVariant.compare_price
      : (item?.compare_price && item.compare_price > basePrice ? item.compare_price : null)

  const resolvedSelectedCustomizations = useMemo(() => {
    return Array.from(selectedIds).map((id) => {
      if (customAddonMap.has(id)) {
        return customAddonMap.get(id)!
      }
      const match = item?.item_customizations?.find((c) => c.id === id)
      return {
        id,
        name: match?.name || 'Add-on',
        price_delta: Number(match?.price_delta || 0),
      }
    })
  }, [selectedIds, customAddonMap, item?.item_customizations])

  const addOnsTotal = resolvedSelectedCustomizations.reduce((sum, c) => sum + c.price_delta, 0)
  const totalPrice = (basePrice + addOnsTotal) * quantity

  const toggleCustomization = (id: string, dynamicDetails?: { name: string; price_delta: number }) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
        if (dynamicDetails) {
          setCustomAddonMap((m) => new Map(m).set(id, { id, name: dynamicDetails.name, price_delta: dynamicDetails.price_delta }))
        }
      }
      return next
    })
  }

  const handleAddToCart = () => {
    if (!item) return
    if (item.is_available === false) {
      toast.error('This item is currently disabled and unavailable.')
      return
    }
    if (!isSlotOpen) {
      if (timing.slots[mealType]?.isHolidayClosed) {
        toast.error(
          timing.activeHoliday?.message ||
            `We are closed for ${timing.activeHoliday?.title || 'Holiday'}. We can't serve meals during this period.`,
        )
      } else if (!timing.slots[mealType]?.isPublished) {
        toast.error(
          `Today's ${mealType === 'lunch' ? 'Lunch' : 'Dinner'} menu is coming soon. Orders will open once published.`,
        )
      } else {
        toast.error(
          mealType === 'lunch'
            ? "Ordering for Lunch is closed."
            : "Ordering for Dinner is closed.",
        )
      }
      return
    }
    if (!isAuthenticated) {
      navigate(ROUTES.login, { state: { from: location } })
      return
    }

    const customizationList = resolvedSelectedCustomizations.map((c) => ({
      id: c.id,
      name: c.name,
      price_delta: c.price_delta,
    }))

    // Add chosen dynamic options (Sabjis, Breads, etc.) with their real names and group details
    selectedOptionItems.forEach((opt) => {
      customizationList.push({
        id: opt.id,
        name: opt.name,
        price_delta: opt.price_delta,
        ...(opt.group_name ? { group_name: opt.group_name } : {}),
      })
    })

    const variantId = activeVariant?.id || (variants.length === 1 ? variants[0].id : null)

    addToCart.mutate(
      {
        food_item_id: item.id,
        variant_id: variantId,
        quantity,
        special_instructions: instructions.trim() || null,
        customizations: customizationList,
      },
      {
        onSuccess: () => {
          onClose()
          resetState()
        },
      },
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="p-0 w-[calc(100%-2rem)] max-w-[440px] max-h-[82vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border gap-0 outline-hidden"
      >
        {/* ── HEADER ── */}
        <DialogHeader className="px-4 py-3 border-b flex-row items-center justify-between space-y-0 shrink-0 bg-white">
          <div className="flex items-center gap-3 flex-1 pr-2 min-w-0">
            {item?.image_url && (
              <img
                src={item.image_url}
                alt={item.name}
                className="size-12 rounded-xl object-cover shrink-0 border border-neutral-200"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="flex size-3.5 items-center justify-center rounded-xs border border-green-600 bg-white p-0.5">
                  <span className="size-1.5 rounded-full bg-green-600" />
                </span>
                <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Ordering for <span className="capitalize font-bold text-neutral-800">{mealType}</span>
                </span>
              </div>
              <DialogTitle className="text-base font-bold text-neutral-900 leading-tight truncate">
                {item?.name || 'Customise Dish'}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Customise options and select pack size for this item
              </DialogDescription>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-sm font-bold text-neutral-900">
                  {CURRENCY_SYMBOL}
                  {basePrice}
                </span>
                {strikePrice && (
                  <span className="text-[11px] text-neutral-400 line-through">
                    {CURRENCY_SYMBOL}
                    {strikePrice}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </DialogHeader>

        {/* ── SCROLLABLE BODY ── */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5">
          {isPending || !item ? (
            <div className="space-y-3 py-1">
              <Skeleton className="h-5 w-1/2 rounded" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ) : (
            <>
              {/* Slot Closed / Unpublished / Holiday Notice */}
              {!isSlotOpen && (
                <div
                  className={cn(
                    'p-3 rounded-xl flex items-center gap-2.5 text-xs font-medium',
                    timing.slots[mealType]?.isHolidayClosed
                      ? 'bg-red-50 border border-red-200 text-red-950'
                      : !timing.slots[mealType]?.isPublished
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-950'
                      : 'bg-amber-50 border border-amber-200 text-amber-950',
                  )}
                >
                  {timing.slots[mealType]?.isHolidayClosed ? (
                    <CalendarOff className="size-4 text-red-600 shrink-0" />
                  ) : !timing.slots[mealType]?.isPublished ? (
                    <Sparkles className="size-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="size-4 text-amber-600 shrink-0" />
                  )}
                  <span>
                    {timing.slots[mealType]?.isHolidayClosed
                      ? (timing.activeHoliday?.message || `We are closed for ${timing.activeHoliday?.title || 'Holiday'}.`)
                      : !timing.slots[mealType]?.isPublished
                      ? `Today's ${mealType === 'lunch' ? 'Lunch' : 'Dinner'} menu is coming soon. Orders will open shortly.`
                      : mealType === 'lunch'
                      ? "Ordering for Lunch is closed."
                      : "Ordering for Dinner is closed."}
                  </span>
                </div>
              )}

              {/* Thali Composition Tags if present */}
              {item.ingredients && item.ingredients.length > 0 && (
                <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/70">
                  <p className="text-[11px] font-semibold text-amber-900 mb-1.5">
                    Included in this Thali:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {item.ingredients.map((ing, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-white text-amber-900/90 font-medium px-2 py-0.5 rounded-md border border-amber-200/80 shadow-2xs"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pack Size / Variant Selector */}
              {hasVariants && (
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      <span>Pack Size / Quantity</span>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded-full">
                        Required
                      </span>
                    </span>
                    {activeVariant && (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                        {activeVariant.label}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {variants.map((v) => {
                      const isSelected = activeVariant?.id === v.id
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariantId(v.id)}
                          className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer min-h-[44px] ${
                            isSelected
                              ? 'border-primary bg-primary/10 ring-1 ring-primary'
                              : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-neutral-900">{v.label}</p>
                            <p className="text-xs font-semibold text-primary mt-0.5">
                              {CURRENCY_SYMBOL}{v.price}
                            </p>
                          </div>
                          <div
                            className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-primary bg-primary' : 'border-neutral-300'
                            }`}
                          >
                            {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Sabji / Bread / Side Option Pickers (for Thalis) */}
              {item.kind === 'thali' && (
                <DynamicThaliOptionPicker
                  foodItemId={item.id}
                  selectedDate={date}
                  mealType={mealType}
                  onSelectionChange={handleSelectionChange}
                  onAddOnOptionsLoaded={handleAddOnOptionsLoaded}
                />
              )}

              {/* Add-ons & Extras */}
              {(item.item_customizations?.length > 0 || groupAddOns.length > 0) && (
                <div className="pt-1.5 border-t">
                  <ItemCustomizationPicker
                    customizations={item.item_customizations || []}
                    groupAddOns={groupAddOns}
                    selectedIds={selectedIds}
                    onToggle={toggleCustomization}
                  />
                </div>
              )}

              {/* Special Cooking Note / Instructions */}
              <div className="pt-1.5 border-t">
                {!showInstructions ? (
                  <button
                    type="button"
                    onClick={() => setShowInstructions(true)}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-600 hover:text-neutral-900"
                  >
                    <MessageSquare className="size-3 text-neutral-400" />
                    + Add cooking instructions (optional)
                  </button>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-medium text-neutral-700">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="size-3" /> Special note for chef
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowInstructions(false)
                          setInstructions('')
                        }}
                        className="text-[10px] text-neutral-400 hover:text-neutral-600"
                      >
                        Cancel
                      </button>
                    </div>
                    <textarea
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value.slice(0, 140))}
                      placeholder="e.g. Less spicy, send extra green chillies, no onion..."
                      rows={2}
                      className="w-full text-xs p-2 rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 resize-none"
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── STICKY FOOTER CTA ── */}
        <div className="p-3.5 border-t bg-white flex items-center gap-3 shrink-0 shadow-lg">
          {/* Quantity Stepper */}
          <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-50 p-1">
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="size-8 flex items-center justify-center rounded-lg bg-white text-neutral-700 shadow-2xs hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
              aria-label="Decrease"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-7 text-center text-xs font-bold text-neutral-900 tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              disabled={quantity >= 10}
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              className="size-8 flex items-center justify-center rounded-lg bg-white text-neutral-700 shadow-2xs hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
              aria-label="Increase"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          {/* Add to Cart Button (Accessible 44px min-height) */}
          <Button
            size="default"
            className="flex-1 min-h-[44px] text-xs sm:text-sm font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md flex items-center justify-between px-4 disabled:opacity-60 cursor-pointer"
            disabled={!item || item.is_available === false || !isOptionSelectionValid || addToCart.isPending || !isSlotOpen}
            onClick={handleAddToCart}
          >
            <span>
              {item?.is_available === false
                ? 'Currently Unavailable'
                : !isSlotOpen
                ? timing.slots[mealType]?.isHolidayClosed
                  ? 'Closed for Holiday'
                  : !timing.slots[mealType]?.isPublished
                  ? 'Menu Coming Soon'
                  : 'Ordering Closed'
                : !isOptionSelectionValid
                ? 'Select required choices'
                : 'Add to Order'}
            </span>
            <span className="font-extrabold text-sm">
              {CURRENCY_SYMBOL}
              {totalPrice}
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
