import { Link } from 'react-router-dom'
import { Flame, Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { CardCartControls } from '@/features/cart/components/card-cart-controls'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { Reveal } from '@/components/common/reveal'
import { usePopularItems } from '@/features/home/hooks/use-home-queries'
import { CURRENCY_SYMBOL, ROUTES } from '@/constants'

export function PopularMealsSection() {
  const { data: items, isPending, isError, refetch } = usePopularItems(6)

  return (
    <section className="bg-muted/40 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <p className="text-primary flex items-center justify-center gap-1.5 text-sm font-semibold tracking-wide uppercase">
            <Flame className="size-4" aria-hidden />
            Popular Meals
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">
            Customer favourites
          </h2>
        </div>

        {isPending ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !items?.length ? (
          <EmptyState
            icon={Flame}
            title="Nothing trending yet"
            description="Once orders start rolling in, our most-loved dishes will show up here."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((item, index) => (
              <Reveal key={item.id} delay={index * 0.03}>
                <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
                  <Link to={ROUTES.menuItem(item.slug)} className="block">
                    <div className="bg-muted relative aspect-[4/3] shrink-0 overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          loading="lazy"
                          className="absolute inset-0 size-full object-cover"
                        />
                      ) : null}
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col gap-1.5 p-2.5">
                    <Link to={ROUTES.menuItem(item.slug)} className="block">
                      <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
                    </Link>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-primary text-sm font-semibold">
                        {CURRENCY_SYMBOL}
                        {item.offer_price ?? item.price}
                      </p>
                      {item.rating_count > 0 ? (
                        <span className="text-muted-foreground flex items-center gap-1 text-xs">
                          <Star className="size-3 fill-current text-amber-500" aria-hidden />
                          {item.rating_average.toFixed(1)}
                        </span>
                      ) : null}
                    </div>
                    <CardCartControls foodItemId={item.id} className="mt-auto" />
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
