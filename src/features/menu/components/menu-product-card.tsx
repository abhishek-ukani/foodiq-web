import { Plus, Minus } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CURRENCY_SYMBOL, ROUTES } from '@/constants'
import { FavoriteButton } from '@/features/favorites/components/favorite-button'
import {
  useCartItems,
  useAddToCart,
  useRemoveCartItem,
  useUpdateCartItemQuantity,
} from '@/features/cart/hooks/use-cart'
import { isSoldOut, isCutoffPassed, type MenuListing } from '@/features/menu/services/menu-service'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

type MenuProductCardProps = {
  listing: MenuListing
  onCustomize?: (listing: MenuListing) => void
}

/**
 * Standard Indian Veg Mark: White rounded square with green border and green dot
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

export function MenuProductCard({ listing, onCustomize }: MenuProductCardProps) {
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

  const price = listing.price_override ?? item.price
  const strikePrice = item.compare_price && item.compare_price > price ? item.compare_price : null
  const discountPercent =
    strikePrice && strikePrice > price
      ? Math.round(((strikePrice - price) / strikePrice) * 100)
      : 0

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
    if (isThali) {
      onCustomize?.(listing)
      return
    }
    if (hasMultipleVariants) {
      navigate(ROUTES.menuItem(item.slug || item.id))
      return
    }
    if (!isAuthenticated) {
      navigate(ROUTES.login, { state: { from: location } })
      return
    }
    const variantId = variants.length === 1 ? variants[0].id : null
    addToCart.mutate({ food_item_id: item.id, variant_id: variantId, quantity: 1 })
  }

  const handleCardClick = () => {
    if (isUnavailable) return
    if (isThali) {
      onCustomize?.(listing)
    } else {
      navigate(ROUTES.menuItem(item.slug || item.id))
    }
  }

  // Dynamic tags from admin item fields
  const tags: string[] = []
  if (hasMultipleVariants) {
    tags.push(`${variants.length} Sizes`)
  } else if (item.unit_label) {
    tags.push(item.unit_label)
  } else if ((item as any).weight) {
    tags.push((item as any).weight)
  }

  if (item.categories?.name) {
    tags.push(item.categories.name)
  }

  if (listing.is_special) {
    tags.push('Chef Special')
  }

  return (
    <article
      onClick={handleCardClick}
      className={cn(
        'group flex flex-col bg-white rounded-2xl border overflow-hidden transition-all duration-200 select-none',
        'border-[#E9E5DA]',
        isUnavailable
          ? 'opacity-65'
          : 'hover:shadow-[0_8px_24px_rgba(8,116,67,0.08)] hover:-translate-y-0.5 cursor-pointer',
      )}
    >
      {/* ── IMAGE SECTION (Uses admin-provided item.image_url) ── */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#FAF4E8] shrink-0">
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
          <div className="absolute inset-0 flex items-center justify-center text-4xl select-none bg-gradient-to-br from-[#FAF4E8] to-[#F5EBD7]">
            {isThali ? '🍱' : '🍛'}
          </div>
        )}

        {/* Veg dot indicator badge on top left */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <VegIndicator />
        </div>

        {/* Special badge */}
        {listing.is_special && (
          <span className="absolute top-2.5 left-8 z-10 text-[10px] font-bold text-amber-700 bg-amber-50/95 border border-amber-200 px-1.5 py-0.5 rounded-full shadow-xs">
            ★ Special
          </span>
        )}

        {/* Discount badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2.5 right-11 z-10 text-[10px] font-bold text-emerald-800 bg-emerald-50/95 border border-emerald-300 px-1.5 py-0.5 rounded-full shadow-xs">
            {discountPercent}% OFF
          </span>
        )}

        {/* Favorite heart on top right */}
        <div className="absolute top-2.5 right-2.5 z-10" onClick={(e) => e.stopPropagation()}>
          <FavoriteButton
            foodItemId={item.id}
            className="size-7 p-1 bg-white/90 backdrop-blur-xs rounded-full shadow-xs border border-white/60 hover:bg-white text-[#7A817B] hover:text-rose-500"
          />
        </div>

        {/* Unavailable overlay */}
        {isUnavailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <span className="text-[11px] font-bold text-neutral-600 bg-white/95 px-3 py-1 rounded-full border border-[#E9E5DA] shadow-xs uppercase tracking-wide">
              {soldOut ? 'Sold Out' : isDisabled ? 'Unavailable' : 'Closed'}
            </span>
          </div>
        )}
      </div>

      {/* ── CARD CONTENT ── */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Dish Name */}
          <h3 className="font-bold text-sm sm:text-base text-[#17231D] leading-snug group-hover:text-[#087443] transition-colors line-clamp-1">
            {item.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-base sm:text-lg font-bold text-[#17231D]">
              {hasMultipleVariants ? 'From ' : ''}{CURRENCY_SYMBOL}{price}
            </span>
            {strikePrice && (
              <span className="text-xs text-[#7A817B] line-through">
                {CURRENCY_SYMBOL}{strikePrice}
              </span>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-xs text-[#7A817B] line-clamp-2 leading-relaxed mt-1 min-h-[32px]">
              {item.description}
            </p>
          )}
        </div>

        {/* Tags + Add Button Row */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#F3EFE6]/70">
          {/* Metadata pill tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium text-[#7A817B] bg-[#FAF8F2] border border-[#E9E5DA] px-2 py-0.5 rounded-md whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Action Button */}
          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            {cartLine && !hasMultipleVariants ? (
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
                  'flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 shadow-xs cursor-pointer',
                  isUnavailable
                    ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                    : 'bg-[#087443] hover:bg-[#065b34] text-white active:scale-95',
                )}
              >
                <Plus className="size-3.5 stroke-[2.5]" />
                <span>{hasMultipleVariants ? 'Options' : 'Add'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
