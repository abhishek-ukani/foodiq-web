import { ShoppingCart, Plus, Minus } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CURRENCY_SYMBOL, ROUTES } from '@/constants'
import { FavoriteButton } from '@/features/favorites/components/favorite-button'
import { useCartItems, useAddToCart, useRemoveCartItem, useUpdateCartItemQuantity } from '@/features/cart/hooks/use-cart'
import { isSoldOut, isCutoffPassed, type MenuListing } from '@/features/menu/services/menu-service'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

type DesktopMenuItemRowProps = {
  listing: MenuListing
  onCustomize?: (listing: MenuListing) => void
}

/**
 * Horizontal list-row layout for regular (non-thali) items in the desktop menu.
 * Image left (~100px) | Name + price + description center | Fav + ADD right.
 */
export function DesktopMenuItemRow({ listing, onCustomize }: DesktopMenuItemRowProps) {
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
  const cutoffPassed = isCutoffPassed(listing)
  const isDisabled = listing.is_available === false || item.is_available === false
  const isUnavailable = soldOut || cutoffPassed || isDisabled

  const cartLine = cartItems?.find(
    (ci) => ci.food_item_id === item.id && (!Array.isArray(ci.customizations) || ci.customizations.length === 0),
  )
  const isBusy = addToCart.isPending || updateQuantity.isPending || removeItem.isPending

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isUnavailable) return
    if (isThali || (item as any).item_customizations?.length > 0) {
      onCustomize?.(listing)
      return
    }
    if (!isAuthenticated) {
      navigate(ROUTES.login, { state: { from: location } })
      return
    }
    addToCart.mutate({ food_item_id: item.id, quantity: 1 })
  }

  return (
    <div
      onClick={() => { if (!isUnavailable) onCustomize?.(listing) }}
      className={cn(
        'flex items-center gap-4 bg-white border border-[#ede4d3]/80 rounded-2xl p-3 transition-all duration-150',
        isUnavailable ? 'opacity-60' : 'hover:shadow-sm hover:border-[#ede4d3] cursor-pointer group',
      )}
    >
      {/* ── IMAGE ── */}
      <div className="relative size-[100px] shrink-0 rounded-xl overflow-hidden bg-[#f4ede0]">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            className={cn(
              'size-full object-cover transition-transform duration-300',
              !isUnavailable && 'group-hover:scale-105',
              isUnavailable && 'grayscale-[30%]',
            )}
          />
        ) : (
          <div className="size-full flex items-center justify-center text-3xl">🍛</div>
        )}
        {isUnavailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <span className="text-[10px] font-bold text-neutral-500 bg-white/80 px-2 py-0.5 rounded-full">
              {soldOut ? 'Sold Out' : 'Closed'}
            </span>
          </div>
        )}
      </div>

      {/* ── DETAILS ── */}
      <div className="flex-1 min-w-0">
        {/* Veg indicator */}
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 py-px rounded-full mb-1.5">
          <span className="size-1.5 rounded-full bg-green-600 shrink-0" />
          Veg
        </span>

        {/* Special */}
        {listing.is_special && (
          <span className="ml-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-px rounded-full">
            ★ Special
          </span>
        )}

        <h3 className="text-sm font-bold text-[#221b14] leading-snug mt-0.5 group-hover:text-[#185834] transition-colors">
          {item.name}
        </h3>

        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-sm font-extrabold text-[#221b14]">
            {CURRENCY_SYMBOL}{price}
          </span>
          {strikePrice && (
            <span className="text-xs text-neutral-400 line-through">
              {CURRENCY_SYMBOL}{strikePrice}
            </span>
          )}
        </div>

        {item.description && (
          <p className="text-xs text-[#6b5847] line-clamp-1 mt-0.5 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {/* ── ACTIONS ── */}
      <div className="flex flex-col items-end gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
        <FavoriteButton
          foodItemId={item.id}
          className="size-7 p-1.5 bg-transparent border-0 shadow-none text-neutral-400 hover:text-rose-500"
        />

        {isUnavailable ? (
          <span className="text-[11px] font-semibold text-neutral-400 px-3 py-1.5 rounded-xl bg-neutral-100 border border-neutral-200">
            {soldOut ? 'Sold out' : 'Closed'}
          </span>
        ) : cartLine && !isThali ? (
          /* Stepper */
          <div className="flex items-center gap-1 bg-white border-2 border-[#185834] rounded-xl p-0.5">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => {
                if (cartLine.quantity <= 1) removeItem.mutate(cartLine.id)
                else updateQuantity.mutate({ id: cartLine.id, quantity: cartLine.quantity - 1 })
              }}
              className="size-7 flex items-center justify-center text-[#185834] hover:bg-[#185834]/10 rounded-lg transition-colors"
            >
              <Minus className="size-3 stroke-[2.5]" />
            </button>
            <span className="text-sm font-bold text-[#185834] w-4 text-center tabular-nums">
              {cartLine.quantity}
            </span>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => updateQuantity.mutate({ id: cartLine.id, quantity: cartLine.quantity + 1 })}
              className="size-7 flex items-center justify-center text-[#185834] hover:bg-[#185834]/10 rounded-lg transition-colors"
            >
              <Plus className="size-3 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          /* Add button */
          <button
            type="button"
            disabled={isBusy}
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#185834] text-white text-xs font-bold hover:bg-[#0f4024] active:scale-95 transition-all duration-150 shadow-sm min-h-[36px]"
          >
            <ShoppingCart className="size-3.5" />
            <span>{isThali ? 'Customise' : 'Add'}</span>
          </button>
        )}
      </div>
    </div>
  )
}
