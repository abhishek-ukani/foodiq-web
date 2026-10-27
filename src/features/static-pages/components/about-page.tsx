import { ChefHat } from 'lucide-react'
import { Reveal } from '@/components/common/reveal'
import { FarmStorySection } from '@/features/home/components/sections/farm-story-section'
import { WhyFoodIqSection } from '@/features/home/components/sections/why-foodiq-section'
import { ServingAhmedabadSection } from '@/features/home/components/sections/serving-ahmedabad-section'
import { CtaSection } from '@/features/home/components/sections/cta-section'
import { SectionDivider } from '@/components/common/section-divider'

export function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-clip bg-background">
      {/* ── ABOUT HERO HEADER ── */}
      <section className="relative mx-auto max-w-4xl px-4 pt-16 pb-12 sm:pt-20 sm:pb-16 text-center">
        <Reveal>
          <div className="bg-primary text-primary-foreground mx-auto flex size-14 items-center justify-center rounded-2xl shadow-md">
            <ChefHat className="size-7" aria-hidden />
          </div>
          <h1 className="font-display mt-6 text-4xl font-bold sm:text-5xl text-foreground tracking-tight">
            About FoodIQ
          </h1>
          <p className="font-gujarati text-lg sm:text-xl font-semibold text-primary mt-2">
            શુદ્ધ ઘરનો સ્વાદ, પ્રેમથી પીરસાયેલું જમણ
          </p>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base sm:text-lg leading-relaxed font-sans">
            A home kitchen turned daily tiffin service, built on one timeless belief: everyday food should feel like someone prepared it with personal care just for you.
          </p>
        </Reveal>
      </section>

      {/* Scalloped transition into Deep Wine Why FoodIQ */}
      <SectionDivider
        variant="scallop"
        fromColor="text-background"
        toColor="bg-[#2D0D19]"
      />

      {/* ── 1. WHY FOODIQ? SECTION (5 Core Principles) ── */}
      <WhyFoodIqSection bgClassName="bg-[#2D0D19]" />

      {/* Elegant Heritage Divider: Philosophy to Roots */}
      <div className="relative z-10 flex items-center justify-center gap-4 py-6 bg-[#2D0D19]" aria-hidden="true">
        <span className="h-px w-20 sm:w-36 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
        <span className="text-amber-400/80 text-xs tracking-widest uppercase font-serif flex items-center gap-2">
          <span>🌾</span>
          <span className="text-[11px] font-semibold tracking-wider text-amber-300/90">SOIL TO SOUL</span>
          <span>🌾</span>
        </span>
        <span className="h-px w-20 sm:w-36 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
      </div>

      {/* ── 2. FARM ROOTS & INGREDIENT INSPECTOR ── */}
      <FarmStorySection bgClassName="bg-[#2D0D19]" />

      {/* Elegant Heritage Divider: Roots to Kitchen */}
      <div className="relative z-10 flex items-center justify-center gap-4 py-6 bg-[#2D0D19]" aria-hidden="true">
        <span className="h-px w-20 sm:w-36 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
        <span className="text-amber-400/80 text-xs tracking-widest uppercase font-serif flex items-center gap-2">
          <span>📍</span>
          <span className="text-[11px] font-semibold tracking-wider text-amber-300/90">AHMEDABAD KITCHEN</span>
          <span>📍</span>
        </span>
        <span className="h-px w-20 sm:w-36 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
      </div>

      {/* ── 3. SERVING AHMEDABAD & STAY CONNECTED ── */}
      <ServingAhmedabadSection bgClassName="bg-[#2D0D19]" />

      {/* Scallop transition back to warm cream backdrop */}
      <SectionDivider
        variant="scallop"
        fromColor="text-[#2D0D19]"
        toColor="bg-background"
      />

      {/* ── 4. CTA BANNER: Order Today's Tiffin ── */}
      <CtaSection />
    </div>
  )
}
