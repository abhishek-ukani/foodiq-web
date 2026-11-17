import { useState, useMemo } from 'react'
import { ArrowRight, UtensilsCrossed, Clock, CalendarOff, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { CategoryShowcaseBar } from '@/features/menu/components/category-showcase-bar'
import { DesktopThaliCard } from '@/features/menu/components/desktop-thali-card'
import { MenuHero } from '@/features/menu/components/menu-hero'
import { type MenuListing } from '@/features/menu/services/menu-service'
import { getClosureNotice, type MealTimingState } from '@/features/menu/hooks/use-meal-timing'
import { useCartSummary } from '@/features/cart/hooks/use-cart'
import { CURRENCY_SYMBOL, ROUTES } from '@/constants'
import type { Tables } from '@/types/database.types'
import { cn } from '@/lib/utils'

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name'

type DesktopMenuViewProps = {
  listings: MenuListing[]
  categories: Tables<'categories'>[]
  timing: MealTimingState
  isPending: boolean
  onCustomize: (listing: MenuListing) => void
  selectedCategory?: string
  onSelectCategory?: (key: string) => void
}

// ── Timing & Slot Switcher for Thalis (Matching Target Design Mock) ───────────
function ThaliSlotSwitcher({ timing }: { timing: MealTimingState }) {
  const lunchSlot = timing.slots.lunch
  const dinnerSlot = timing.slots.dinner
  const isLunchOpen = lunchSlot?.isOpen ?? false
  const isDinnerOpen = dinnerSlot?.isOpen ?? false

  return (
    <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
      {/* Today / Tomorrow pill */}
      <div className="flex items-center p-0.5 bg-neutral-100/90 rounded-full border border-border text-xs">
        <button
          type="button"
          onClick={() => timing.setDate(timing.todayDate)}
          className={cn(
            'px-3.5 py-1.5 rounded-full font-semibold transition-all min-h-[32px] cursor-pointer select-none',
            timing.isToday
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900',
          )}
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => timing.setDate(timing.tomorrowDate)}
          className={cn(
            'px-3.5 py-1.5 rounded-full font-semibold transition-all min-h-[32px] cursor-pointer select-none',
            timing.isTomorrow
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900',
          )}
        >
          Tomorrow
        </button>
      </div>

      {/* Lunch / Dinner pill */}
      <div className="flex items-center p-0.5 bg-neutral-100/90 rounded-full border border-border text-xs">
        <button
          type="button"
          onClick={() => timing.setActiveSlot('lunch')}
          className={cn(
            'px-3.5 py-1.5 rounded-full font-semibold transition-all min-h-[32px] cursor-pointer select-none flex items-center gap-1.5',
            timing.activeSlot === 'lunch'
              ? isLunchOpen
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-neutral-600 text-white shadow-xs'
              : !isLunchOpen
                ? 'text-neutral-400 hover:text-neutral-600 opacity-70'
                : 'text-neutral-600 hover:text-neutral-900',
          )}
        >
          <span>Lunch</span>
          {!isLunchOpen && (
            <span className="text-[10px] font-normal opacity-80">
              ({lunchSlot?.isHolidayClosed ? 'Holiday' : lunchSlot?.isCutoffPassed ? 'Closed' : 'Coming Soon'})
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => timing.setActiveSlot('dinner')}
          className={cn(
            'px-3.5 py-1.5 rounded-full font-semibold transition-all min-h-[32px] cursor-pointer select-none flex items-center gap-1.5',
            timing.activeSlot === 'dinner'
              ? isDinnerOpen
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-neutral-600 text-white shadow-xs'
              : !isDinnerOpen
                ? 'text-neutral-400 hover:text-neutral-600 opacity-70'
                : 'text-neutral-600 hover:text-neutral-900',
          )}
        >
          <span>Dinner</span>
          {!isDinnerOpen && (
            <span className="text-[10px] font-normal opacity-80">
              ({dinnerSlot?.isHolidayClosed ? 'Holiday' : dinnerSlot?.isCutoffPassed ? 'Closed' : 'Coming Soon'})
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

// ── SKELETON LOADER ─────────────────────────────────────────────────────────
function ContentSkeleton() {
  return (
    <div className="space-y-12">
      {[1, 2].map((sec) => (
        <div key={sec} className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#E9E5DA] pb-3">
            <Skeleton className="h-7 w-48 rounded-lg" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="bg-white border border-[#E9E5DA] rounded-2xl overflow-hidden p-3 space-y-3">
                <Skeleton className="aspect-[16/10] w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-full rounded" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-4 w-16 rounded" />
                  <Skeleton className="h-7 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function isThaliCat(cat?: Tables<'categories'> | null): boolean {
  if (!cat) return false
  return (
    cat.category_type === 'thali' ||
    (cat.slug || '').toLowerCase().includes('thali') ||
    cat.name.toLowerCase().includes('thali') ||
    cat.name.toLowerCase().includes('meal')
  )
}

function isThaliItem(listing: MenuListing): boolean {
  return (
    listing.food_items?.kind === 'thali' ||
    listing.food_items?.categories?.category_type === 'thali' ||
    (listing.food_items?.categories?.slug || '').toLowerCase().includes('thali') ||
    (listing.food_items?.categories?.name || '').toLowerCase().includes('thali')
  )
}

// ── Main Component ───────────────────────────────────────────────────────────
export function DesktopMenuView({
  listings,
  categories,
  timing,
  isPending,
  onCustomize,
  selectedCategory: controlledSelectedCategory,
  onSelectCategory: controlledOnSelectCategory,
}: DesktopMenuViewProps) {
  const thaliCat = useMemo(() => {
    return categories.find(
      (c) =>
        c.category_type === 'thali' ||
        (c.slug || '').toLowerCase().includes('thali') ||
        c.name.toLowerCase().includes('thali') ||
        c.name.toLowerCase().includes('meal'),
    )
  }, [categories])

  const defaultCategoryKey = thaliCat ? thaliCat.id : 'thalis'
  const [internalCategory, setInternalCategory] = useState<string>(defaultCategoryKey)
  const selectedCategory = controlledSelectedCategory ?? internalCategory
  const setSelectedCategory = controlledOnSelectCategory ?? setInternalCategory
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('default')
  const { itemCount, subtotal } = useCartSummary()

  // Only display Thalis category
  const availableCategories = useMemo(() => {
    const list = categories.filter((c) => c.is_active !== false && isThaliCat(c))
    if (list.length > 0) return list
    return thaliCat ? [thaliCat] : []
  }, [categories, thaliCat])

  // Filter & sort (Only Thalis)
  const filtered = useMemo(() => {
    let items = listings.filter((l) => isThaliItem(l))

    const query = search.trim().toLowerCase()
    if (query) {
      items = items.filter(
        (l) =>
          l.food_items?.name?.toLowerCase().includes(query) ||
          l.food_items?.description?.toLowerCase().includes(query),
      )
    }

    const priceOf = (l: MenuListing) => l.price_override ?? l.food_items?.price ?? 0
    if (sort === 'price-asc') items = [...items].sort((a, b) => priceOf(a) - priceOf(b))
    if (sort === 'price-desc') items = [...items].sort((a, b) => priceOf(b) - priceOf(a))
    if (sort === 'name') items = [...items].sort((a, b) => a.food_items.name.localeCompare(b.food_items.name))

    return items
  }, [listings, search, sort])

  return (
    <div className="min-h-screen bg-[#FAF8F2]">
      {/* ── 1. HERO BANNER ── */}
      <MenuHero
        searchQuery={search}
        onSearchChange={setSearch}
        timing={timing}
        sort={sort}
        onSortChange={setSort}
      />

      {/* ── 2. CATEGORY PILLS BAR (STICKY) ── */}
      <div className="sticky top-[57px] z-30 bg-[#FAF8F2]/95 backdrop-blur-md border-b border-[#E9E5DA]/80 py-2.5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <CategoryShowcaseBar
            categories={availableCategories}
            activeCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            isLoading={isPending}
          />
        </div>
      </div>

      {/* ── 3. MAIN CONTENT CONTAINER ── */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
        {isPending ? (
          <ContentSkeleton />
        ) : search && filtered.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="No dishes match your search"
            description="Try adjusting your search query."
          />
        ) : (
          /* ── THALIS VIEW ── */
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#E9E5DA]/80 flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-[#17231D] flex items-center gap-2">
                  {search ? (
                    <>Results for &ldquo;{search}&rdquo;</>
                  ) : (
                    <span>Thalis</span>
                  )}
                </h2>
                <p className="text-xs text-[#7A817B] mt-0.5">
                  {filtered.length} {filtered.length === 1 ? 'thali' : 'thalis'} available
                </p>
              </div>

              {!search && <ThaliSlotSwitcher timing={timing} />}
            </div>

            {/* Cutoff / Closure banner when items are present */}
            {(() => {
              if (search || filtered.length === 0) return null
              const notice = getClosureNotice(timing)
              if (!notice) return null
              const isHoliday = notice.type === 'holiday'
              const isCutoff = notice.type === 'cutoff'

              return (
                <div
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-2xl mb-6 text-xs font-medium',
                    isHoliday
                      ? 'bg-red-50 border border-red-200 text-red-950 shadow-xs'
                      : isCutoff
                      ? 'bg-amber-50/80 border border-amber-200 text-amber-900'
                      : 'bg-emerald-50/80 border border-emerald-200/80 text-emerald-950'
                  )}
                >
                  {isHoliday ? (
                    <CalendarOff className="size-4 text-red-600 shrink-0" />
                  ) : isCutoff ? (
                    <Clock className="size-4 text-amber-600 shrink-0" />
                  ) : (
                    <Sparkles className="size-4 text-emerald-600 shrink-0" />
                  )}
                  <span>{notice.message}</span>
                </div>
              )
            })()}

            {/* Grid display or Coming Soon card */}
            {filtered.length === 0 ? (
              <div className="py-12 px-6 text-center bg-amber-50/40 rounded-2xl border border-dashed border-amber-200 my-4">
                <div className="size-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3 text-2xl">
                  {timing.activeHoliday ? '🗓️' : timing.slots[timing.activeSlot]?.isCutoffPassed ? '🔒' : '🍱'}
                </div>
                <h3 className="text-lg font-bold text-[#17231D]">
                  {timing.activeHoliday
                    ? `Closed for ${timing.activeHoliday.title}`
                    : timing.slots[timing.activeSlot]?.isCutoffPassed
                    ? `Ordering closed for ${timing.activeSlot === 'lunch' ? 'Lunch' : 'Dinner'}`
                    : `${timing.isTomorrow ? "Tomorrow's" : "Today's"} ${
                        timing.activeSlot === 'lunch' ? 'Lunch' : 'Dinner'
                      } menu coming soon`}
                </h3>
                <p className="text-xs sm:text-sm text-[#7A817B] max-w-md mx-auto mt-1.5 leading-relaxed">
                  {timing.activeHoliday
                    ? (timing.activeHoliday.message || 'We are closed during this period. Regular orders resume after the holiday.')
                    : timing.slots[timing.activeSlot]?.isCutoffPassed
                    ? timing.activeSlot === 'lunch'
                      ? timing.isDinnerOpen
                        ? "Ordering for Lunch is closed. Tonight's Dinner is available."
                        : "Ordering for Lunch is closed. Pre-orders are open for tomorrow."
                      : "Ordering for Dinner is closed. Pre-orders are open for tomorrow."
                    : `Our kitchen is preparing the menu specials for ${
                        timing.isTomorrow ? 'tomorrow' : 'today'
                      }. Please check back shortly.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {filtered.map((item) => (
                  <DesktopThaliCard
                    key={item.id}
                    listing={item}
                    onCustomize={onCustomize}
                    isHolidayClosed={
                      item.daily_menus?.meal_type
                        ? timing.slots[item.daily_menus.meal_type]?.isHolidayClosed ?? timing.isHolidayClosed
                        : timing.isHolidayClosed
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── 4. FLOATING CART NOTIFICATION BAR ── */}
      {itemCount > 0 && (
        <div className="fixed bottom-6 inset-x-4 z-40 max-w-lg mx-auto pointer-events-auto">
          <Link
            to={ROUTES.checkout}
            className="flex items-center justify-between bg-primary hover:bg-primary/95 active:scale-[0.99] text-primary-foreground px-5 py-3.5 rounded-2xl shadow-[0_10px_30px_rgba(196,85,37,0.35)] transition-all duration-150"
          >
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                {itemCount}
              </div>
              <div>
                <p className="text-xs font-medium text-white/90 leading-none">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
                </p>
                <p className="text-base font-extrabold leading-none mt-1">
                  {CURRENCY_SYMBOL}{subtotal}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold bg-white/20 hover:bg-white/30 px-3.5 py-2 rounded-xl transition-colors">
              <span>Proceed to Checkout</span>
              <ArrowRight className="size-3.5 stroke-[2.5]" />
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
