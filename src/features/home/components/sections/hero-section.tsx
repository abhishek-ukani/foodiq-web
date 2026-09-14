import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Utensils, Leaf, Home, ShieldCheck, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants'
import { useTodaysSpecial } from '@/features/home/hooks/use-home-queries'

const HERO_THALI_IMAGE = '/images/hero-thali.jpg'

export function HeroSection() {
  const { data: specials } = useTodaysSpecial()
  const hasSpecials = Boolean(specials && specials.length > 0)
  return (
    <section className="relative overflow-hidden bg-background py-8 sm:py-12 lg:py-16">
      {/* Soft warm background vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,#fef3e2_0%,transparent_60%)]"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Copy & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-6 lg:col-span-7"
          >
            {/* Real Homemade Food Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-terracotta/30 bg-terracotta/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-terracotta">
              <Utensils className="size-3.5" aria-hidden="true" />
              <span>Real Homemade Food</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl leading-[1.12] font-bold text-foreground sm:text-5xl lg:text-6xl tracking-tight">
              Fresh Meals,
              <br />
              Made with{' '}
              <span className="font-serif italic text-terracotta font-normal">
                Love
              </span>{' '}
              <span className="text-terracotta text-3xl sm:text-4xl inline-block align-middle">
                ❤️
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground font-sans">
              Daily homemade meals, snacks, farsan and more — straight from our kitchen to your
              home. Taste of Maa ki Rasoi, delivered fresh every day.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                size="lg"
                className="h-12 rounded-full bg-primary px-7 text-base font-semibold text-white shadow-md hover:bg-primary/90 transition-all pill-tap"
                asChild
              >
                <Link to={ROUTES.menu}>
                  Explore Our Menu
                  <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-2 border-terracotta text-terracotta hover:bg-terracotta/10 px-6 text-base font-semibold transition-all pill-tap"
                asChild
              >
                {hasSpecials ? (
                  <a href="#todays-special">
                    Today&apos;s Menu
                  </a>
                ) : (
                  <Link to={ROUTES.menu}>
                    Today&apos;s Menu
                  </Link>
                )}
              </Button>
            </div>

            {/* Trust Highlights Strip with Vertical Dividers */}
            <div className="border-t border-border/70 pt-6">
              <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:divide-x sm:divide-border/80">
                <div className="flex items-center gap-2.5 sm:pr-4">
                  <Leaf className="size-5 text-primary shrink-0 stroke-[1.8]" aria-hidden="true" />
                  <span className="text-xs sm:text-sm font-semibold text-foreground leading-tight">
                    Fresh<br className="hidden sm:inline" /> Ingredients
                  </span>
                </div>

                <div className="flex items-center gap-2.5 sm:px-4">
                  <Home className="size-5 text-primary shrink-0 stroke-[1.8]" aria-hidden="true" />
                  <span className="text-xs sm:text-sm font-semibold text-foreground leading-tight">
                    Home<br className="hidden sm:inline" /> Made
                  </span>
                </div>

                <div className="flex items-center gap-2.5 sm:px-4">
                  <ShieldCheck className="size-5 text-primary shrink-0 stroke-[1.8]" aria-hidden="true" />
                  <span className="text-xs sm:text-sm font-semibold text-foreground leading-tight">
                    Hygienic<br className="hidden sm:inline" /> &amp; Safe
                  </span>
                </div>

                <div className="flex items-center gap-2.5 sm:pl-4">
                  <Truck className="size-5 text-primary shrink-0 stroke-[1.8]" aria-hidden="true" />
                  <span className="text-xs sm:text-sm font-semibold text-foreground leading-tight">
                    On-Time<br className="hidden sm:inline" /> Delivery
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Visual Plate */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="relative lg:col-span-5"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Soft warm plate glow */}
              <div className="absolute -inset-4 rounded-full bg-amber-500/10 blur-2xl -z-10" />

              <div className="relative overflow-hidden rounded-[2.5rem] border border-border/60 bg-card/60 p-2 shadow-xl shadow-amber-950/5">
                <div className="relative aspect-[4/3] sm:aspect-square w-full overflow-hidden rounded-[2.2rem]">
                  <img
                    src={HERO_THALI_IMAGE}
                    alt="Fresh Homemade Traditional Indian Thali"
                    className="size-full object-cover transition-transform duration-700 hover:scale-105"
                    loading="eager"
                  />
                  {/* Soft bottom gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

                  {/* Floating Tag inside image */}
                  <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-white drop-shadow-md">
                    <span className="text-xs font-semibold tracking-wide">
                      Maa Ki Rasoi Special Thali
                    </span>
                    <span className="rounded-full bg-black/40 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-medium">
                      Cooked Fresh Daily
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
