import { Star } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Reveal } from '@/components/common/reveal'
import { useTestimonials } from '@/features/home/hooks/use-home-queries'

export function TestimonialsSection() {
  const { data: testimonials, isPending } = useTestimonials()

  if (isPending) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </section>
    )
  }

  // Social proof is supplementary — an empty section here just doesn't render,
  // rather than showing customers a hollow "no reviews yet" box.
  if (!testimonials?.length) return null

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-10 text-center">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">Testimonials</p>
        <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">
          Loved by our customers
        </h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <Reveal key={testimonial.id} delay={index * 0.06}>
            <Card className="h-full">
              <CardContent className="space-y-4 pt-6">
                {testimonial.rating ? (
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={
                          i < testimonial.rating!
                            ? 'size-4 fill-current text-amber-500'
                            : 'text-muted size-4'
                        }
                        aria-hidden
                      />
                    ))}
                  </div>
                ) : null}
                <p className="text-sm leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-2">
                  <Avatar>
                    <AvatarImage src={testimonial.author_avatar_url ?? undefined} />
                    <AvatarFallback>{testimonial.author_name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{testimonial.author_name}</p>
                    {testimonial.author_role ? (
                      <p className="text-muted-foreground text-xs">{testimonial.author_role}</p>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
