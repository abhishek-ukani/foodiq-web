import { Link } from 'react-router-dom'
import { Heart, Leaf } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { FavoriteButton } from '@/features/favorites/components/favorite-button'
import { useMyFavorites } from '@/features/favorites/hooks/use-favorites'
import { CURRENCY_SYMBOL, ROUTES } from '@/constants'

export function FavoritesTab() {
  const { data: favorites, isPending } = useMyFavorites()

  if (isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (!favorites?.length) {
    return (
      <EmptyState
        icon={Heart}
        title="No favorites yet"
        description="Tap the heart icon on any dish to save it here."
        className="border-none py-10"
      />
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {favorites.map((favorite) => {
        const item = favorite.food_items
        const price = item.offer_price ?? item.price
        return (
          <Card key={favorite.id} className="overflow-hidden">
            <Link to={ROUTES.menuItem(item.slug)} className="flex gap-3">
              <div className="bg-muted relative size-24 shrink-0">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="size-full object-cover" />
                ) : null}
              </div>
              <CardContent className="flex-1 space-y-1 py-3 pr-3 pl-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-1 font-medium">{item.name}</p>
                  <FavoriteButton foodItemId={item.id} className="size-7 shrink-0" />
                </div>
                {item.categories ? (
                  <p className="text-muted-foreground text-xs">{item.categories.name}</p>
                ) : null}
                <div className="flex items-center gap-1.5">
                  {['veg', 'jain', 'vegan'].includes(item.food_type) ? (
                    <Leaf className="size-3 text-green-600" aria-hidden />
                  ) : null}
                  <span className="text-primary text-sm font-semibold">
                    {CURRENCY_SYMBOL}
                    {price}
                  </span>
                </div>
              </CardContent>
            </Link>
          </Card>
        )
      })}
    </div>
  )
}
