import { CookingPot, Flame, Sparkles, Truck } from 'lucide-react'
import { Reveal } from '@/components/common/reveal'

const STEPS = [
  {
    step: '01',
    time: '6:30 AM',
    title: 'Hand-Ground & Chopped Fresh',
    description: 'Whole spices ground by hand and farm-fresh vegetables chopped every morning. No frozen stock.',
    icon: Sparkles,
    tag: 'Farm Ingredients',
  },
  {
    step: '02',
    time: '9:00 AM',
    title: 'Cooked in Small Home Batches',
    description: 'Slow-simmered Gujarati dals, tawa-roasted rotlis, and crispy nasta prepared with traditional care.',
    icon: CookingPot,
    tag: 'No Preservatives',
  },
  {
    step: '03',
    time: '12:00 PM',
    title: 'Delivered Warm & Steaming',
    description: 'Sealed neatly in eco-friendly tiffins and brought directly to your home or office right on time.',
    icon: Truck,
    tag: 'Doorstep Delivery',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
      {/* Section Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
          <Flame className="size-3.5 text-terracotta" aria-hidden="true" />
          The Home Kitchen Story
        </div>
        <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl text-foreground">
          From our stove to your table
        </h2>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto text-sm sm:text-base">
          Food that feels, smells, and tastes like home. Here is our daily rhythm.
        </p>
      </div>

      {/* 3 Step Visual Story */}
      <div className="grid gap-6 sm:grid-cols-3 relative">
        {STEPS.map((item, index) => {
          const Icon = item.icon
          return (
            <Reveal key={item.step} delay={index * 0.1}>
              <div className="group relative flex h-full flex-col rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
                {/* Top Row: Number & Time */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display text-3xl font-extrabold text-primary/30 group-hover:text-primary transition-colors">
                    {item.step}
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    {item.time}
                  </span>
                </div>

                {/* Icon in Circular Badge */}
                <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Icon className="size-6" />
                </div>

                {/* Title & Description */}
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {item.description}
                </p>

                {/* Bottom Tag */}
                <div className="mt-auto pt-3 border-t border-border/60">
                  <span className="text-[11px] font-semibold text-terracotta tracking-wide uppercase">
                    &bull; {item.tag}
                  </span>
                </div>
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
