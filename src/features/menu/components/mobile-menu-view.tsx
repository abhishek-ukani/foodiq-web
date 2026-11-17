import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowRight, UtensilsCrossed, Sun, Moon, Clock, CalendarOff, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { CategoryShowcaseBar } from '@/features/menu/components/category-showcase-bar'
import { MobileMenuItemRow } from '@/features/menu/components/mobile-menu-item-row'
import { useCartSummary } from '@/features/cart/hooks/use-cart'
import { CURRENCY_SYMBOL, ROUTES } from '@/constants'
import { type MenuListing } from '@/features/menu/services/menu-service'
import { getClosureNotice, type MealTimingState } from '@/features/menu/hooks/use-meal-timing'
import type { Tables } from '@/types/database.types'
import { cn } from '@/lib/utils'

type MobileMenuViewProps = {
  listings: MenuListing[]
  categories: Tables<'categories'>[]
  timing: MealTimingState
  isPending: boolean
  onCustomize: (listing: MenuListing) => void
  selectedCategory?: string
  onSelectCategory?: (key: string) => void
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

// ── Slot switcher (compact for mobile) ───────────────────────────────────────
function MobileSlotSwitcher({ timing }: { timing: MealTimingState }) {
  const lunchSlot = timing.slots.lunch
  const dinnerSlot = timing.slots.dinner
  const isLunchOpen = lunchSlot?.isOpen ?? false
  const isDinnerOpen = dinnerSlot?.isOpen ?? false

  return (
    <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
      {/* Day switcher */}
      <div className="flex items-center p-0.5 bg-muted/80 rounded-full border border-border text-[11px]">
        <button
          type="button"
          onClick={() => timing.setDate(timing.todayDate)}
          className={cn(
            'px-2.5 py-1 rounded-full font-semibold transition-all min-h-[44px] flex items-center justify-center cursor-pointer',
            timing.isToday
              ? 'bg-card text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => timing.setDate(timing.tomorrowDate)}
          className={cn(
            'px-2.5 py-1 rounded-full font-semibold transition-all min-h-[44px] flex items-center justify-center cursor-pointer',
            timing.isTomorrow
              ? 'bg-card text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Tmrw
        </button>
      </div>

      {/* Meal switcher */}
      <div className="flex items-center p-0.5 bg-muted/80 rounded-full border border-border text-[11px]">
        <button
          type="button"
          onClick={() => timing.setActiveSlot('lunch')}
          className={cn(
            'px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 transition-all min-h-[44px] cursor-pointer',
            timing.activeSlot === 'lunch'
              ? isLunchOpen
                ? 'bg-card text-foreground shadow-xs'
                : 'bg-neutral-600 text-white shadow-xs'
              : !isLunchOpen
                ? 'text-muted-foreground/60 hover:text-foreground opacity-60'
                : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Sun className="size-3 text-secondary" />
          <span>Lunch</span>
          {!isLunchOpen && (
            <span className="text-[9px] font-normal opacity-70">
              ({lunchSlot?.isHolidayClosed ? 'Holiday' : lunchSlot?.isCutoffPassed ? 'Closed' : 'Coming Soon'})
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => timing.setActiveSlot('dinner')}
          className={cn(
            'px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 transition-all min-h-[44px] cursor-pointer',
            timing.activeSlot === 'dinner'
              ? isDinnerOpen
                ? 'bg-card text-foreground shadow-xs'
                : 'bg-neutral-600 text-white shadow-xs'
              : !isDinnerOpen
                ? 'text-muted-foreground/60 hover:text-foreground opacity-60'
                : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Moon className="size-3 text-indigo-400" />
          <span>Dinner</span>
          {!isDinnerOpen && (
            <span className="text-[9px] font-normal opacity-70">
              ({dinnerSlot?.isHolidayClosed ? 'Holiday' : dinnerSlot?.isCutoffPassed ? 'Closed' : 'Coming Soon'})
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

export function MobileMenuView({
  listings,
  categories,
  timing,
  isPending,
  onCustomize,
  selectedCategory: controlledSelectedCategory,
  onSelectCategory: controlledOnSelectCategory,
}: MobileMenuViewProps) {
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
  const [searchQuery, setSearchQuery] = useState('')
  const { itemCount, subtotal } = useCartSummary()

  // Only display Thalis category
  const availableCategories = useMemo(() => {
    const list = categories.filter((c) => c.is_active !== false && isThaliCat(c))
    if (list.length > 0) return list
    return thaliCat ? [thaliCat] : []
  }, [categories, thaliCat])

  // Filter & search (Only Thalis)
  const filteredList = useMemo(() => {
    let items = listings.filter((l) => isThaliItem(l))

    const q = searchQuery.trim().toLowerCase()
    if (q) {
      items = items.filter(
        (l) =>
          l.food_items?.name?.toLowerCase().includes(q) ||
          l.food_items?.description?.toLowerCase().includes(q),
      )
    }

    return items
  }, [listings, searchQuery])

  return (
    <div className="min-h-screen bg-[#faf6ee] pb-28">
      {/* ── MOBILE COMPACT HERO BANNER ── */}
      <div className="bg-[#faf6ee] border-b border-[#ede4d3] px-4 pt-5 pb-4">
        <p className="text-[11px] font-semibold text-[#2a7349] uppercase tracking-[0.12em] mb-1.5">
          Fresh • Homely • Gujarati
        </p>
        <h1 className="font-display text-2xl font-bold text-[#221b14] leading-tight mb-3">
          Ghar jaisa swaad, <em className="not-italic text-[#185834]">roz fresh.</em>
        </h1>
      </div>

      {/* ── STICKY SEARCH + CATEGORY HEADER ── */}
      <div className="sticky top-[57px] z-30 bg-[#faf6ee]/97 backdrop-blur-md border-b border-[#ede4d3] px-4 pt-3 pb-3 space-y-2.5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search thalis, sabjis, sweets..."
            className="h-10 pl-10 pr-3 text-sm bg-white border-[#ede4d3] rounded-xl placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-[#185834]"
          />
        </div>

        {/* Category pills */}
        <CategoryShowcaseBar
          categories={availableCategories}
          activeCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          isLoading={isPending}
        />
      </div>

      {/* ── CONTENT BODY ── */}
      <div className="px-4 pt-3">
        {isPending ? (
          /* Loading skeleton */
          <div className="space-y-4 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3 py-3.5 border-b border-[#ede4d3]">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/3 rounded" />
                  <Skeleton className="h-3 w-full rounded" />
                </div>
                <Skeleton className="size-24 rounded-2xl shrink-0" />
              </div>
            ))}
          </div>
        ) : searchQuery && filteredList.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={UtensilsCrossed}
              title="No dishes match your search"
              description={`No matches for "${searchQuery}". Try a different search term.`}
            />
          </div>
        ) : (
          /* ── THALIS VIEW ── */
          <div className="pt-2">
            <div className="pb-3 mb-1 flex items-start justify-between border-b border-[#ede4d3]">
              <h2 className="text-sm font-bold text-[#221b14] flex items-center gap-1.5">
                {searchQuery ? (
                  <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                ) : (
                  <>
                    <span>🍱</span>
                    <span>Thalis</span>
                  </>
                )}
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                {!searchQuery && <MobileSlotSwitcher timing={timing} />}
                <span className="text-xs text-neutral-400 font-medium">{filteredList.length}</span>
              </div>
            </div>

            {/* Cutoff / Closure banner when items are present (e.g. Lunch closed but showing items) */}
            {(() => {
              if (searchQuery || filteredList.length === 0) return null
              const notice = getClosureNotice(timing)
              if (!notice) return null
              const isHoliday = notice.type === 'holiday'
              const isCutoff = notice.type === 'cutoff'

              return (
                <div
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl mb-3 text-[11px] font-medium',
                    isHoliday
                      ? 'bg-red-50 border border-red-200 text-red-950 shadow-xs'
                      : isCutoff
                      ? 'bg-amber-50 border border-amber-200 text-amber-900'
                      : 'bg-emerald-50/80 border border-emerald-200/80 text-emerald-950'
                  )}
                >
                  {isHoliday ? (
                    <CalendarOff className="size-3.5 text-red-600 shrink-0" />
                  ) : isCutoff ? (
                    <Clock className="size-3.5 text-amber-600 shrink-0" />
                  ) : (
                    <Sparkles className="size-3.5 text-emerald-600 shrink-0" />
                  )}
                  <span>{notice.message}</span>
                </div>
              )
            })()}

            {/* Items or Coming Soon card */}
            {filteredList.length === 0 ? (
              <div className="py-8 px-4 text-center bg-amber-50/40 rounded-2xl border border-dashed border-amber-200 my-3">
                <div className="size-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2.5 text-2xl">
                  {timing.activeHoliday ? '🗓️' : timing.slots[timing.activeSlot]?.isCutoffPassed ? '🔒' : '🍱'}
                </div>
                <h3 className="text-base font-bold text-[#221b14]">
                  {timing.activeHoliday
                    ? `Closed for ${timing.activeHoliday.title}`
                    : timing.slots[timing.activeSlot]?.isCutoffPassed
                    ? `Ordering closed for ${timing.activeSlot === 'lunch' ? 'Lunch' : 'Dinner'}`
                    : `${timing.isTomorrow ? "Tomorrow's" : "Today's"} ${
                        timing.activeSlot === 'lunch' ? 'Lunch' : 'Dinner'
                      } menu coming soon`}
                </h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1 leading-relaxed">
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
              <div>
                {filteredList.map((item) => (
                  <MobileMenuItemRow
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
      </div>

      {/* ── FLOATING CART BAR ── */}
      {itemCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 z-40 max-w-md mx-auto pb-safe">
          <Link
            to={ROUTES.checkout}
            className="flex items-center justify-between bg-primary hover:bg-primary/90 active:scale-[0.99] text-primary-foreground px-4 py-3.5 rounded-2xl shadow-xl transition-all duration-150 min-h-[52px]"
          >
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                {itemCount}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold leading-none opacity-90">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} added
                </p>
                <p className="font-display text-sm font-extrabold leading-none mt-1">
                  {CURRENCY_SYMBOL}{subtotal}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold bg-white/20 px-3.5 py-1.5 rounded-xl">
              <span>Checkout</span>
              <ArrowRight className="size-3.5" />
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
