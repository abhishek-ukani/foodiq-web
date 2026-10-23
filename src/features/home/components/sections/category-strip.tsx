import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ROUTES } from '@/constants'
import { cn } from '@/lib/utils'

interface CategoryCardItem {
  id: string
  title: string
  gujarati: string
  subtitle: string
  to: string
  image: string
}

const CATEGORY_ITEMS: CategoryCardItem[] = [
  {
    id: 'lunch',
    title: 'Lunch Thali',
    gujarati: 'બપોરનું જમણ',
    subtitle: '12:00 – 2:00 PM',
    to: `${ROUTES.menu}?meal=lunch&category=thalis`,
    image: '/images/dishes/dish-lunch.png',
  },
  {
    id: 'dinner',
    title: 'Dinner Thali',
    gujarati: 'સાંજનું જમણ',
    subtitle: '7:30 – 9:30 PM',
    to: `${ROUTES.menu}?meal=dinner&category=thalis`,
    image: '/images/dishes/dish-dinner.png',
  },
  {
    id: 'nasta',
    title: 'Desi Nasta',
    gujarati: 'ગરમાગરમ નાસ્તો',
    subtitle: 'Poha, Thepla & Handvo',
    to: `${ROUTES.menu}?category=farsan`,
    image: '/images/dishes/dish-nasta.png',
  },
  {
    id: 'farsan',
    title: 'Crisp Farsan',
    gujarati: 'કાઠિયાવાડી ફરસાણ',
    subtitle: 'Dhokla, Gathiya & Samosa',
    to: `${ROUTES.menu}?category=farsan`,
    image: '/images/dishes/dish-farsan.png',
  },
  {
    id: 'bulk',
    title: 'Bulk Catering',
    gujarati: 'મોટા પ્રસંગ ઓર્ડર',
    subtitle: '15 to 150+ Guests',
    to: '/#occasions',
    image: '/images/dishes/dish-bulk.png',
  },
  {
    id: 'party',
    title: 'Pooja & Events',
    gujarati: 'પૂજા અને મેળાવડો',
    subtitle: 'Pure Jain / Swaminarayan',
    to: '/#occasions',
    image: '/images/dishes/dish-party.png',
  },
]

export function CategoryStrip({ className }: { className?: string }) {
  return (
    <section className={cn('relative w-full bg-[#FFFDF9] py-10 sm:py-14 border-y border-[#EDE8DC]/80', className)}>
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-12">
      {/* Category Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary font-sans">
            Curated Offerings
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-0.5">
            What Are You Craving Today?
          </h2>
        </div>
        <Link
          to={ROUTES.menu}
          className="text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 self-start sm:self-auto"
        >
          View Full Menu &rarr;
        </Link>
      </div>

      {/* 6 Category Tiles with 45-degree tabletop food photography */}
      <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 overflow-x-auto sm:overflow-visible scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 pb-2">
        {CATEGORY_ITEMS.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.04, ease: 'easeOut' }}
            whileHover={{ y: -4, transition: { type: 'spring', stiffness: 350, damping: 20 } }}
            whileTap={{ scale: 0.98 }}
            className="shrink-0 w-36 sm:w-auto"
          >
            <Link
              to={cat.to}
              className="group relative flex h-full flex-col items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-border bg-card shadow-xs transition-all duration-200 hover:border-primary/50 hover:shadow-md text-center cursor-pointer block select-none min-h-[170px]"
            >
              {/* Dish Visual Container with Ground Shadow */}
              <div className="relative w-full h-24 sm:h-26 flex items-center justify-center mb-2">
                <div
                  aria-hidden="true"
                  className="absolute bottom-1 w-20 sm:w-22 h-4 sm:h-5 rounded-full bg-amber-950/10 blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-950/20"
                />

                <img
                  src={cat.image}
                  alt={cat.title}
                  loading="lazy"
                  className="relative z-10 size-20 sm:size-22 object-contain filter drop-shadow-[0_6px_12px_rgba(40,20,5,0.12)] transition-transform duration-300 group-hover:scale-108 group-hover:-translate-y-1"
                />
              </div>

              {/* Text Container */}
              <div className="w-full">
                <h3 className="font-display text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                  {cat.title}
                </h3>
                <p className="font-gujarati text-[11px] text-primary/90 font-medium mt-0.5 leading-none">
                  {cat.gujarati}
                </p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 leading-snug font-sans">
                  {cat.subtitle}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      </div>
    </section>
  )
}