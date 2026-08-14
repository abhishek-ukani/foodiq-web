import { useState } from 'react'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import {
  Leaf,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Home,
  Flame,
  Truck,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/error-state'
import { useFoodItemBySlug } from '@/features/menu/hooks/use-menu-queries'
import { ItemCustomizationPicker } from '@/features/menu/components/item-customization-picker'
import { DynamicThaliOptionPicker } from '@/features/menu/components/dynamic-thali-option-picker'
import { ThaliCompositionList } from '@/features/menu/components/thali-composition-list'
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
    color: 'bg-amber-600',
    rating: 5,
    date: '1 week ago',
    comment: 'Fresh, warm rotis and great portion size. Definitely ordering again for lunch.',
  },
  {
    id: '3',
    name: 'Priya S.',
    avatar: 'P',
    color: 'bg-[#2E7D32]',
    rating: 5,
    date: '2 weeks ago',
    comment: 'Super fast delivery and delicious Kathiyawadi flavor! Best Gujarati meal in town.',
  },
]

export function ProductDetailPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { data: item, isPending, isError, refetch } = useFoodItemBySlug(slug)
  const addToCart = useAddToCart()

  const [quantity, setQuantity] = useState(1)
  const [instructions, setInstructions] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [optionSelections, setOptionSelections] = useState<Record<string, string[]>>({})
  const [isOptionSelectionValid, setIsOptionSelectionValid] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-4">
            <Skeleton className="aspect-square rounded-2xl bg-white/80" />
            <div className="flex gap-3">
              <Skeleton className="size-20 rounded-xl bg-white/80" />
              <Skeleton className="size-20 rounded-xl bg-white/80" />
              <Skeleton className="size-20 rounded-xl bg-white/80" />
            </div>
          </div>
          <div className="lg:col-span-5 space-y-5">
            <Skeleton className="h-6 w-1/3 rounded-md bg-white/80" />
            <Skeleton className="h-10 w-3/4 rounded-md bg-white/80" />
            <Skeleton className="h-12 w-full rounded-2xl bg-white/80" />
            <Skeleton className="h-40 w-full rounded-2xl bg-white/80" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !item) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] py-16">
        <div className="mx-auto max-w-3xl px-4">
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

    const selectedOptionIds = Object.values(optionSelections).flat()
    selectedOptionIds.forEach((optId) => {
      customizationList.push({
        id: optId,
        name: `Option Selection`,
        price_delta: 0,
      })
    })

    addToCart.mutate({
      food_item_id: item.id,
      quantity,
      special_instructions: instructions.trim() || null,
      customizations: customizationList,
    })
  }

  // Thumbnails gallery fallback
  const galleryImages = [
    item.image_url,
    item.image_url,
    item.image_url,
  ].filter(Boolean) as string[]

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1D1D1D] font-sans py-6 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* TWO COLUMN PRODUCT SECTION */}
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: HERO IMAGE & GALLERY (55%) */}
          <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-8">
            {/* Breadcrumb (Mobile) */}
            <div className="flex items-center gap-1.5 text-xs text-[#666666] font-medium lg:hidden">
              <Link to={ROUTES.home} className="hover:text-[#1D1D1D]">Home</Link>
              <ChevronRight className="size-3" />
              <Link to={ROUTES.menu} className="hover:text-[#1D1D1D]">Menu</Link>
              <ChevronRight className="size-3" />
              <span className="text-[#1D1D1D] font-semibold">{item.name}</span>
            </div>

            {/* Main Hero Image */}
            <div className="relative aspect-square sm:aspect-4/3 lg:aspect-square overflow-hidden rounded-2xl bg-white border border-[#E7E7E7] shadow-sm group">
              {item.image_url ? (
                <img
                  src={galleryImages[activeImageIndex] || item.image_url}
                  alt={item.name}
                  className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-[#FFF8E8] text-6xl">
                  🍱
                </div>
              )}

              {/* Floating Bestseller / Fresh Badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="bg-white/90 backdrop-blur-md text-[#1D1D1D] text-xs font-bold px-3 py-1.5 rounded-full shadow-xs border border-[#E7E7E7] flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-amber-500 fill-amber-500" />
                  Bestseller
                </span>
              </div>

              {/* Floating Favorite Button */}
              <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-xs border border-[#E7E7E7] hover:scale-105 transition-all">
                <FavoriteButton foodItemId={item.id} />
              </div>
            </div>

            {/* Image Gallery Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 pt-1 overflow-x-auto">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative size-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white ${
                      activeImageIndex === idx
                        ? 'border-[#2E7D32] ring-2 ring-[#2E7D32]/20'
                        : 'border-[#E7E7E7] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: DETAILS & CUSTOMIZATION (45%) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Breadcrumb (Desktop) */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#666666] font-medium">
              <Link to={ROUTES.home} className="hover:text-[#1D1D1D]">Home</Link>
              <ChevronRight className="size-3" />
              <Link to={ROUTES.menu} className="hover:text-[#1D1D1D]">Menu</Link>
              <ChevronRight className="size-3" />
              <span className="text-[#1D1D1D] font-semibold">{item.name}</span>
            </div>

            {/* Title & Badges */}
            <div className="space-y-3">
              <h1 className="font-sans text-3xl sm:text-[36px] font-bold text-[#1D1D1D] tracking-tight leading-tight">
                {item.name}
              </h1>

              {/* Rounded Feature Badges Row */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="bg-white border border-[#E7E7E7] text-[#1D1D1D] text-xs font-semibold px-3 py-1.5 rounded-full shadow-2xs flex items-center gap-1">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  4.8 (182 Reviews)
                </span>
                <span className="bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/20 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                  <Leaf className="size-3.5 fill-[#2E7D32]" />
                  Pure Veg
                </span>
                <span className="bg-[#FFF8E8] text-[#855B14] border border-[#FFE8B5] text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1">
                  <Home className="size-3.5" />
                  Homemade
                </span>
                <span className="bg-white border border-[#E7E7E7] text-[#1D1D1D] text-xs font-medium px-3 py-1.5 rounded-full shadow-2xs flex items-center gap-1">
                  <Flame className="size-3.5 text-orange-500" />
                  Fresh Today
                </span>
                <span className="bg-white border border-[#E7E7E7] text-[#1D1D1D] text-xs font-medium px-3 py-1.5 rounded-full shadow-2xs flex items-center gap-1">
                  <Truck className="size-3.5 text-blue-600" />
                  Fast Delivery
                </span>
              </div>
            </div>

            {/* Price Tag */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-[34px] font-bold text-[#2E7D32] tracking-tight tabular-nums">
                {CURRENCY_SYMBOL}
                {basePrice}
              </span>
              {strikePrice && (
                <span className="text-xl text-[#666666] line-through tabular-nums">
                  {CURRENCY_SYMBOL}
                  {strikePrice}
                </span>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-sm text-[#666666] leading-relaxed max-w-md">
                {item.description}
              </p>
            )}

            <ThaliCompositionList items={item.thali_items} />

            {/* CUSTOMIZATION CATEGORY CARDS */}
            {item.kind === 'thali' && (
              <DynamicThaliOptionPicker
                foodItemId={item.id}
                onSelectionChange={(selMap, isValid) => {
                  setOptionSelections(selMap)
                  setIsOptionSelectionValid(isValid)
                }}
              />
            )}

            <ItemCustomizationPicker
              customizations={item.item_customizations}
              selectedIds={selectedIds}
              onToggle={toggleCustomization}
            />

            {/* QUANTITY SELECTOR (Modern Pill Shaped) */}
            <div className="bg-white rounded-2xl p-4 border border-[#E7E7E7] shadow-xs flex items-center justify-between">
              <span className="text-sm font-semibold text-[#1D1D1D]">Select Quantity</span>
              <div className="flex items-center gap-4 rounded-full border border-[#E7E7E7] bg-[#F8F7F4] px-3 py-1.5 shadow-2xs">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="size-8 rounded-full flex items-center justify-center text-[#1D1D1D] hover:bg-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-6 text-center font-bold text-base tabular-nums text-[#1D1D1D]">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= 10}
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="size-8 rounded-full flex items-center justify-center text-[#1D1D1D] hover:bg-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            {/* SPECIAL INSTRUCTIONS */}
            <div className="bg-white rounded-2xl p-4 border border-[#E7E7E7] shadow-xs space-y-2">
              <label htmlFor="instructions" className="text-sm font-semibold text-[#1D1D1D] block">
                Special instructions (optional)
              </label>
              <Textarea
                id="instructions"
                rows={2}
                placeholder="Example: Less spicy, no onion, extra pickle..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="rounded-xl border-[#E7E7E7] bg-[#F8F7F4] p-3 text-sm focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32] resize-none"
              />
            </div>

            {/* STICKY / PROMINENT ADD TO CART BUTTON */}
            {!item.is_available ? (
              <p className="text-sm font-semibold text-[#D32F2F] text-center p-3 bg-red-50 rounded-xl">
                This item is currently unavailable.
              </p>
            ) : (
              <div className="sticky bottom-4 z-40 sm:relative sm:bottom-auto">
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={addToCart.isPending || !isOptionSelectionValid}
                  className="h-14 w-full rounded-2xl bg-[#2E7D32] hover:bg-[#256C2B] text-white font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-200 gap-2 cursor-pointer"
                >
                  <ShoppingBag className="size-5" />
                  {addToCart.isPending
                    ? 'Adding to Cart…'
                    : `Add Premium Thali · ${CURRENCY_SYMBOL}${totalPrice}`}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* MODERN REVIEWS SECTION */}
        <div className="pt-8 border-t border-[#E7E7E7] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#1D1D1D]">Customer Reviews</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm font-bold text-[#1D1D1D]">4.8 out of 5</span>
                <span className="text-sm text-[#666666]">(182 verified reviews)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {REVIEWS_MOCK.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-5 border border-[#E7E7E7] shadow-xs space-y-3 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`size-9 rounded-full ${rev.color} text-white font-bold text-sm flex items-center justify-center`}>
                      {rev.avatar}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-[#1D1D1D] block">{rev.name}</span>
                      <span className="text-[11px] text-[#666666]">{rev.date}</span>
                    </div>
                  </div>
                  <div className="flex text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-[#666666] leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
