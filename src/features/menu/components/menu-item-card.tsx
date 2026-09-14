import { ShoppingBag, Sparkles, SlidersHorizontal } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FavoriteButton } from '@/features/favorites/components/favorite-button'
import { CardCartControls } from '@/features/cart/components/card-cart-controls'
import { isSoldOut, isCutoffPassed, type MenuListing } from '@/features/menu/services/menu-service'
import { CURRENCY_SYMBOL } from '@/constants'
import { Reveal } from '@/components/common/reveal'

type MenuItemCardProps = {
  listing: MenuListing
  delay?: number
  onCustomizeClick?: () => void
}

export function MenuItemCard({
  listing,
  delay = 0,
  onCustomizeClick,
}: MenuItemCardProps) {
  const item = listing.food_items
  const isThali = item.kind === 'thali'
  const price = listing.price_override ?? item.price
  const strikePrice = listing.price_override ? null : item.compare_price ?? null
  const soldOut = isSoldOut(listing)
  const cutoffPassed = isCutoffPassed(listing)
  const unavailable = soldOut || cutoffPassed

  const handleCardClick = (e: React.MouseEvent) => {
    if (onCustomizeClick && (isThali || (item as any).item_customizations?.length > 0)) {
      e.preventDefault()
      onCustomizeClick()
    }
  }

  return (
    <Reveal delay={delay}>
      <Card
        onClick={handleCardClick}
        className="h-full flex flex-col gap-0 overflow-hidden py-0 rounded-2xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-neutral-200/80 group cursor-pointer"
      >
        {/* ── IMAGE SECTION ── */}
        <div className="bg-neutral-100 relative aspect-[4/3] shrink-0 overflow-hidden">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              loading="lazy"
              className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="size-full flex items-center justify-center text-4xl bg-neutral-100">
              {isThali ? '🍱' : '🍛'}
            </div>
          )}

          {listing.is_special ? (
            <Badge className="absolute top-2 left-2 gap-1 px-2 py-0.5 text-[10px] bg-amber-500 hover:bg-amber-600 text-white font-bold border-none shadow-sm">
              <Sparkles className="size-2.5" aria-hidden />
              Special
            </Badge>
          ) : null}

          {unavailable ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-2xs rounded-t-[inherit] z-10">
              <ShoppingBag className="size-6 text-white/90 mb-1" />
              <span className="text-white text-xs font-bold uppercase tracking-wider">
                {soldOut ? 'Sold Out' : 'Closed'}
              </span>
            </div>
          ) : null}

          {['veg', 'jain', 'vegan'].includes(item.food_type) ? (
            <span className="absolute bottom-2 left-2 flex size-5 items-center justify-center rounded-sm bg-white border border-green-600 shadow-sm z-10">
              <span className="size-2 rounded-full bg-green-600" />
            </span>
          ) : null}

          <div className="absolute top-2 right-2 z-10">
            <FavoriteButton foodItemId={item.id} className="size-8 p-1.5 bg-white/80 backdrop-blur-xs rounded-full shadow-xs" />
          </div>
        </div>

        {/* ── CARD DETAILS ── */}
        <div className="flex flex-1 flex-col p-3.5 gap-2">
          <div>
            <h3 className="line-clamp-1 text-sm sm:text-base font-bold text-neutral-900 group-hover:text-primary transition-colors">
              {item.name}
            </h3>

            {/* Price Row */}
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-sm sm:text-base font-extrabold text-neutral-900">
                {CURRENCY_SYMBOL}
                {price}
              </span>
              {strikePrice ? (
                <span className="text-xs text-neutral-400 line-through">
                  {CURRENCY_SYMBOL}
                  {strikePrice}
                </span>
              ) : null}
            </div>
          </div>

          {/* Thali Composition Tags */}
          {isThali && item.ingredients && item.ingredients.length > 0 && (
            <div className="flex flex-wrap gap-1 my-0.5">
              {item.ingredients.slice(0, 3).map((ing, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-neutral-100 text-neutral-700 font-medium px-1.5 py-0.5 rounded-md border border-neutral-200/60"
                >
                  {ing}
                </span>
              ))}
              {item.ingredients.length > 3 && (
                <span className="text-[10px] text-neutral-400 font-medium px-1 py-0.5">
                  +{item.ingredients.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Description if not thali */}
          {!isThali && item.description && (
            <p className="text-xs text-neutral-500 line-clamp-1 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Bottom Action */}
          <div className="mt-auto pt-1.5" onClick={(e) => e.stopPropagation()}>
            {isThali ? (
              <Button
                size="sm"
                className="w-full h-9 rounded-xl font-semibold text-xs bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 shadow-2xs flex items-center justify-center gap-1.5"
                disabled={unavailable}
                onClick={onCustomizeClick}
              >
                <SlidersHorizontal className="size-3.5" />
                <span>Customize & Add</span>
              </Button>
            ) : (
              <CardCartControls foodItemId={item.id} disabled={unavailable} />
            )}
          </div>
        </div>
      </Card>
    </Reveal>
  )
}
