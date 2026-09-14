import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ROUTES } from '@/constants'
import { cn } from '@/lib/utils'

interface CategoryCardItem {
  id: string
  title: string
  subtitle: string
  to: string
  image: string
}

const CATEGORY_ITEMS: CategoryCardItem[] = [
  {
    id: 'lunch',
    title: 'Lunch Meals',
    subtitle: 'Healthy & Tasty',
    to: `${ROUTES.menu}?meal=lunch`,
    image: '/images/dishes/dish-lunch.png',
  },
  {
    id: 'dinner',
    title: 'Dinner Meals',
    subtitle: 'Light & Wholesome',
    to: `${ROUTES.menu}?meal=dinner`,
    image: '/images/dishes/dish-dinner.png',
  },
  {
    id: 'nasta',
    title: 'Nasta',
    subtitle: 'Freshly Made',
    to: `${ROUTES.menu}?category=farsan`,
    image: '/images/dishes/dish-nasta.png',
  },
  {
    id: 'farsan',
    title: 'Farsan',
    subtitle: 'Crispy & Crunchy',
    to: `${ROUTES.menu}?category=farsan`,
    image: '/images/dishes/dish-farsan.png',
  },
  {
    id: 'bulk',
    title: 'Bulk Order',
    subtitle: 'For Families & Events',
    to: ROUTES.contact,
    image: '/images/dishes/dish-bulk.png',
  },
  {
    id: 'party',
    title: 'Party Order',
    subtitle: 'Special Occasions',
    to: ROUTES.contact,
    image: '/images/dishes/dish-party.png',
  },
]

export function CategoryStrip({ className }: { className?: string }) {
  return (
    <section className={cn('relative mx-auto max-w-6xl px-4 py-4 sm:py-8', className)}>
      {/* 6 Category Tiles with 45-degree angle dishes & smooth spring physics */}
      <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4.5 overflow-x-auto sm:overflow-visible scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 pt-6 sm:pt-7 pb-4">
        {CATEGORY_ITEMS.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05, ease: 'easeOut' }}
            whileHover={{ y: -6, transition: { type: 'spring', stiffness: 350, damping: 18 } }}
            whileTap={{ scale: 0.97 }}
            className="shrink-0 w-36 sm:w-auto"
          >
            <Link
              to={cat.to}
              className="group relative flex h-full flex-col items-center justify-between p-3.5 sm:p-4 rounded-[1.75rem] border border-[#EDE4D3] bg-[#FCF8F2] shadow-[0_4px_16px_-4px_rgba(80,50,20,0.06)] transition-all duration-300 hover:border-primary/45 hover:bg-[#F6EFE4] hover:shadow-[0_14px_28px_-6px_rgba(80,50,20,0.14)] text-center cursor-pointer block select-none"
            >
              {/* Realistic 45-degree Dish Presentation (Front-Above Table View) */}
              <div className="relative w-full h-24 sm:h-28 flex items-center justify-center mb-2.5">
                {/* Soft ground shadow beneath the dish */}
                <div
                  aria-hidden="true"
                  className="absolute bottom-1 w-20 sm:w-24 h-5 sm:h-6 rounded-full bg-amber-950/15 blur-md transition-all duration-300 group-hover:scale-115 group-hover:bg-amber-950/25"
                />

                {/* 45-degree Food Dish with subtle hover elevation */}
                <img
                  src={cat.image}
                  alt={cat.title}
                  loading="lazy"
                  className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 object-contain filter drop-shadow-[0_8px_16px_rgba(70,40,15,0.14)] transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1.5"
                />
              </div>

              {/* Text Container */}
              <div className="w-full">
                <h3 className="font-display text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors leading-tight tracking-tight">
                  {cat.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground/80 mt-1 leading-snug font-sans">
                  {cat.subtitle}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

