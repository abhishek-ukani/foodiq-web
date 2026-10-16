import { Plus, Minus } from 'lucide-react'
import { CURRENCY_SYMBOL } from '@/constants'
import { FavoriteButton } from '@/features/favorites/components/favorite-button'
import {
  useCartItems,
  useAddToCart,
  useRemoveCartItem,
  useUpdateCartItemQuantity,
} from '@/features/cart/hooks/use-cart'
import { isSoldOut, isCutoffPassed, type MenuListing } from '@/features/menu/services/menu-service'
import { cn } from '@/lib/utils'

type DesktopThaliCardProps = {
  listing: MenuListing
  onCustomize?: (listing: MenuListing) => void
}

/**
 * Standard Indian Veg Mark
 */
function VegIndicator({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'size-4 rounded-xs border-[1.5px] border-[#087443] bg-white flex items-center justify-center p-[2px] shadow-xs',
        className,
      )}
      title="Vegetarian"
    >
      <div className="size-1.5 rounded-full bg-[#087443]" />
    </div>
  )
}

export function DesktopThaliCard({ listing, onCustomize }: DesktopThaliCardProps) {
  const { data: cartItems } = useCartItems()
  const addToCart = useAddToCart()
  const updateQuantity = useUpdateCartItemQuantity()
  const removeItem = useRemoveCartItem()

  const item = listing.food_items
  const price = listing.price_override ?? item.price
  const strikePrice = listing.price_override ? null : (item.compare_price ?? null)
  const soldOut = isSoldOut(listing)
  const cutoffPassed = isCutoffPassed(listing)
  const isDisabled = listing.is_available === false || item.is_available === false
  const isUnavailable = soldOut || cutoffPassed || isDisabled

  const cartLine = cartItems?.find(
    (ci) =>
      ci.food_item_id === item.id &&
      (!Array.isArray(ci.customizations) || ci.customizations.length === 0),
  )
  const isBusy = addToCart.isPending || updateQuantity.isPending || removeItem.isPending

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isUnavailable) return
    onCustomize?.(listing) // Thalis open customizer drawer for selection
  }

  const handleCardClick = () => {
    if (!isUnavailable) onCustomize?.(listing)
  }

  // Ingredients from admin database
  const ingredients = item.ingredients && Array.isArray(item.ingredients) ? item.ingredients : []

  return (
    <article
      onClick={handleCardClick}
      className={cn(
        'group flex flex-col sm:flex-row bg-white rounded-2xl border border-[#E9E5DA] overflow-hidden transition-all duration-200 select-none cursor-pointer',
        isUnavailable
          ? 'opacity-65'
          : 'hover:shadow-[0_8px_24px_rgba(8,116,67,0.08)] hover:-translate-y-0.5',
      )}
    >
      {/* ── LEFT IMAGE (Uses admin-provided item.image_url) ── */}
      <div className="relative w-full sm:w-[44%] min-h-[170px] sm:min-h-[185px] bg-[#FAF4E8] shrink-0 overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            className={cn(
              'absolute inset-0 size-full object-cover transition-transform duration-300',
              !isUnavailable && 'group-hover:scale-105',
              isUnavailable && 'grayscale-[25%]',
            )}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl select-none bg-gradient-to-br from-[#FAF4E8] to-[#F5EBD7]">
            🍱
          </div>
        )}

        {isUnavailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <span className="text-[11px] font-bold text-neutral-600 bg-white/95 px-3 py-1 rounded-full border border-[#E9E5DA] shadow-xs uppercase tracking-wide">
              {soldOut ? 'Sold Out' : isDisabled ? 'Unavailable' : 'Closed'}
            </span>
          </div>
        )}
      </div>

      {/* ── RIGHT DETAILS ── */}
      <div className="p-4 flex flex-col justify-between flex-1 gap-2.5 min-w-0">
        <div>
          {/* Top: Veg indicator + Heart button */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <VegIndicator />
              <span className="text-[11px] font-semibold text-[#087443]">Veg</span>
            </div>

            <div onClick={(e) => e.stopPropagation()}>
              <FavoriteButton
                foodItemId={item.id}
                className="size-7 p-1 bg-white/90 rounded-full shadow-xs border border-[#E9E5DA]/60 hover:bg-white text-[#7A817B] hover:text-rose-500"
              />
            </div>
          </div>

          {/* Dish Title */}
          <h3 className="text-sm sm:text-base font-bold text-[#17231D] leading-snug group-hover:text-[#087443] transition-colors">
            {item.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-base sm:text-lg font-bold text-[#17231D]">
              {CURRENCY_SYMBOL}{price}
            </span>
            {strikePrice && (
              <span className="text-xs text-[#7A817B] line-through">
                {CURRENCY_SYMBOL}{strikePrice}
              </span>
            )}
          </div>
        </div>

        {/* Included Items Chips */}
        <div className="flex flex-wrap gap-1.5">
          {ingredients.slice(0, 4).map((ing, i) => (
            <span
              key={i}
              className="text-[11px] font-medium text-[#6B5847] bg-[#FAF8F2] border border-[#E9E5DA] px-2 py-0.5 rounded-md leading-tight"
            >
              {ing}
            </span>
          ))}
          {ingredients.length > 4 && (
            <span className="text-[11px] font-medium text-[#7A817B] bg-[#FAF8F2] border border-[#E9E5DA] px-2 py-0.5 rounded-md leading-tight">
              +{ingredients.length - 4} more
            </span>
          )}
        </div>

        {/* Bottom: Customization note & Add button */}
        <div className="flex items-center justify-between pt-1 border-t border-[#F3EFE6]/70 mt-1">
          <span className="text-[11px] font-medium text-[#8C8375] italic">
            Tap to customize
          </span>

          <div onClick={(e) => e.stopPropagation()}>
            {cartLine ? (
              <div className="flex items-center gap-1 bg-white border border-[#087443] rounded-full p-0.5 shadow-xs">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => {
                    if (cartLine.quantity <= 1) removeItem.mutate(cartLine.id)
                    else updateQuantity.mutate({ id: cartLine.id, quantity: cartLine.quantity - 1 })
                  }}
                  className="size-6 flex items-center justify-center text-[#087443] hover:bg-[#087443]/10 rounded-full transition-colors"
                >
                  <Minus className="size-3 stroke-[2.5]" />
                </button>
                <span className="text-xs font-bold text-[#087443] w-4 text-center tabular-nums">
                  {cartLine.quantity}
                </span>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => updateQuantity.mutate({ id: cartLine.id, quantity: cartLine.quantity + 1 })}
                  className="size-6 flex items-center justify-center text-[#087443] hover:bg-[#087443]/10 rounded-full transition-colors"
                >
                  <Plus className="size-3 stroke-[2.5]" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isBusy || isUnavailable}
                onClick={handleAdd}
                className={cn(
                  'flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 shadow-xs cursor-pointer',
                  isUnavailable
                    ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                    : 'bg-[#087443] hover:bg-[#065b34] text-white active:scale-95',
                )}
              >
                <Plus className="size-3.5 stroke-[2.5]" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
