import { useState } from 'react'
import { Plus, Minus, ChevronDown, Star } from 'lucide-react'
import { CURRENCY_SYMBOL } from '@/constants'
import { FavoriteButton } from '@/features/favorites/components/favorite-button'
import { useCartItems, useAddToCart, useRemoveCartItem, useUpdateCartItemQuantity } from '@/features/cart/hooks/use-cart'
import { isSoldOut, isCutoffPassed, type MenuListing } from '@/features/menu/services/menu-service'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate, useLocation } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { cn } from '@/lib/utils'

type MobileMenuItemRowProps = {
  listing: MenuListing
  onCustomize?: (listing: MenuListing) => void
  isHolidayClosed?: boolean
}

export function MobileMenuItemRow({
  listing,
  onCustomize,
  isHolidayClosed,
}: MobileMenuItemRowProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { data: cartItems } = useCartItems()
  const addToCart = useAddToCart()
  const updateQuantity = useUpdateCartItemQuantity()
  const removeItem = useRemoveCartItem()

  const item = listing.food_items
  const isThali = item.kind === 'thali'
  const variants = ((item as any).food_item_variants || []) as any[]
  const hasMultipleVariants = variants.length > 1

  const [selectedVariantId, setSelectedVariantId] = useState<string>(() => variants[0]?.id || '')
  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || variants[0] || null

  const price = selectedVariant ? selectedVariant.price : (listing.price_override ?? item.price)
  const strikePrice =
    selectedVariant?.compare_price && selectedVariant.compare_price > price
      ? selectedVariant.compare_price
      : (item.compare_price && item.compare_price > price ? item.compare_price : null)
  const discountPercent =
    strikePrice && strikePrice > price
      ? Math.round(((strikePrice - price) / strikePrice) * 100)
      : 0
  const soldOut = isSoldOut(listing)
  const cutoffPassed = isCutoffPassed(listing)
  const isPublished = listing.daily_menus?.is_published !== false
  const isDisabled = listing.is_available === false || item.is_available === false
  const isHoliday = isHolidayClosed || false
  const isUnavailable = soldOut || cutoffPassed || isDisabled || !isPublished || isHoliday

  // Check if chosen variant is already in cart without customizations (for direct +/- stepper)
  const targetVariantId = selectedVariant?.id ?? (variants.length === 1 ? variants[0].id : null)
  const cartLine = cartItems?.find(
    (ci) =>
      ci.food_item_id === item.id &&
      (hasMultipleVariants ? ci.variant_id === targetVariantId : true) &&
      (!Array.isArray(ci.customizations) || ci.customizations.length === 0),
  )

  const isBusy = addToCart.isPending || updateQuantity.isPending || removeItem.isPending

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isUnavailable) return

    // If it's a thali or has customizations, always open customizer
    if (isThali || (item as any).item_customizations?.length > 0) {
      onCustomize?.(listing)
      return
    }

    // Direct add to cart
    if (!isAuthenticated) {
      navigate(ROUTES.login, { state: { from: location } })
      return
    }

    addToCart.mutate({ food_item_id: item.id, variant_id: targetVariantId, quantity: 1 })
  }

  return (
    <div
      onClick={() => {
        if (isUnavailable) return
        onCustomize?.(listing)
      }}
      className={cn(
        'flex items-start justify-between gap-3 py-4 border-b border-border last:border-b-0 transition-colors',
        isUnavailable ? 'opacity-65 cursor-not-allowed' : 'cursor-pointer group active:bg-muted/30',
      )}
    >
      {/* ── LEFT: DISH DETAILS ── */}
      <div className="flex-1 min-w-0 pr-1">
        {/* Veg dot + Special badge */}
        <div className="flex items-center gap-1.5 mb-1">
          <span className="flex size-3.5 items-center justify-center rounded-xs border border-emerald-600 bg-white shrink-0">
            <span className="size-1.5 rounded-full bg-emerald-600" />
          </span>
          {listing.is_special && (
            <span className="text-[10px] font-bold text-primary bg-accent/60 border border-primary/20 px-1.5 py-px rounded-full">
              ★ Special
            </span>
          )}
        </div>

        {/* Title & Rating */}
        <div className="flex items-start justify-between gap-1.5">
          <h3 className="font-display text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
            {item.name}
          </h3>
          {item.rating_count > 0 && (
            <div className="inline-flex items-center gap-1 shrink-0 rounded-md border border-amber-300/80 bg-amber-50/90 px-1.5 py-0.5 text-[11px] font-bold text-amber-900">
              <Star className="size-3 fill-amber-500 text-amber-500" />
              <span>{Number(item.rating_average).toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mt-0.5 flex-wrap">
          <span className="font-display text-sm font-extrabold text-foreground">
            {hasMultipleVariants ? 'From ' : ''}{CURRENCY_SYMBOL}{price}
          </span>
          {strikePrice && (
            <span className="text-xs text-neutral-400 line-through">
              {CURRENCY_SYMBOL}{strikePrice}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-px rounded-full">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Pack Size / Variant Dropdown for Mobile */}
        {hasMultipleVariants && (
          <div className="mt-2" onClick={(e) => e.stopPropagation()}>
            <div className="relative inline-flex items-center w-full max-w-[200px]">
              <select
                value={selectedVariant?.id || ''}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="w-full text-xs font-semibold py-1.5 pl-2.5 pr-7 rounded-lg border border-emerald-300/90 bg-emerald-50/80 text-emerald-950 focus:outline-none focus:ring-1 focus:ring-emerald-600 appearance-none cursor-pointer"
                aria-label="Select size"
              >
                {variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label} · {CURRENCY_SYMBOL}{v.price}
                  </option>
                ))}
              </select>
              <ChevronDown className="size-3.5 text-emerald-700 absolute right-2 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Thali composition tags */}
        {isThali && item.ingredients && item.ingredients.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {item.ingredients.slice(0, 4).map((ing, i) => (
              <span
                key={i}
                className="text-[10px] bg-muted/60 text-muted-foreground font-medium px-1.5 py-0.5 rounded-md border border-border"
              >
                {ing}
              </span>
            ))}
            {item.ingredients.length > 4 && (
              <span className="text-[10px] text-muted-foreground/80 font-medium px-1 py-0.5">
                +{item.ingredients.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Description (non-thali) */}
        {!isThali && item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {/* ── RIGHT: IMAGE + FLOATING ADD BUTTON ── */}
      <div className="relative shrink-0 flex flex-col items-center">
        {/* Image box */}
        <div className="relative size-24 sm:size-28 rounded-2xl overflow-hidden bg-muted/50 border border-border shadow-xs">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              loading="lazy"
              className={cn(
                'size-full object-cover transition-transform duration-300 group-hover:scale-105',
                isUnavailable && 'grayscale-[30%] opacity-80',
              )}
            />
          ) : (
            <div className="size-full flex items-center justify-center text-3xl select-none bg-accent/30">
              {isThali ? '🍱' : '🍛'}
            </div>
          )}

          {/* Favorite button (top-right of image) */}
          <div className="absolute top-1.5 right-1.5 z-10" onClick={(e) => e.stopPropagation()}>
            <FavoriteButton
              foodItemId={item.id}
              className="size-6 p-1 bg-white/85 backdrop-blur-xs rounded-full shadow-xs border-0"
            />
          </div>
        </div>

        {/* Floating action button */}
        <div className="relative -mt-4 z-10 w-[84px] sm:w-[96px]">
          {isUnavailable ? (
            <div className="w-full py-1.5 bg-muted text-muted-foreground font-bold text-[10px] sm:text-[11px] rounded-xl shadow-xs text-center select-none border border-border">
              {soldOut
                ? 'Sold Out'
                : isDisabled
                ? 'Unavailable'
                : isHoliday
                ? 'Closed'
                : !isPublished
                ? 'Coming Soon'
                : 'Closed'}
            </div>
          ) : cartLine && !isThali ? (
            /* Active Stepper */
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full flex items-center justify-between bg-card border-2 border-primary rounded-xl p-0.5 shadow-md"
            >
              <button
                type="button"
                disabled={isBusy}
                onClick={() => {
                  if (cartLine.quantity <= 1) removeItem.mutate(cartLine.id)
                  else updateQuantity.mutate({ id: cartLine.id, quantity: cartLine.quantity - 1 })
                }}
                className="size-7 flex items-center justify-center text-primary hover:bg-accent rounded-lg transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="size-3.5 stroke-[2.5]" />
              </button>
              <span className="text-xs font-bold text-primary font-display tabular-nums">
                {cartLine.quantity}
              </span>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => updateQuantity.mutate({ id: cartLine.id, quantity: cartLine.quantity + 1 })}
                className="size-7 flex items-center justify-center text-primary hover:bg-accent rounded-lg transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="size-3.5 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            /* Add button */
            <button
              type="button"
              disabled={isBusy}
              onClick={handleActionClick}
              className="w-full min-h-[44px] py-1.5 bg-card hover:bg-primary hover:text-primary-foreground border-2 border-primary text-primary font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex flex-col items-center justify-center cursor-pointer"
            >
              <span>ADD</span>
              {isThali ? (
                <span className="text-[8px] font-semibold opacity-75 -mt-0.5 capitalize tracking-normal">
                  customise
                </span>
              ) : null}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
