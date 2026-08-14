import { ChefHat, Clock, Leaf, ShieldCheck } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Reveal } from '@/components/common/reveal'

const REASONS = [
  {
    icon: ChefHat,
    title: 'Cooked fresh, daily',
    description: 'Every thali is prepared the same morning it ships — never pre-cooked.',
  },
  {
    icon: Leaf,
    title: 'Pure homemade taste',
    description: 'Traditional recipes, hand-ground spices, no preservatives or shortcuts.',
  },
  {
    icon: Clock,
    title: 'Reliable delivery slots',
    description: 'Choose lunch or dinner windows that fit your day, every single time.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted by families',
    description: 'Hygienic preparation and consistent quality customers order again for.',
  },
]

export function WhyChooseUsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-10 text-center">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">Why Choose Us</p>
        <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">
          Homemade, without compromise
        </h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {REASONS.map((reason, index) => (
          <Reveal key={reason.title} delay={index * 0.06}>
            <Card className="h-full transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="bg-primary/10 text-primary mb-2 flex size-11 items-center justify-center rounded-xl">
                  <reason.icon className="size-5" aria-hidden />
                </div>
                <CardTitle className="text-base">{reason.title}</CardTitle>
                <CardDescription>{reason.description}</CardDescription>
              </CardHeader>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
