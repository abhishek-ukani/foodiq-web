import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/common/reveal'
import { ROUTES } from '@/constants'

export function CtaSection() {
  return (
    <section id="cta-banner" className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Reveal>
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-[#185834] via-[#14492b] to-[#0f3820] px-6 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-12 shadow-xl shadow-primary/10 border border-primary/20 select-none"
        >
          {/* Subtle Ambient Radial Glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-emerald-400/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-amber-400/10 blur-3xl"
          />

          {/* Very Subtle Ambient Dot Texture */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 lg:gap-10">
            {/* Left Side: Headline & Subtitle */}
            <div className="space-y-2 sm:space-y-3 text-center md:text-left max-w-xl">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-snug">
                Good Food Brings People{' '}
                <span className="font-serif italic font-normal text-amber-300">
                  Together
                </span>
              </h2>

              <p className="text-sm sm:text-base lg:text-lg font-sans text-white/80 leading-relaxed">
                Order now and bring the authentic taste of freshly prepared, homemade food right to your table.
              </p>
            </div>

            {/* Right Side: Order Now Action Button */}
            <div className="shrink-0">
              <Button
                size="lg"
                className="h-12 sm:h-13 rounded-full bg-white text-primary hover:bg-[#FAF6EE] px-8 text-sm sm:text-base font-semibold shadow-lg shadow-black/15 transition-all hover:scale-105 active:scale-95 group/btn whitespace-nowrap"
                asChild
              >
                <Link
                  to={ROUTES.menu}
                  onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
                  className="flex items-center gap-2"
                >
                  <span>Order Now</span>
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </Reveal>
    </section>
  )
}
