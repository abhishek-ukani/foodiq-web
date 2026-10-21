import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, MapPin, Flame, Sprout, Home, CookingPot, ShieldCheck, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

const HERO_THALI_IMAGE = '/images/hero-thali.jpg'

// Rotating words for the animated headline
const ROTATING_WORDS = ['Homemade', 'Fresh', 'Authentic', 'Kathiyawadi']

// 4 statements for the separate horizontal line (matching reference image style)
const STATEMENTS = [
  {
    icon: Home,
    title: 'Home-style',
    description: 'Made to feel like home.',
  },
  {
    icon: CookingPot,
    title: 'Freshly prepared',
    description: 'Prepared fresh for every meal.',
  },
  {
    icon: ShieldCheck,
    title: 'Hygienic',
    description: 'Clean, careful and quality-focused.',
  },
  {
    icon: Truck,
    title: 'Doorstep delivery',
    description: 'Fresh & on-time to your door.',
  },
]

export function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-[#FDFAF4] min-h-[90svh] sm:min-h-[80svh] flex flex-col justify-center"
    >
      {/* ── Gujarati Rangoli-inspired warm background ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {/* Warm saffron-gold radial glow — top left */}
        <div className="absolute -top-24 -left-24 size-[36rem] rounded-full bg-[radial-gradient(ellipse_at_center,#FFF0CC55_0%,transparent_70%)]" />
        {/* Terracotta warm accent — bottom right */}
        <div className="absolute -bottom-20 -right-12 size-80 rounded-full bg-[radial-gradient(ellipse_at_center,#D8582018_0%,transparent_70%)]" />
        {/* Subtle dot pattern — Gujarati textile feel */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(circle, #8B4513 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* ── Decorative top border — saffron stripe ── */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-[#D85820] to-amber-500"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16 w-full">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">

          {/* ── LEFT COLUMN: Copy & CTAs ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="space-y-7 lg:col-span-7"
          >
            {/* Origin Pill — Gir · Somnath */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-amber-600/35 bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-800 tracking-wide shadow-sm"
            >
              <MapPin className="size-3.5 text-[#D85820] shrink-0" aria-hidden="true" />
              <span>Gir · Somnath</span>
              <span className="mx-1 text-amber-400">•</span>
              <Sprout className="size-3.5 text-primary shrink-0" aria-hidden="true" />
              <span>Farm-Direct Ingredients</span>
            </motion.div>

            {/* Main Headline */}
            <div className="space-y-2">
              {/* Gujarati sub-label above main headline */}
              <p className="font-serif italic text-[#D85820] text-base sm:text-lg tracking-wide">
                ઘર સે દિલ તક —
              </p>

              <h1 className="font-display text-[2.6rem] sm:text-5xl lg:text-6xl leading-[1.1] font-bold text-foreground tracking-tight">
                {/* Animated rotating adjective */}
                <span className="inline-block overflow-hidden align-bottom" style={{ minWidth: '6rem' }}>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={wordIndex}
                      initial={{ y: 32, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -32, opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="block text-[#D85820]"
                    >
                      {ROTATING_WORDS[wordIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>{' '}
                Food,{' '}
                <br className="hidden sm:block" />
                Delivered with{' '}
                <span className="font-serif italic font-normal text-primary">Love</span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground font-sans">
              Daily homemade meals straight from our kitchen — sabji, rotlo, kadhi, dal, farsan
              and more. Taste of{' '}
              <span className="text-foreground font-semibold">Maa ki Rasoi</span>,
              made fresh every day with farm-sourced goodness.{' '}
              <span className="text-[#D85820] font-semibold not-italic">
                ❤️ Ghar Se Dil Tak
              </span>
            </p>

            {/* CTA Buttons */}
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
                className="h-12 rounded-full border-2 border-[#D85820] text-[#D85820] hover:bg-[#D85820]/10 px-6 text-base font-semibold transition-all pill-tap"
                asChild
              >
                <Link to={`${ROUTES.menu}?category=thalis`}>
                  Today&apos;s Menu
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* ── RIGHT COLUMN: Thali Visual ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.2, ease: 'easeOut' }}
            className="relative lg:col-span-5"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Warm plate glow */}
              <div
                aria-hidden="true"
                className="absolute -inset-6 rounded-full bg-amber-400/15 blur-3xl -z-10"
              />

              {/* Decorative Gujarati "thali ring" border */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-[2.8rem] border-2 border-dashed border-amber-500/25 -m-3 -z-10"
              />

              <div className="relative overflow-hidden rounded-[2.5rem] border border-[#EDE4D3] bg-card/60 p-2 shadow-xl shadow-amber-950/8">
                <div className="relative aspect-[4/3] sm:aspect-square w-full overflow-hidden rounded-[2.2rem]">
                  <img
                    src={HERO_THALI_IMAGE}
                    alt="Fresh Homemade Traditional Gujarati Thali - Ghar Se Dil Tak"
                    className="size-full object-cover transition-transform duration-700 hover:scale-105"
                    loading="eager"
                  />

                  {/* Bottom gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                  {/* Floating bottom tag */}
                  <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between text-white drop-shadow-md">
                    <div>
                      <p className="text-[10px] font-medium text-white/75 uppercase tracking-wider">
                        Special Thali
                      </p>
                      <p className="text-sm font-bold leading-tight">
                        Maa Ki Rasoi
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium">
                      <Flame className="size-3 text-amber-400" />
                      <span>Roj Tazu</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating origin badge */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="absolute -top-3 -right-3 sm:-right-5 flex flex-col items-center justify-center size-20 sm:size-24 rounded-full bg-[#D85820] text-white text-center shadow-lg border-2 border-white/30"
              >
                <span className="text-lg font-bold leading-none">🌾</span>
                <span className="text-[10px] font-bold leading-tight mt-0.5 px-1">
                  Farm to
                </span>
                <span className="text-[10px] font-bold leading-tight">
                  Thali
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* ── Separate Full Horizontal Line for the 4 Statements (Reference Image Style) ── */}
        <div className="mt-12 sm:mt-16 border-t border-[#EDE4D3] pt-6 sm:pt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#EDE4D3]">
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
                <item.icon className="size-6 text-[#C9891F] shrink-0 stroke-[1.5]" aria-hidden="true" />
                <div>
                  <h3 className="font-serif text-base font-bold text-foreground leading-tight">
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
