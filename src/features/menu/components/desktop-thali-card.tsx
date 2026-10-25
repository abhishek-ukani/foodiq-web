import { Plus, Minus, Star } from 'lucide-react'
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
  isHolidayClosed?: boolean
}

/**
 * Standard Indian Veg Mark
 */
function VegIndicator({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'size-4 rounded-xs border-[1.5px] border-emerald-600 bg-white flex items-center justify-center p-[2px] shadow-2xs',
        className,
      )}
      title="Vegetarian"
    >
      <div className="size-1.5 rounded-full bg-emerald-600" />
    </div>
  )
}

export function DesktopThaliCard({ listing, onCustomize, isHolidayClosed }: DesktopThaliCardProps) {
  const { data: cartItems } = useCartItems()
  const addToCart = useAddToCart()
  const updateQuantity = useUpdateCartItemQuantity()
  const removeItem = useRemoveCartItem()

  const item = listing.food_items
  const price = listing.price_override ?? item.price
  const strikePrice = listing.price_override ? null : (item.compare_price ?? null)
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
    onCustomize?.(listing) // Thalis open customizer drawer for selection
  }

  const handleCardClick = () => {
    if (!isUnavailable) onCustomize?.(listing)
  }

  // Ingredients from admin database (snacks are not part of the thali by default)
  const ingredients = (item.ingredients && Array.isArray(item.ingredients) ? item.ingredients : []).filter((ing) => {
    const lower = ing.toLowerCase()
    return !lower.includes('snack') && !lower.includes('farsan')
  })

  return (
    <article
      onClick={handleCardClick}
      className={cn(
        'group flex flex-col sm:flex-row bg-card rounded-2xl border border-border overflow-hidden transition-all duration-200 select-none shadow-xs',
        isUnavailable
          ? 'opacity-65 cursor-not-allowed'
          : 'hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 cursor-pointer',
      )}
    >
      {/* ── LEFT IMAGE (Uses admin-provided item.image_url) ── */}
      <div className="relative w-full sm:w-[44%] min-h-[170px] sm:min-h-[185px] bg-muted/40 shrink-0 overflow-hidden">
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
          <div className="absolute inset-0 flex items-center justify-center text-5xl select-none bg-accent/30">
            🍱
          </div>
        )}

        {isUnavailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/60 backdrop-blur-[1px]">
            <span className="text-[11px] font-bold text-muted-foreground bg-card px-3 py-1 rounded-full border border-border shadow-xs uppercase tracking-wide">
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

      {/* ── RIGHT DETAILS ── */}
      <div className="p-4 flex flex-col justify-between flex-1 gap-2.5 min-w-0">
        <div>
          {/* Top: Veg indicator + Heart button */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <VegIndicator />
              <span className="text-[11px] font-semibold text-emerald-700">Pure Veg</span>
            </div>

            <div onClick={(e) => e.stopPropagation()}>
              <FavoriteButton
                foodItemId={item.id}
                className="size-7 p-1 bg-card rounded-full shadow-xs border border-border hover:bg-muted text-muted-foreground hover:text-rose-500"
              />
            </div>
          </div>

          {/* Dish Title & Rating */}
          <div className="flex items-start justify-between gap-1.5">
            <h3 className="font-display text-sm sm:text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
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
            <span className="font-display text-base sm:text-lg font-bold text-foreground">
              {CURRENCY_SYMBOL}{price}
            </span>
            {strikePrice && (
              <span className="text-xs text-muted-foreground line-through">
                {CURRENCY_SYMBOL}{strikePrice}
              </span>
            )}
          </div>
        </div>

        {/* Included Items Chips */}
        <div className="flex flex-wrap gap-1.5">
          {ingredients.slice(0, 3).map((ing, i) => (
            <span
              key={i}
              className="text-[11px] font-medium text-muted-foreground bg-muted/50 border border-border px-2 py-0.5 rounded-md leading-tight"
            >
              {ing}
            </span>
          ))}
          {ingredients.length > 3 && (
            <span className="text-[11px] font-medium text-muted-foreground/80 bg-muted/50 border border-border px-2 py-0.5 rounded-md leading-tight">
              +{ingredients.length - 3} more
            </span>
          )}
          <span className="text-[11px] font-semibold text-emerald-850 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 px-2 py-0.5 rounded-md leading-tight flex items-center gap-1">
            <span>🥗</span>
            <span>+ Free Add-ons</span>
          </span>
        </div>

        {/* Bottom: Customization note & Add button */}
        <div className="flex items-center justify-between pt-1 border-t border-border mt-1">
          <span className="text-[11px] font-medium text-muted-foreground italic">
            Tap to customize
          </span>

          <div onClick={(e) => e.stopPropagation()}>
            {cartLine ? (
              <div className="flex items-center gap-1 bg-card border-2 border-primary rounded-full p-0.5 shadow-xs">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => {
                    if (cartLine.quantity <= 1) removeItem.mutate(cartLine.id)
                    else updateQuantity.mutate({ id: cartLine.id, quantity: cartLine.quantity - 1 })
                  }}
                  className="size-6 flex items-center justify-center text-primary hover:bg-accent rounded-full transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-3 stroke-[2.5]" />
                </button>
                <span className="text-xs font-bold text-primary w-4 text-center tabular-nums font-display">
                  {cartLine.quantity}
                </span>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => updateQuantity.mutate({ id: cartLine.id, quantity: cartLine.quantity + 1 })}
                  className="size-6 flex items-center justify-center text-primary hover:bg-accent rounded-full transition-colors cursor-pointer"
                  aria-label="Increase quantity"
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
                  'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 shadow-xs min-h-[38px]',
                  isUnavailable
                    ? 'bg-muted text-muted-foreground cursor-not-allowed shadow-none'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground active:scale-95 cursor-pointer',
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
