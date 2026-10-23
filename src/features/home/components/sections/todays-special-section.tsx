import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight, Flame } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/common/reveal'
import { ROUTES } from '@/constants'
import { useTodaysSpecial } from '@/features/home/hooks/use-home-queries'

// Curated signature dishes used as fallback if today's menu is pending publication
const FEATURED_FALLBACK_SPECIALS = [
  {
    id: 'olo',
    name: 'Ringna No Olo',
    name_gujarati: 'રીંગણાનો ઓળો',
    description: 'Smoky fire-roasted baingan tempered with fresh spring garlic, green chillies & groundnut oil.',
    image_url: '/public/gujarati-thali-hero.jpg',
    badge: 'Fire Roasted',
  },
  {
    id: 'sev-tameta',
    name: 'Kathiyawadi Sev Tameta',
    name_gujarati: 'કાઠિયાવાડી સેવ ટમેટા',
    description: 'Tangy-sweet vine tomato gravy infused with roasted cumin, topped with crisp Bhavnagri sev.',
    image_url: '/public/images/dishes/classic-thali.jpg',
    badge: 'Guest Favorite',
  },
  {
    id: 'bajra-rotlo',
    name: 'Clay-Tava Bajra Rotlo',
    name_gujarati: 'માટીના તવાનો બાજરો',
    description: 'Hand-patted black millet flatbread roasted over slow embers, served with white butter & jaggery.',
    image_url: '/public/images/dishes/gujarati-kathiyawadi-thali.jpg',
    badge: 'Tava Fresh',
  },
  {
    id: 'kadhi-khichdi',
    name: 'Rajwadi Kadhi & Khichdi',
    name_gujarati: 'રજવાડી કઢી-ખીચડી',
    description: 'Aromatic tempered buttermilk kadhi with cloves and curry leaves, paired with ghee khichdi.',
    image_url: '/public/images/hero-thali.jpg',
    badge: 'Comfort Classic',
  },
]

export function TodaysSpecialSection() {
  const { data: specials } = useTodaysSpecial()

  const dynamicSpecials = (specials || [])
    .filter((dish) => Boolean(dish.food_items))
    .map((dish) => ({
      id: dish.id,
      name: dish.food_items!.name,
      name_gujarati: dish.food_items!.name_gujarati,
      description: dish.food_items!.description,
      image_url: dish.food_items!.image_url,
      badge: dish.is_special ? "Today's Special" : 'Kitchen Fresh',
    }))

  const displayList = dynamicSpecials.length > 0 ? dynamicSpecials : FEATURED_FALLBACK_SPECIALS

  return (
    <section id="todays-special" className="relative w-full bg-[#F5EEDD] py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-12">
      {/* Section Header */}
      <div className="mb-10 text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="size-3.5" aria-hidden="true" />
          <span>રસોઈની વિશેષતા • Daily Culinary Highlights</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
          Today&apos;s Special Preparations
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base font-sans">
          Every morning we slow-cook authentic Kathiyawadi preparations to accompany our daily thalis.
          Here is what is simmering in our pots today.
        </p>
      </div>

      {/* Showcase Dishes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {displayList.map((dish, index) => (
          <Reveal key={dish.id} delay={index * 0.06}>
            <Card className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
              {/* Dish Photo */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/40">
                <img
                  src={dish.image_url || '/images/dish-placeholder.svg'}
                  alt={dish.name}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-106"
                />

                {/* Subtle scrim & badge */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-semibold drop-shadow-sm">
                  <span className="flex items-center gap-1 text-amber-200">
                    <Flame className="size-3" />
                    {dish.badge}
                  </span>
                  <span className="text-white/80">Pure Veg</span>
                </div>
              </div>

              {/* Dish Info */}
              <div className="flex flex-1 flex-col p-4 sm:p-4.5 justify-between">
                <div>
                  <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {dish.name}
                  </h3>
                  {dish.name_gujarati && (
                    <p className="font-gujarati text-xs text-primary font-medium mt-0.5">
                      {dish.name_gujarati}
                    </p>
                  )}
                  {dish.description && (
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                      {dish.description}
                    </p>
                  )}
                </div>

                <div className="mt-3.5 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Part of Today&apos;s Thali</span>
                  <span className="text-primary group-hover:translate-x-0.5 transition-transform">Order &rarr;</span>
                </div>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>

      {/* Button to navigate to meals in menu */}
      <div className="mt-10 flex flex-col items-center justify-center">
        <Button
          size="lg"
          className="min-h-[48px] rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 text-base font-semibold shadow-md transition-all active:scale-[0.98]"
          asChild
        >
          <Link to={`${ROUTES.menu}?category=thalis`} className="flex items-center gap-2">
            Explore Thalis &amp; Meals
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      </div>
    </section>
  )
}
