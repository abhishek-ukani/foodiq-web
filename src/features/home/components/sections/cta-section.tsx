import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/common/reveal'
import { useAuth } from '@/hooks/use-auth'
import { ROUTES } from '@/constants'

export function CtaSection() {
  const { isAuthenticated } = useAuth()

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <Reveal>
        <div className="bg-primary text-primary-foreground relative overflow-hidden rounded-3xl px-8 py-14 text-center sm:px-16">
          <div
            aria-hidden
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'radial-gradient(circle at 15% 30%, white 0, transparent 40%), radial-gradient(circle at 85% 70%, white 0, transparent 35%)',
            }}
          />
          <div className="relative z-10 space-y-5">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              Ready to taste homemade goodness?
            </h2>
            <p className="text-primary-foreground/80 mx-auto max-w-lg">
              Join hundreds of families who&apos;ve made FoodIQ part of their daily routine.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to={isAuthenticated ? ROUTES.profile : ROUTES.register}>
                {isAuthenticated ? 'Go to my account' : 'Get started today'}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
