import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Flame, Sparkles, Clock, HeartHandshake, ShieldCheck, Truck, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants'
import { cn } from '@/lib/utils'

const HERO_THALI_IMAGE = '/images/hero-thali.jpg'

// Rotating adjectives for dynamic appetite appeal
const ROTATING_WORDS = ['Kathiyawadi', 'Fresh', 'Pure Desi', 'Homestyle']

// 4 core promises for the clean divider bar
const STATEMENTS = [
  {
    icon: UtensilsCrossed,
    title: 'Ghar Jaisa Swad',
    description: 'Traditional slow-cooked recipes, never commercial.',
  },
  {
    icon: HeartHandshake,
    title: 'Cold-Pressed Oil & Ghee',
    description: '100% pure kachi ghani singtel & Amul cow ghee.',
  },
  {
    icon: Flame,
    title: 'Tava Fresh Rotla & Rotli',
    description: 'Piping hot desi bajra rotla & soft phulkas.',
  },
  {
    icon: Truck,
    title: 'Daily Doorstep Tiffin',
    description: 'Punctual lunch & dinner delivery in Ahmedabad.',
  },
]

export function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length)
    }, 2400)
    return () => clearInterval(interval)
  }, [])

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-background min-h-[85svh] flex flex-col justify-center"
    >
      {/* ── Subtle Warm Kathiyawadi Ambient Background ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-20 size-[34rem] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(229,138,19,0.12)_0%,transparent_70%)]" />
        <div className="absolute -bottom-24 -right-16 size-96 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(196,85,37,0.1)_0%,transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle, #735B47 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* ── Top Subtle Warm Border Accent ── */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-primary to-secondary"
      />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-12 py-10 sm:py-16 w-full">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">

          {/* ── LEFT COLUMN: Story Copy & CTAs ── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-6 lg:col-span-7"
          >
            {/* Live Service Indicator (Clean unboxed metadata) */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5 text-primary font-bold">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Gir Somnath Roots
              </span>
              <span aria-hidden="true" className="text-border">·</span>
              <span className="flex items-center gap-1.5 text-foreground/80">
                <ShieldCheck className="size-3.5 text-emerald-600" aria-hidden="true" />
                100% Pure Vegetarian
              </span>
              <span aria-hidden="true" className="text-border">·</span>
              <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <Clock className="size-3.5" aria-hidden="true" />
                Daily Fresh Batches
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-1.5">
              <p className="font-gujarati text-primary font-semibold text-base sm:text-lg tracking-wide">
                ઘર જેવો સ્વાદ, માઁ ના પ્રેમ સાથે —
              </p>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.12] font-bold text-foreground tracking-tight text-balance">
                Authentic{' '}
                <span className="inline-block overflow-hidden align-bottom" style={{ minWidth: '8rem' }}>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={wordIndex}
                      initial={{ y: 28, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -28, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="block text-primary"
                    >
                      {ROTATING_WORDS[wordIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <br />
                Meals, Delivered Warm
              </h1>
            </div>

            {/* Subtitle */}
            <p className="max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground font-sans">
              Handcrafted Kathiyawadi &amp; Gujarati tiffins prepared daily with cold-pressed groundnut oil,
              stone-ground grains, and fresh farm spices. No preservatives, no excess oil — just honest
              nourishment for your everyday routine.
            </p>

            {/* CTAs with >= 44px touch targets */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                size="lg"
                className="min-h-[48px] rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-7 text-base font-semibold shadow-md transition-all active:scale-[0.98]"
                asChild
              >
                <Link to={ROUTES.menu}>
                  Explore Today&apos;s Menu
                  <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="min-h-[48px] rounded-full border-2 border-primary/40 text-primary hover:bg-primary/5 hover:border-primary px-6 text-base font-semibold transition-all active:scale-[0.98]"
                asChild
              >
                <Link to={`${ROUTES.menu}?category=thalis`}>
                  Order Thali (₹80+)
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* ── RIGHT COLUMN: Traditional Kathiyawadi Thali Visual ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="relative lg:col-span-5"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Warm Kansa Aura */}
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-full bg-secondary/15 blur-2xl -z-10"
              />

              {/* Decorative Thali Ring Frame */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-[2.5rem] border border-secondary/30 -m-2 -z-10"
              />

              <div className="relative overflow-hidden rounded-[2.2rem] border border-border bg-card p-2.5 shadow-xl shadow-amber-950/5">
                <div className="relative aspect-[4/3] sm:aspect-square w-full overflow-hidden rounded-[1.8rem]">
                  <img
                    src={HERO_THALI_IMAGE}
                    alt="Authentic Homemade Traditional Gujarati Thali"
                    className="size-full object-cover transition-transform duration-700 hover:scale-105"
                    loading="eager"
                  />

                  {/* Gradient Scrim for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                  {/* Bottom Dish Banner */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white drop-shadow-md">
                    <div>
                      <p className="text-[11px] font-medium text-amber-200 uppercase tracking-wider font-sans">
                        Saurashtra Rasoi Special
                      </p>
                      <p className="font-display text-base font-bold leading-tight">
                        Kathiyawadi Dawat Thali
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-xs font-semibold text-amber-300 border border-white/10">
                      <Flame className="size-3 text-amber-400" />
                      <span>Tavathi Tazu</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Cultural Stamp with gentle floating animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: [0, -7, 0],
                }}
                transition={{
                  opacity: { delay: 0.5, duration: 0.4 },
                  scale: { delay: 0.5, duration: 0.4 },
                  y: { repeat: Infinity, duration: 3.5, ease: 'easeInOut' },
                }}
                className="absolute -top-3 -right-3 sm:-right-4 flex flex-col items-center justify-center size-20 sm:size-22 rounded-full bg-primary text-white text-center shadow-lg border-2 border-background select-none cursor-default"
              >
                <span className="text-base select-none">🌾</span>
                <span className="text-[10px] font-bold tracking-tight uppercase leading-none mt-0.5">
                  Farm To
                </span>
                <span className="font-display text-xs font-bold leading-none mt-0.5">
                  Thali
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* ── 4 STATEMENTS STRIP (Clean Modern Divider) ── */}
        <div className="mt-12 sm:mt-16 border-t border-border pt-6 sm:pt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {STATEMENTS.map((item, idx) => (
              <div
                key={item.title}
                className={cn(
                  'flex items-center gap-3.5 py-3 sm:py-2.5',
                  idx === 0
                    ? 'lg:pr-6 sm:pr-4'
                    : idx === STATEMENTS.length - 1
                      ? 'lg:pl-6 sm:pl-4'
                      : 'lg:px-6 sm:px-4',
                )}
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary shrink-0">
                  <item.icon className="size-5 stroke-[1.8]" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-display text-sm sm:text-base font-bold text-foreground leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
