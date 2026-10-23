import { Home, Soup, Leaf, ShieldCheck, Heart } from 'lucide-react'
import { Reveal } from '@/components/common/reveal'

const PILLARS = [
  {
    icon: Home,
    title: 'Home-style taste',
    description: 'Food inspired by the comfort of home.',
  },
  {
    icon: Soup,
    title: 'Fresh every day',
    description: 'Meals prepared fresh for delivery.',
  },
  {
    icon: Leaf,
    title: 'Quality ingredients',
    description: 'Simple ingredients, carefully prepared.',
  },
  {
    icon: ShieldCheck,
    title: 'Hygienic preparation',
    description: 'Clean preparation and thoughtful packing.',
  },
  {
    icon: Heart,
    title: 'Made with care',
    description: 'Because food should feel personal.',
  },
]

export function WhyFoodIqSection() {
  return (
    <section className="relative overflow-hidden bg-[#2D0D19] py-16 sm:py-24 lg:py-28 text-white">
      {/* Ambient Radial Lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-0 size-96 rounded-full bg-[#52132A]/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-0 size-96 rounded-full bg-black/40 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start max-w-6xl mx-auto">
          {/* ── LEFT COLUMN: Headline & Philosophy ── */}
          <div className="lg:col-span-5 space-y-4">
            <Reveal>
              {/* Decorative flourish */}
              <div className="flex items-center gap-2 text-amber-300/80 mb-2">
                <span className="h-px w-8 bg-amber-400/40" />
                <span className="text-xs">🪔</span>
                <span className="h-px w-8 bg-amber-400/40" />
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#FAF0DC] tracking-tight">
                Why FoodIQ?
              </h2>

              <p className="font-gujarati text-lg sm:text-xl font-medium text-amber-300 mt-2">
                સાદું ભોજન, સાચી કાળજી.
              </p>

              <p className="text-sm sm:text-base text-white/80 font-sans leading-relaxed pt-2 max-w-md">
                Simple food, made the way it&apos;s made at home. Here is what we hold ourselves to, every single day.
              </p>
            </Reveal>
          </div>

          {/* ── RIGHT COLUMN: 5 Core Commitments Grid with Generous Whitespace ── */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-l border-white/10">
              {PILLARS.slice(0, 4).map((pillar, idx) => {
                const Icon = pillar.icon
                return (
                  <div
                    key={idx}
                    className="p-6 sm:p-8 border-r border-b border-white/10 space-y-3"
                  >
                    <div className="size-11 rounded-full border border-amber-300/30 flex items-center justify-center text-amber-300">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl text-[#FAF0DC] font-normal">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70 font-sans leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* 5th Pillar Centered / Spanned cleanly across bottom */}
            <div className="p-6 sm:p-8 border-l border-r border-b border-white/10 flex items-start gap-4">
              <div className="size-11 rounded-full border border-amber-300/30 flex items-center justify-center text-amber-300 shrink-0">
                <Heart className="size-5 text-amber-300" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg sm:text-xl text-[#FAF0DC] font-normal">
                  {PILLARS[4].title}
                </h3>
                <p className="text-xs sm:text-sm text-white/70 font-sans leading-relaxed">
                  {PILLARS[4].description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
