import { Plus, Minus } from 'lucide-react'
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
  isAlwaysAvailable?: boolean
}

export function MobileMenuItemRow({
  listing,
  onCustomize,
  isAlwaysAvailable = false,
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
  const price = listing.price_override ?? item.price
  const strikePrice = listing.price_override ? null : item.compare_price ?? null
  const soldOut = isSoldOut(listing)
  const cutoffPassed = !isAlwaysAvailable && isCutoffPassed(listing)
  const isUnavailable = soldOut || cutoffPassed

  // Check if item is already in cart without customizations (for direct +/- stepper)
  const cartLine = cartItems?.find(
    (ci) => ci.food_item_id === item.id && (!Array.isArray(ci.customizations) || ci.customizations.length === 0),
  )

  const isBusy = addToCart.isPending || updateQuantity.isPending || removeItem.isPending

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation()

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

    addToCart.mutate({ food_item_id: item.id, quantity: 1 })
  }

  return (
    <div
      onClick={() => onCustomize?.(listing)}
      className="flex items-start justify-between gap-3 py-4 border-b border-neutral-100 last:border-b-0 cursor-pointer group active:bg-neutral-50/50 transition-colors"
    >
      {/* ── LEFT: DISH DETAILS & COMPOSITION ── */}
      <div className="flex-1 min-w-0 pr-1">
        {/* Badges: Veg dot + 24x7 or Special */}
        <div className="flex items-center gap-1.5 mb-1">
          <span className="flex size-3.5 items-center justify-center rounded-xs border border-green-600 bg-white p-0.5 shrink-0">
            <span className="size-1.5 rounded-full bg-green-600" />
          </span>
          {isAlwaysAvailable && (
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-1.5 py-0.2 rounded-full">
              24x7
            </span>
          )}
          {listing.is_special && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-full">
              ★ Special
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-neutral-900 leading-snug group-hover:text-primary transition-colors">
          {item.name}
        </h3>

        {/* Price & Discount */}
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-sm sm:text-base font-extrabold text-neutral-900">
            {CURRENCY_SYMBOL}
            {price}
          </span>
          {strikePrice && (
            <span className="text-xs text-neutral-400 line-through">
              {CURRENCY_SYMBOL}
              {strikePrice}
            </span>
          )}
        </div>

        {/* Thali Composition Tags */}
        {isThali && item.ingredients && item.ingredients.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.ingredients.slice(0, 4).map((ing, i) => (
              <span
                key={i}
                className="text-[10px] bg-neutral-100 text-neutral-700 font-medium px-1.5 py-0.5 rounded-md border border-neutral-200/60"
              >
                {ing}
              </span>
            ))}
            {item.ingredients.length > 4 && (
              <span className="text-[10px] text-neutral-400 font-medium px-1 py-0.5">
                +{item.ingredients.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {item.description && (
          <p className="text-xs text-neutral-500 line-clamp-2 mt-1.5 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {/* ── RIGHT: SQUARE IMAGE + OVERLAPPING FLOATING ADD BUTTON ── */}
      <div className="relative shrink-0 flex flex-col items-center">
        <div className="relative size-24 sm:size-28 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200/70 shadow-2xs">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              loading="lazy"
              className={cn(
                'size-full object-cover transition-transform duration-300 group-hover:scale-105',
                isUnavailable && 'grayscale-[40%] opacity-70',
              )}
            />
          ) : (
            <div className="size-full flex items-center justify-center text-3xl bg-neutral-100">
              {isThali ? '🍱' : '🍛'}
            </div>
          )}

          {/* Favorite button (top-right of image) */}
          <div className="absolute top-1.5 right-1.5 z-10">
            <FavoriteButton foodItemId={item.id} className="size-6 p-1 bg-white/80 backdrop-blur-xs rounded-full shadow-xs" />
          </div>
        </div>

        {/* Floating Overlapping Button (Swiggy / Zomato Style) */}
        <div className="relative -mt-4.5 z-10 w-[84px] sm:w-[94px]">
          {isUnavailable ? (
            <div className="w-full py-1 bg-neutral-200 text-neutral-500 font-bold text-[11px] rounded-lg shadow-xs text-center select-none border border-neutral-300/80">
              {soldOut ? 'Sold Out' : 'Closed'}
            </div>
          ) : cartLine && !isThali ? (
            /* Active Stepper on image */
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full flex items-center justify-between bg-white border-2 border-emerald-600 rounded-lg p-0.5 shadow-md"
            >
              <button
                type="button"
                disabled={isBusy}
                onClick={() => {
                  if (cartLine.quantity <= 1) removeItem.mutate(cartLine.id)
                  else updateQuantity.mutate({ id: cartLine.id, quantity: cartLine.quantity - 1 })
                }}
                className="size-6 flex items-center justify-center text-emerald-700 hover:bg-emerald-50 rounded"
              >
                <Minus className="size-3 stroke-[2.5]" />
              </button>
              <span className="text-xs font-bold text-emerald-800">
                {cartLine.quantity}
              </span>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => {
                  updateQuantity.mutate({ id: cartLine.id, quantity: cartLine.quantity + 1 })
                }}
                className="size-6 flex items-center justify-center text-emerald-700 hover:bg-emerald-50 rounded"
              >
                <Plus className="size-3 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            /* Add Button with subtle customisable tag */
            <button
              type="button"
              disabled={isBusy}
              onClick={handleActionClick}
              className="w-full py-1.5 bg-white hover:bg-emerald-50/80 border-2 border-emerald-600 text-emerald-700 font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 flex flex-col items-center justify-center"
            >
              <span>ADD</span>
              {isThali && (
                <span className="text-[8px] font-semibold text-neutral-400 -mt-0.5 capitalize tracking-normal">
                  customise
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
