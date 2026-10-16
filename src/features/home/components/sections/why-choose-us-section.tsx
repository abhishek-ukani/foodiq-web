import { Leaf, Home, ShieldCheck, Users } from 'lucide-react'
import { Reveal } from '@/components/common/reveal'

const PILLARS = [
  {
    icon: Leaf,
    title: 'Fresh Ingredients',
    subtitle: 'No Preservatives',
  },
  {
    icon: Home,
    title: 'Home Made',
    subtitle: 'With Love',
  },
  {
    icon: ShieldCheck,
    title: 'Hygienic & Safe',
    subtitle: 'Always',
  },
  {
    icon: Users,
    title: 'For Every Generation',
    subtitle: 'From Kids to Grandparents',
  },
]

export function WhyChooseUsSection() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {PILLARS.map((pillar, index) => {
          const Icon = pillar.icon
          return (
            <Reveal key={pillar.title} delay={index * 0.05}>
              <div className="flex flex-col items-center justify-center text-center p-4 sm:p-5 rounded-3xl border border-border/80 bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                {/* Circular Icon Container */}
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                  <Icon className="size-6" />
                </div>
                <h3 className="font-display text-sm sm:text-base font-bold text-foreground">
                  {pillar.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pillar.subtitle}
                </p>
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
