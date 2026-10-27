import { Plus, Minus, Star } from 'lucide-react'
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
  isHolidayClosed?: boolean
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

export function MenuProductCard({ listing, onCustomize, isHolidayClosed }: MenuProductCardProps) {
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
  const isPublished = listing.daily_menus?.is_published !== false
  const isDisabled = listing.is_available === false || item.is_available === false
  const isHoliday = isHolidayClosed || false
  const isUnavailable = soldOut || cutoffPassed || isDisabled || !isPublished || isHoliday

  const cartLine = cartItems?.find(
    (ci) =>
      ci.food_item_id === item.id &&
      (!Array.isArray(ci.customizations) || ci.customizations.length === 0),
  )
  const isBusy = addToCart.isPending || updateQuantity.isPending || removeItem.isPending

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isUnavailable) return
    if (isThali || hasMultipleVariants || (item as any).item_customizations?.length > 0) {
      onCustomize?.(listing)
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
    onCustomize?.(listing)
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

  if (isThali) {
    tags.push('Free Snack')
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
          <span className="absolute top-2.5 left-8 z-10 text-[10px] font-bold text-amber-900 bg-amber-100/95 border border-amber-300/80 px-2 py-0.5 rounded-full shadow-xs">
            ★ Special
          </span>
        )}

        {/* Discount badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2.5 right-11 z-10 text-[10px] font-bold text-emerald-900 bg-emerald-100/95 border border-emerald-300 px-2 py-0.5 rounded-full shadow-xs">
            {discountPercent}% OFF
          </span>
        )}

        {/* Favorite heart on top right */}
        <div className="absolute top-2.5 right-2.5 z-10" onClick={(e) => e.stopPropagation()}>
          <FavoriteButton
            foodItemId={item.id}
            className="size-8 p-1.5 bg-white/90 backdrop-blur-xs rounded-full shadow-xs border border-white/60 hover:bg-white text-muted-foreground hover:text-rose-500"
          />
        </div>

        {/* Unavailable overlay */}
        {isUnavailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <span className="text-[11px] font-bold text-neutral-700 bg-white/95 px-3 py-1 rounded-full border border-border shadow-xs uppercase tracking-wide">
              {soldOut
                ? 'Sold Out'
                : isDisabled
                ? 'Unavailable'
                : isHoliday
                ? 'Closed for Holiday'
                : !isPublished
                ? 'Coming Soon'
                : 'Closed'}
            </span>
          </div>
        )}
      </div>

      {/* ── CARD CONTENT ── */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Dish Name & Rating */}
          <div className="flex items-start justify-between gap-1.5">
            <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-1">
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
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-base sm:text-lg font-extrabold text-foreground">
              {hasMultipleVariants ? 'From ' : ''}{CURRENCY_SYMBOL}{price}
            </span>
            {strikePrice && (
              <span className="text-xs text-muted-foreground line-through">
                {CURRENCY_SYMBOL}{strikePrice}
              </span>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1 min-h-[32px]">
              {item.description}
            </p>
          )}
        </div>

        {/* Tags + Add Button Row */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
          {/* Unboxed Metadata text (Zero-pill discipline) */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
            {tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                {idx > 0 && <span className="opacity-40">·</span>}
                <span className="truncate">{tag}</span>
              </span>
            ))}
          </div>

          {/* Action Button */}
          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            {cartLine && !hasMultipleVariants ? (
              <div className="flex items-center gap-1 bg-white border border-primary rounded-full p-0.5 shadow-xs">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => {
                    if (cartLine.quantity <= 1) removeItem.mutate(cartLine.id)
                    else updateQuantity.mutate({ id: cartLine.id, quantity: cartLine.quantity - 1 })
                  }}
                  className="size-7 flex items-center justify-center text-primary hover:bg-primary/10 rounded-full transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-3.5 stroke-[2.5]" />
                </button>
                <span className="text-xs font-bold text-primary w-5 text-center tabular-nums">
                  {cartLine.quantity}
                </span>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => updateQuantity.mutate({ id: cartLine.id, quantity: cartLine.quantity + 1 })}
                  className="size-7 flex items-center justify-center text-primary hover:bg-primary/10 rounded-full transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-3.5 stroke-[2.5]" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isBusy || isUnavailable}
                onClick={handleAdd}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-150 shadow-xs min-h-[36px]',
                  isUnavailable
                    ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed shadow-none'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground active:scale-95 cursor-pointer',
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
