import { Star, Quote, Heart } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Reveal } from '@/components/common/reveal'
import { useTestimonials } from '@/features/home/hooks/use-home-queries'

const FALLBACK_TESTIMONIALS = [
  {
    id: 'f1',
    quote:
      'Tastes truly like authentic Kathiyawadi food from home. The dal is light, non-greasy, and the rotlis are super soft. A blessing for our busy workdays!',
    author_name: 'Pooja Patel',
    author_role: 'Regular Daily Subscriber',
    rating: 5,
  },
  {
    id: 'f2',
    quote:
      'We ordered bulk farsan and Gujarati thalis for a family gathering of 25. Everyone praised the fresh khaman and shaak. Highly recommended.',
    author_name: 'Bhavin Shah',
    author_role: 'Weekend Family Customer',
    rating: 5,
  },
  {
    id: 'f3',
    quote:
      'Clean ingredients, no excessive soda or spices, and delivered piping hot every single afternoon. Feels like eating at my mother’s kitchen table.',
    author_name: 'Rohan Mehta',
    author_role: 'Student in Ahmedabad',
    rating: 5,
  },
]

export function TestimonialsSection() {
  const { data: dbTestimonials, isPending } = useTestimonials()

  if (isPending) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-52 rounded-3xl" />
          ))}
        </div>
      </section>
    )
  }

  const testimonials = (dbTestimonials && dbTestimonials.length > 0)
    ? dbTestimonials
    : FALLBACK_TESTIMONIALS

  return (
    <section className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
          <Heart className="size-3.5 text-terracotta fill-terracotta" aria-hidden="true" />
          Customer Love
        </div>
        <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl text-foreground">
          What our families say
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm sm:text-base">
          Real words from people who enjoy our home-cooked meals every week.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.slice(0, 3).map((item, index) => (
          <Reveal key={item.id} delay={index * 0.08}>
            <Card className="relative flex h-full flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
              <Quote className="size-8 text-primary/15 mb-3" />

              <div className="space-y-3 flex-1">
                {item.rating ? (
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={
                          i < (item.rating ?? 5)
                            ? 'size-4 fill-amber-400 text-amber-400'
                            : 'size-4 text-muted'
                        }
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                ) : null}

                <p className="text-sm leading-relaxed text-foreground font-sans">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-5 mt-4 border-t border-border/60">
                <Avatar className="size-10 border border-primary/20 bg-primary/10 text-primary font-bold text-sm">
                  <AvatarImage src={(item as any).author_avatar_url ?? undefined} />
                  <AvatarFallback>{item.author_name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.author_name}</p>
                  {item.author_role ? (
                    <p className="text-xs text-muted-foreground">{item.author_role}</p>
                  ) : null}
                </div>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
