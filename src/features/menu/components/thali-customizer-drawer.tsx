import { useState, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Minus, Plus, X, MessageSquare } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useFoodItemBySlug } from '@/features/menu/hooks/use-menu-queries'
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

  const [quantity, setQuantity] = useState(1)
  const [instructions, setInstructions] = useState('')
  const [showInstructions, setShowInstructions] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [groupAddOns, setGroupAddOns] = useState<{ id: string; name: string; price_delta: number }[]>([])
  const [customAddonMap, setCustomAddonMap] = useState<Map<string, { id: string; name: string; price_delta: number }>>(new Map())
  const [optionSelections, setOptionSelections] = useState<Record<string, string[]>>({})
  const [isOptionSelectionValid, setIsOptionSelectionValid] = useState(true)

  // Reset local state when opened with a different item
  const resetState = useCallback(() => {
    setQuantity(1)
    setInstructions('')
    setShowInstructions(false)
    setSelectedIds(new Set())
    setOptionSelections({})
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

  const handleSelectionChange = useCallback((selMap: Record<string, string[]>, isValid: boolean) => {
    setOptionSelections(selMap)
    setIsOptionSelectionValid(isValid)
  }, [])

  const basePrice = item?.price ?? 0
  const strikePrice = item?.compare_price ?? null

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
    if (!isAuthenticated) {
      navigate(ROUTES.login, { state: { from: location } })
      return
    }

    const customizationList = resolvedSelectedCustomizations.map((c) => ({
      id: c.id,
      name: c.name,
      price_delta: c.price_delta,
    }))

    Object.values(optionSelections).flat().forEach((optId) => {
      customizationList.push({ id: optId, name: 'Option Selection', price_delta: 0 })
    })

    addToCart.mutate(
      {
        food_item_id: item.id,
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
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="inset-x-0 bottom-0 h-[92vh] max-h-[92vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-2xl sm:max-w-xl sm:mx-auto sm:bottom-6 sm:inset-x-auto p-0 flex flex-col bg-white overflow-hidden shadow-2xl border-t sm:border"
      >
        {/* Pull Handle (Mobile) */}
        <div className="w-full flex justify-center pt-2.5 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-neutral-300 rounded-full" />
        </div>

        {/* ── HEADER ── */}
        <SheetHeader className="px-5 py-3.5 border-b flex-row items-start justify-between space-y-0 shrink-0">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex size-4 items-center justify-center rounded-sm border border-green-600 bg-white p-0.5">
                <span className="size-2 rounded-full bg-green-600" />
              </span>
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                Ordering for <span className="capitalize font-bold text-neutral-800">{mealType}</span>
              </span>
            </div>
            <SheetTitle className="text-lg sm:text-xl font-bold text-neutral-900 leading-tight">
              {item?.name || 'Customise Dish'}
            </SheetTitle>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-base font-bold text-neutral-900">
                {CURRENCY_SYMBOL}
                {basePrice}
              </span>
              {strikePrice && (
                <span className="text-xs text-neutral-400 line-through">
                  {CURRENCY_SYMBOL}
                  {strikePrice}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </SheetHeader>

        {/* ── SCROLLABLE BODY ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {isPending || !item ? (
            <div className="space-y-4 py-2">
              <Skeleton className="h-6 w-1/2 rounded" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : (
            <>
              {/* Thali Composition Tags if present */}
              {item.ingredients && item.ingredients.length > 0 && (
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/70">
                  <p className="text-xs font-semibold text-amber-900 mb-2">
                    Included in this Thali:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.ingredients.map((ing, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-white text-amber-900/90 font-medium px-2 py-0.5 rounded-md border border-amber-200/80 shadow-2xs"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Sabji / Bread / Side Option Pickers */}
              <DynamicThaliOptionPicker
                foodItemId={item.id}
                selectedDate={date}
                mealType={mealType}
                onSelectionChange={handleSelectionChange}
                onAddOnOptionsLoaded={handleAddOnOptionsLoaded}
              />

              {/* Add-ons & Extras */}
              {(item.item_customizations?.length > 0 || groupAddOns.length > 0) && (
                <div className="pt-2 border-t">
                  <ItemCustomizationPicker
                    customizations={item.item_customizations || []}
                    groupAddOns={groupAddOns}
                    selectedIds={selectedIds}
                    onToggle={toggleCustomization}
                  />
                </div>
              )}

              {/* Special Cooking Note / Instructions */}
              <div className="pt-2 border-t">
                {!showInstructions ? (
                  <button
                    type="button"
                    onClick={() => setShowInstructions(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                  >
                    <MessageSquare className="size-3.5 text-neutral-400" />
                    + Add cooking instructions (optional)
                  </button>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium text-neutral-700">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="size-3.5" /> Special note for chef
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowInstructions(false)
                          setInstructions('')
                        }}
                        className="text-[11px] text-neutral-400 hover:text-neutral-600"
                      >
                        Cancel
                      </button>
                    </div>
                    <textarea
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value.slice(0, 140))}
                      placeholder="e.g. Less spicy, send extra green chillies, no onion..."
                      rows={2}
                      className="w-full text-xs p-2.5 rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 resize-none"
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── STICKY FOOTER CTA ── */}
        <div className="p-4 border-t bg-white flex items-center gap-3 shrink-0 shadow-lg">
          {/* Quantity Stepper */}
          <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-50 p-1">
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="size-8 flex items-center justify-center rounded-lg bg-white text-neutral-700 shadow-2xs hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-white"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-neutral-900">
              {quantity}
            </span>
            <button
              type="button"
              disabled={quantity >= 10}
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              className="size-8 flex items-center justify-center rounded-lg bg-white text-neutral-700 shadow-2xs hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-white"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <Button
            size="lg"
            className="flex-1 h-11 text-sm font-semibold rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white shadow-md flex items-center justify-between px-4"
            disabled={!item || !isOptionSelectionValid || addToCart.isPending}
            onClick={handleAddToCart}
          >
            <span>
              {!isOptionSelectionValid ? 'Select required choices' : 'Add to Order'}
            </span>
            <span className="font-bold">
              {CURRENCY_SYMBOL}
              {totalPrice}
            </span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
