import { Link } from 'react-router-dom'
import { Sparkles, ShoppingBag, UtensilsCrossed } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { Reveal } from '@/components/common/reveal'
import { useTodaysSpecial } from '@/features/home/hooks/use-home-queries'
import { ROUTES } from '@/constants'

export function TodaysSpecialSection() {
  const { data: items, isPending, isError, refetch } = useTodaysSpecial()

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-10 text-center">
        <p className="text-primary flex items-center justify-center gap-1.5 text-sm font-semibold tracking-wide uppercase">
          <Sparkles className="size-4" aria-hidden />
          Today's Special
        </p>
        <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">
          Chef's picks for today
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Browse today's special items — place a full order below.
        </p>
      </div>

      {isPending ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !items?.length ? (
        <EmptyState
          icon={Sparkles}
          title="No special items available right now"
          description="Our kitchen hasn't marked today's specials yet — check back soon."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((item, index) => {
              const foodItem = item.food_items
              if (!foodItem) return null
              return (
                <Reveal key={item.id} delay={index * 0.05}>
                  <Card className="h-full gap-0 overflow-hidden py-0 group transition-shadow hover:shadow-md">
                    {/* Image */}
                    <div className="bg-muted relative aspect-[4/3] shrink-0 overflow-hidden">
                      {foodItem.image_url ? (
                        <img
                          src={foodItem.image_url}
                          alt={foodItem.name}
                          loading="lazy"
                          className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <UtensilsCrossed className="size-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Name only */}
                    <div className="p-2.5">
                      <p className="line-clamp-1 text-sm font-medium text-center">{foodItem.name}</p>
                    </div>
                  </Card>
                </Reveal>
              )
            })}
          </div>

          {/* Order CTA */}
          <div className="mt-10 flex justify-center">
            <Link to={ROUTES.menu}>
              <Button
                size="lg"
                className="gap-2 bg-primary px-8 text-white shadow-md hover:opacity-90 transition-opacity"
                id="todays-special-order-btn"
              >
                <ShoppingBag className="size-5" aria-hidden />
                Order Now
              </Button>
            </Link>
          </div>
        </>
      )}
    </section>
  )
}
