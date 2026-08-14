import { ChefHat, Heart, Leaf, Users } from 'lucide-react'
import { Reveal } from '@/components/common/reveal'
import { usePolicy } from '@/features/static-pages/hooks/use-content-queries'

const VALUES = [
  { icon: Heart, title: 'Made with care', description: 'Every dish gets the same attention as a home-cooked family meal.' },
  { icon: Leaf, title: 'Always fresh', description: 'Nothing is prepared in advance or frozen — cooked the morning it ships.' },
  { icon: Users, title: 'Community first', description: 'We grew through word of mouth from families who trust our kitchen.' },
]

export function AboutPage() {
  const { data: policy } = usePolicy('about')

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <Reveal>
        <div className="text-center">
          <div className="bg-primary text-primary-foreground mx-auto flex size-14 items-center justify-center rounded-2xl">
            <ChefHat className="size-7" aria-hidden />
          </div>
          <h1 className="font-display mt-6 text-4xl font-semibold sm:text-5xl">About FoodIQ</h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
            A home kitchen turned daily tiffin service, built on one simple idea: food should taste
            like someone made it just for you.
          </p>
        </div>
      </Reveal>

      <div className="my-16 grid gap-6 sm:grid-cols-3">
        {VALUES.map((value, index) => (
          <Reveal key={value.title} delay={index * 0.08} className="text-center">
            <div className="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-xl">
              <value.icon className="size-5" aria-hidden />
            </div>
            <p className="mt-4 font-medium">{value.title}</p>
            <p className="text-muted-foreground mt-1 text-sm">{value.description}</p>
          </Reveal>
        ))}
      </div>

      {policy?.content ? (
        <article className="prose prose-neutral dark:prose-invert mx-auto max-w-none whitespace-pre-line">
          {policy.content}
        </article>
      ) : null}
    </div>
  )
}
