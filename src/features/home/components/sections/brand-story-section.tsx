import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/common/reveal'
import { ROUTES } from '@/constants'

const CHEF_MOTHER_IMAGE =
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80'

export function BrandStorySection() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] border border-border/80 bg-gradient-to-r from-[#FFFDF9] via-[#FAF4E8] to-[#FFFDF9] p-6 sm:p-10 shadow-sm">
          {/* Subtle background leaves */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 -right-12 size-56 rounded-full bg-primary/5 blur-2xl"
          />

          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Left Image: Home Mother / Chef */}
            <div className="relative lg:col-span-4">
              <div className="relative aspect-[4/3] sm:aspect-square w-full overflow-hidden rounded-[2rem] border border-border/60 shadow-md">
                <img
                  src={CHEF_MOTHER_IMAGE}
                  alt="Maa Cooking with Care in Kitchen"
                  className="size-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-foreground shadow-xs">
                  Homemade with care ❤️
                </div>
              </div>
            </div>

            {/* Center: Story Copy */}
            <div className="space-y-4 lg:col-span-5">
              <div className="inline-flex items-center gap-1.5 text-xs font-serif italic text-terracotta">
                <Sparkles className="size-3.5" />
                <span>Our Story</span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                From Our Home to Yours{' '}
                <span className="inline-block text-primary text-2xl align-middle">🍃</span>
              </h2>

              <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                We are a small home kitchen, where every dish is made with fresh ingredients,
                traditional recipes, and a lot of love. We believe in simple food, honest flavors,
                and happy homes.
              </p>

              <div className="pt-2">
                <Button
                  size="sm"
                  className="h-10 rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-primary/90 shadow-xs pill-tap"
                  asChild
                >
                  <Link to={ROUTES.about}>
                    Know More
                    <ArrowRight className="ml-1.5 size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: Circular Badge Stamp */}
            <div className="flex justify-center lg:col-span-3">
              <div className="relative flex size-36 sm:size-44 flex-col items-center justify-center rounded-full border-2 border-dashed border-amber-600/40 bg-amber-500/5 p-4 text-center shadow-xs">
                <span className="font-serif text-lg sm:text-xl font-bold text-foreground leading-tight">
                  Desi Taste
                </span>
                <span className="text-terracotta text-sm my-0.5">•</span>
                <span className="font-serif italic text-sm sm:text-base text-terracotta font-medium leading-tight">
                  Homemade Love
                </span>
                <span className="mt-1 text-sm">❤️</span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
