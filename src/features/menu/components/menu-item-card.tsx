import { Link } from 'react-router-dom'
import { Leaf, ShoppingBag, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FavoriteButton } from '@/features/favorites/components/favorite-button'
import { CardCartControls } from '@/features/cart/components/card-cart-controls'
import { isSoldOut, isCutoffPassed, type MenuListing } from '@/features/menu/services/menu-service'
import { CURRENCY_SYMBOL, ROUTES } from '@/constants'
import { Reveal } from '@/components/common/reveal'

export function MenuItemCard({ listing, delay = 0 }: { listing: MenuListing; delay?: number }) {
  const item = listing.food_items
  const price = listing.price_override ?? item.offer_price ?? item.price
  const strikePrice = listing.price_override ? null : item.offer_price ? item.price : null
  const soldOut = isSoldOut(listing)
  const cutoffPassed = isCutoffPassed(listing)
  const unavailable = soldOut || cutoffPassed

  const linkState = {
    date: listing.daily_menus?.menu_date,
    mealType: listing.daily_menus?.meal_type,
  }

  return (
    <Reveal delay={delay}>
      <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
        <Link to={ROUTES.menuItem(item.slug)} state={linkState} className="block">
          <div className="bg-muted relative aspect-[4/3] shrink-0 overflow-hidden">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                loading="lazy"
                className="absolute inset-0 size-full object-cover"
              />
            ) : null}
            {listing.is_special ? (
              <Badge className="absolute top-1.5 left-1.5 gap-1 px-1.5 py-0 text-[10px]">
                <Sparkles className="size-2.5" aria-hidden />
                Special
              </Badge>
            ) : null}
            {unavailable ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-t-[inherit]">
                <ShoppingBag className="size-5 text-white/80 mb-1" />
                <span className="text-white text-xs font-semibold">
                  {soldOut ? 'Sold Out' : 'Orders Closed'}
                </span>
              </div>
            ) : null}
            {['veg', 'jain', 'vegan'].includes(item.food_type) ? (
              <span className="absolute bottom-1.5 left-1.5 flex size-5 items-center justify-center rounded-full bg-white shadow-sm">
                <Leaf className="size-3 text-green-600" aria-hidden />
              </span>
            ) : null}
            <FavoriteButton foodItemId={item.id} className="absolute top-1.5 right-1.5 size-7" />
          </div>
        </Link>

        <div className="flex flex-1 flex-col gap-1.5 p-2.5">
          <Link to={ROUTES.menuItem(item.slug)} state={linkState} className="block">
            <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
          </Link>
          <div className="flex items-baseline gap-1.5">
            <span className="text-primary text-sm font-semibold">
              {CURRENCY_SYMBOL}
              {price}
            </span>
            {strikePrice ? (
              <span className="text-muted-foreground text-xs line-through">
                {CURRENCY_SYMBOL}
                {strikePrice}
              </span>
            ) : null}
          </div>
          <CardCartControls foodItemId={item.id} className="mt-auto" disabled={unavailable} />
        </div>
      </Card>
    </Reveal>
  )
}
