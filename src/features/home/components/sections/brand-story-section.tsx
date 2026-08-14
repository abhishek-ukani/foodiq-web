import { Reveal } from '@/components/common/reveal'

export function BrandStorySection() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 text-center">
      <Reveal>
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">Our Story</p>
        <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">
          Cooked the way your grandmother would
        </h2>
        <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
          FoodIQ began in a home kitchen, with the belief that good food should taste like
          it was made for family — not for a factory line. Every thali is prepared fresh each
          morning using traditional recipes, hand-ground spices, and the same care that goes into
          a home-cooked meal. No shortcuts, no preservatives, no reheated leftovers — just
          homemade food, delivered with the warmth of home.
        </p>
      </Reveal>
    </section>
  )
}
