import { useState } from 'react'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import {
  Leaf,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  ChevronLeft,
  MessageSquare,
  X,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/error-state'
import { useFoodItemBySlug } from '@/features/menu/hooks/use-menu-queries'
import { ItemCustomizationPicker } from '@/features/menu/components/item-customization-picker'
import { DynamicThaliOptionPicker } from '@/features/menu/components/dynamic-thali-option-picker'
import { useAddToCart } from '@/features/cart/hooks/use-cart'
import { FavoriteButton } from '@/features/favorites/components/favorite-button'
import { useAuth } from '@/hooks/use-auth'
import { CURRENCY_SYMBOL, ROUTES } from '@/constants'

const REVIEWS_MOCK = [
  {
    id: '1',
    name: 'Rajesh K.',
    avatar: 'R',
    color: 'bg-emerald-600',
    rating: 5,
    date: '2 days ago',
    comment: 'Authentic homestyle Thali! The Bhakhri was perfectly crisp and Sabji felt like home.',
  },
  {
    id: '2',
    name: 'Ananya M.',
    avatar: 'A',
    color: 'bg-amber-500',
    rating: 5,
    date: '1 week ago',
    comment: 'Fresh, warm rotis and great portion size. Definitely ordering again for lunch.',
  },
  {
    id: '3',
    name: 'Priya S.',
    avatar: 'P',
    color: 'bg-violet-500',
    rating: 5,
    date: '2 weeks ago',
    comment: 'Super fast delivery and delicious Kathiyawadi flavor! Best Gujarati meal in town.',
  },
]

export function ProductDetailPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { date?: string; mealType?: string } | undefined
  const { isAuthenticated } = useAuth()
  const { data: item, isPending, isError, refetch } = useFoodItemBySlug(slug)
  const addToCart = useAddToCart()

  const [quantity, setQuantity] = useState(1)
  const [instructions, setInstructions] = useState('')
  const [showInstructions, setShowInstructions] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [optionSelections, setOptionSelections] = useState<Record<string, string[]>>({})
  const [isOptionSelectionValid, setIsOptionSelectionValid] = useState(true)

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Image skeleton */}
        <Skeleton className="w-full h-[220px] sm:h-[280px] rounded-none" />
        <div className="max-w-2xl mx-auto px-4 pt-5 space-y-4">
          <Skeleton className="h-7 w-2/3 rounded-lg" />
          <Skeleton className="h-4 w-full rounded-lg" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-28 rounded" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-20 rounded-full" />
                  <Skeleton className="h-9 w-24 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError || !item) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="mx-auto max-w-2xl px-4">
          <ErrorState
            title="Dish not found"
            description="This item may have been removed from the menu."
            onRetry={() => refetch()}
          />
        </div>
      </div>
    )
  }

  const basePrice = item.offer_price ?? item.price
  const strikePrice = item.offer_price ? item.price : null
  const selectedCustomizations = item.item_customizations.filter((c) => selectedIds.has(c.id))
  const addOnsTotal = selectedCustomizations.reduce((sum, c) => sum + c.price_delta, 0)
  const totalPrice = (basePrice + addOnsTotal) * quantity

  const toggleCustomization = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate(ROUTES.login, { state: { from: location } })
      return
    }
    const customizationList = selectedCustomizations.map((c) => ({
      id: c.id,
      name: c.name,
      price_delta: c.price_delta,
    }))
    Object.values(optionSelections).flat().forEach((optId) => {
      customizationList.push({ id: optId, name: 'Option Selection', price_delta: 0 })
    })
    addToCart.mutate({
      food_item_id: item.id,
      quantity,
      special_instructions: instructions.trim() || null,
      customizations: customizationList,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── HERO IMAGE SECTION ── */}
      <div className="relative w-full bg-[#1a1a1a] overflow-hidden" style={{ height: 'clamp(200px, 40vw, 300px)' }}>
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-60">🍱</div>
        )}

        {/* Gradient overlay: top (nav) and bottom (into white content) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        {/* Back button (mobile) */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute top-3 left-3 sm:hidden z-10 bg-black/40 backdrop-blur-sm text-white rounded-full p-2"
          aria-label="Go back"
        >
          <ChevronLeft className="size-5" />
        </button>

        {/* Favorite button */}
        <div className="absolute top-3 right-3 z-10 bg-black/40 backdrop-blur-sm rounded-full p-1.5">
          <FavoriteButton foodItemId={item.id} />
        </div>

        {/* Bestseller chip */}
        <div className="absolute top-3 left-12 sm:left-3 z-10">
          <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
            ⭐ Bestseller
          </span>
        </div>
      </div>

      {/* ── CONTENT CARD ── */}
      {/* On mobile: white card below image, stacks full width */}
      {/* On desktop: centered, max-w-2xl */}
      <div className="max-w-2xl mx-auto">

        {/* White info card */}
        <div className="bg-white mx-0 sm:mx-4 lg:mx-auto sm:rounded-2xl sm:-mt-6 relative z-10 sm:shadow-sm">

          {/* Item header */}
          <div className="px-4 sm:px-5 pt-5 pb-4 border-b border-gray-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">{item.name}</h1>
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    4.8
                  </span>
                  <span className="text-gray-200 text-xs">•</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <Leaf className="size-3 fill-emerald-600" />
                    Pure veg
                  </span>
                  {item.description && (
                    <>
                      <span className="text-gray-200 text-xs">•</span>
                      <span className="text-[11px] text-gray-500 font-medium">Homemade</span>
                    </>
                  )}
                </div>
              </div>
              {/* Price */}
              <div className="text-right shrink-0">
                <div className="text-xl font-bold text-[#2E7D32] tabular-nums">
                  {CURRENCY_SYMBOL}{basePrice}
                </div>
                {strikePrice && (
                  <div className="text-sm text-gray-400 line-through tabular-nums">
                    {CURRENCY_SYMBOL}{strikePrice}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <p className="mt-2.5 text-sm text-gray-500 leading-relaxed">{item.description}</p>
            )}
          </div>

          {/* ── THALI CUSTOMIZATIONS ── */}
          {item.kind === 'thali' && (
            <div className="px-4 sm:px-5">
              <DynamicThaliOptionPicker
                foodItemId={item.id}
                selectedDate={state?.date}
                mealType={state?.mealType}
                onSelectionChange={(selMap, isValid) => {
                  setOptionSelections(selMap)
                  setIsOptionSelectionValid(isValid)
                }}
              />
            </div>
          )}

          {/* ── ADD-ONS ── */}
          <div className="px-4 sm:px-5">
            <ItemCustomizationPicker
              customizations={item.item_customizations}
              selectedIds={selectedIds}
              onToggle={toggleCustomization}
            />
          </div>

          {/* ── SPECIAL INSTRUCTIONS ── */}
          <div className="px-4 sm:px-5 py-3 border-t border-gray-100">
            {!showInstructions ? (
              <button
                type="button"
                onClick={() => setShowInstructions(true)}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#2E7D32] transition-colors"
              >
                <MessageSquare className="size-4" />
                Add special instructions
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Special instructions</span>
                  <button
                    type="button"
                    onClick={() => { setShowInstructions(false); setInstructions('') }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <textarea
                  autoFocus
                  rows={2}
                  placeholder="e.g. Less spicy, no onion, extra pickle..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 focus:border-[#2E7D32] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 resize-none transition"
                />
              </div>
            )}
          </div>

          {/* ── STICKY BOTTOM CTA ── */}
          {!item.is_available ? (
            <div className="px-4 sm:px-5 pb-5">
              <div className="bg-red-50 border border-red-100 text-red-500 text-sm font-semibold text-center py-3 rounded-xl">
                Currently unavailable
              </div>
            </div>
          ) : (
            <div className="sticky bottom-0 z-20 px-4 sm:px-5 py-4 bg-white border-t border-gray-100 sm:rounded-b-2xl">
              <div className="flex items-center gap-3">
                {/* Qty stepper */}
                <div className="flex items-center gap-0 rounded-xl border-2 border-gray-200 overflow-hidden shrink-0 h-11">
                  <button
                    type="button"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-full w-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition disabled:opacity-30"
                    aria-label="Decrease"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold tabular-nums text-gray-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= 10}
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="h-full w-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition disabled:opacity-30"
                    aria-label="Increase"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>

                {/* Add to cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={addToCart.isPending || !isOptionSelectionValid}
                  className="flex-1 h-11 rounded-xl bg-[#2E7D32] hover:bg-[#256C2B] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-150 shadow-sm shadow-green-100 cursor-pointer"
                >
                  <ShoppingBag className="size-4 shrink-0" />
                  <span>
                    {addToCart.isPending
                      ? 'Adding…'
                      : `Add thali · ${CURRENCY_SYMBOL}${totalPrice}`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── REVIEWS ── */}
        <div className="px-4 sm:px-0 py-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base font-bold text-gray-900">Reviews</h2>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs text-gray-400">4.8 · 182 verified</span>
          </div>

          <div className="space-y-3 sm:grid sm:grid-cols-3 sm:gap-3 sm:space-y-0">
            {REVIEWS_MOCK.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-xl p-4 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`size-7 rounded-full ${rev.color} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                      {rev.avatar}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-800">{rev.name}</div>
                      <div className="text-[10px] text-gray-400">{rev.date}</div>
                    </div>
                  </div>
                  <div className="flex">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">"{rev.comment}"</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Desktop breadcrumb (shown above fold) — hidden on mobile since we have back button */}
      <div className="hidden sm:block absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-white/80 font-medium pointer-events-auto drop-shadow">
            <Link to={ROUTES.home} className="hover:text-white transition-colors">Home</Link>
            <span>›</span>
            <Link to={ROUTES.menu} className="hover:text-white transition-colors">Menu</Link>
            <span>›</span>
            <span className="text-white font-semibold">{item.name}</span>
          </nav>
        </div>
      </div>

    </div>
  )
}
