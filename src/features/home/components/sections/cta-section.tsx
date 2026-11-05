import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  MessageCircle,
  UtensilsCrossed,
  SlidersHorizontal,
  MapPin,
  Bike,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/common/reveal'
import { ROUTES } from '@/constants'

const ORDER_STEPS = [
  {
    step: '1',
    icon: UtensilsCrossed,
    title: 'Choose Your Meal',
    desc: 'Explore daily rotating Kathiyawadi thalis, specials & Jain options.',
  },
  {
    step: '2',
    icon: SlidersHorizontal,
    title: 'Customize Your Thali',
    desc: 'Select ghee rotli or bajra rotla, fresh sabjis, kathod & chaas.',
  },
  {
    step: '3',
    icon: MapPin,
    title: 'Enter Delivery Address',
    desc: 'Quick checkout for any home or office across Ahmedabad.',
  },
  {
    step: '4',
    icon: Bike,
    title: 'Enjoy Fresh & Hot',
    desc: 'Delivered warm in spill-proof packing right on time for your meal.',
  },
]

export function CtaSection() {
  const whatsappInquireUrl = `https://wa.me/919999999999?text=${encodeURIComponent(
    'Hello FoodIQ! I would like to inquire about today’s menu, Kathiyawadi meals, and Jain food options.',
  )}`

  return (
    <section
      id="cta-banner"
      className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-12 py-10 sm:py-16 lg:py-20"
    >
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[3rem] bg-gradient-to-br from-[#8a2e0a] via-[#702406] to-[#3d1404] p-8 sm:p-12 lg:p-16 text-white shadow-2xl shadow-primary/25 border border-primary/40 select-none">
          {/* Ambient Lighting Accents */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-amber-400/20 blur-[100px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-32 size-96 rounded-full bg-orange-600/25 blur-[100px]"
          />

          {/* Subtle Organic Dot Texture */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, white 1.2px, transparent 1.2px)',
              backgroundSize: '28px 28px',
            }}
          />

          <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-8 sm:space-y-10">
            {/* Header Content */}
            <div className="space-y-3 sm:space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold uppercase tracking-wider text-amber-200">
                <Sparkles className="size-3.5 text-amber-300" />
                <span>How To Order • 4 Simple Steps</span>
              </span>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Good Food Brings People{' '}
                <span className="font-serif italic font-normal text-amber-200 underline decoration-amber-400/40 underline-offset-6 decoration-wavy">
                  Together
                </span>
              </h2>

              <p className="text-sm sm:text-base lg:text-lg font-sans text-white/85 leading-relaxed max-w-2xl mx-auto">
                Order your wholesome homemade tiffin in 4 quick steps and enjoy genuine Kathiyawadi taste every day.
              </p>
            </div>

            {/* 4 Simple Steps to Place Order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 w-full">
              {ORDER_STEPS.map((item, idx) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="relative flex flex-col items-center sm:items-start text-center sm:text-left rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 sm:p-5 space-y-2.5 transition-all shadow-xs group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="size-10 rounded-xl bg-white/15 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform">
                        <Icon className="size-5" />
                      </div>
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30">
                        Step {item.step}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-display text-sm sm:text-base font-bold text-white leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs text-white/80 font-sans leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Exactly Two Buttons: Order Now & Inquire Now */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto pt-2">
              <Button
                size="lg"
                className="min-h-[52px] rounded-full bg-white text-primary hover:bg-[#FAF6EE] px-9 text-sm sm:text-base font-bold shadow-xl shadow-black/20 transition-all hover:scale-105 active:scale-95 group/btn cursor-pointer justify-center"
                asChild
              >
                <Link
                  to={ROUTES.menu}
                  onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
                  className="flex items-center gap-2"
                >
                  <span>Order Now</span>
                  <ArrowRight className="size-4.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="min-h-[52px] rounded-full border-white/35 bg-white/10 hover:bg-white/20 text-white hover:text-white px-9 text-sm sm:text-base font-bold backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer justify-center"
                asChild
              >
                <a
                  href={whatsappInquireUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="size-4.5 text-emerald-400" />
                  <span>Inquire Now</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
