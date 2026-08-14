import { ClipboardList, CookingPot, ShoppingBag, Truck } from 'lucide-react'
import { Reveal } from '@/components/common/reveal'

const STEPS = [
  { icon: ShoppingBag, title: 'Browse the menu', description: "Pick today's dishes or a fixed thali." },
  { icon: ClipboardList, title: 'Place your order', description: 'Choose a delivery slot and address.' },
  { icon: CookingPot, title: 'We cook it fresh', description: 'Prepared the same day, never in advance.' },
  { icon: Truck, title: 'Delivered to you', description: 'Track your order right to your doorstep.' },
]

export function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-10 text-center">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">How It Works</p>
        <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">
          From our kitchen to your table
        </h2>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <Reveal key={step.title} delay={index * 0.08} className="relative text-center">
            <div className="bg-primary text-primary-foreground mx-auto flex size-14 items-center justify-center rounded-full">
              <step.icon className="size-6" aria-hidden />
            </div>
            <span className="text-muted-foreground/70 absolute top-0 right-1/2 translate-x-10 font-mono text-xs">
              {String(index + 1).padStart(2, '0')}
            </span>
            <p className="mt-4 font-medium">{step.title}</p>
            <p className="text-muted-foreground mt-1 text-sm">{step.description}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
