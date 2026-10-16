import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/common/reveal'
import { ROUTES } from '@/constants'
import { useTodaysSpecial } from '@/features/home/hooks/use-home-queries'

export function TodaysSpecialSection() {
  const { data: specials, isLoading } = useTodaysSpecial()

  // Only render if specials have been published for today
  const validSpecials = (specials || []).filter((dish) => Boolean(dish.food_items))

  if (isLoading || validSpecials.length === 0) {
    return null
  }

  return (
    <section id="todays-special" className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
      {/* Section Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-terracotta/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-terracotta mb-2">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Today&apos;s Special Preparations
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
          What&apos;s Cooking in Our Kitchen Today
        </h2>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto text-sm sm:text-base">
          Every morning we prepare authentic specials to include in our lunch &amp; dinner thalis.
          Here are today&apos;s featured highlights.
        </p>
      </div>

      {/* Showcase Dishes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {validSpecials.map((dish, index) => {
          const item = dish.food_items!

          return (
            <Reveal key={dish.id} delay={index * 0.08}>
              <Card className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/80 bg-card p-0 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
                {/* Dish Photo or Placeholder */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF5EC]">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src="/images/dish-placeholder.svg"
                      alt={item.name}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>

                {/* Dish Info */}
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {item.name}
                  </h3>
                  {item.name_gujarati && (
                    <p className="text-xs text-muted-foreground/80 mt-0.5 font-medium">
                      {item.name_gujarati}
                    </p>
                  )}
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}


                </div>
              </Card>
            </Reveal>
          )
        })}
      </div>

      {/* Button to navigate to meals in menu */}
      <div className="mt-10 flex flex-col items-center justify-center">
        <Button
          size="lg"
          className="h-12 rounded-full bg-primary px-8 text-base font-semibold text-white shadow-md hover:bg-primary/90 transition-all pill-tap"
          asChild
        >
          <Link to={`${ROUTES.menu}?category=thalis`} className="flex items-center gap-2">
            Explore Thalis &amp; Meals
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
