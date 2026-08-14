import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useBanners } from '@/features/home/hooks/use-home-queries'
import { ROUTES } from '@/constants'

export function HeroSection() {
  const { data: banners, isPending } = useBanners('hero')
  const banner = banners?.[0]
  const hasImage = Boolean(banner?.image_url)

  if (isPending) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <Skeleton className="h-6 w-40 rounded-full" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-16 w-3/4 rounded-xl" />
            <Skeleton className="h-11 w-48 rounded-xl" />
          </div>
          <Skeleton className="aspect-square w-full rounded-3xl" />
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 20%, var(--brand-light-green) 0, transparent 35%), radial-gradient(circle at 85% 60%, var(--brand-golden) 0, transparent 30%)',
        }}
      />
      <div
        className={`mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:py-24 ${
          hasImage ? 'lg:grid-cols-2 lg:items-center' : ''
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <span className="bg-accent text-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
            <Star className="size-3.5 fill-current" aria-hidden />
            Rated 4.8 by homemade-food lovers
          </span>
          <h1 className="font-display text-balance text-4xl leading-[1.1] font-semibold sm:text-5xl lg:text-6xl">
            {banner?.title ?? (
              <>
                Homemade tiffin, <span className="text-primary">delivered fresh</span> every day
              </>
            )}
          </h1>
          <p className="text-muted-foreground max-w-lg text-lg">
            {banner?.subtitle ??
              'Traditional Gujarati, Punjabi and Kathiyawadi thalis cooked fresh each morning — ordered in a couple of taps, delivered warm to your door.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link to={banner?.cta_url ?? ROUTES.register}>
                {banner?.cta_label ?? 'Order your first tiffin'}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to={ROUTES.about}>Our story</Link>
            </Button>
          </div>
        </motion.div>

        {hasImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <div className="from-primary/15 to-brand-golden/15 border-border/60 aspect-square rounded-3xl border bg-gradient-to-br p-2 shadow-xl">
              <img
                src={banner!.image_url}
                alt={banner?.title ?? 'FoodIQ tiffin'}
                className="size-full rounded-[1.4rem] object-cover"
              />
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
