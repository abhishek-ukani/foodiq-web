import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowRight, UtensilsCrossed, Sun, Moon, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { CategoryShowcaseBar, getCategoryVisuals } from '@/features/menu/components/category-showcase-bar'
import { MobileMenuItemRow } from '@/features/menu/components/mobile-menu-item-row'
import { useCartSummary } from '@/features/cart/hooks/use-cart'
import { CURRENCY_SYMBOL, ROUTES } from '@/constants'
import { isCutoffPassed, type MenuListing } from '@/features/menu/services/menu-service'
import { formatCutoffDisplay, type MealTimingState } from '@/features/menu/hooks/use-meal-timing'
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

// ── Slot switcher (compact for mobile) ───────────────────────────────────────
function MobileSlotSwitcher({ timing }: { timing: MealTimingState }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
      {/* Day switcher */}
      <div className="flex items-center p-0.5 bg-[#f4ede0] rounded-full border border-[#ede4d3] text-[11px]">
        <button
          type="button"
          onClick={() => timing.setDate(timing.todayDate)}
          className={cn(
            'px-2.5 py-1 rounded-full font-semibold transition-all min-h-[28px]',
            timing.isToday
              ? 'bg-white text-[#221b14] shadow-sm'
              : 'text-[#6b5847] hover:text-[#221b14]',
          )}
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => timing.setDate(timing.tomorrowDate)}
          className={cn(
            'px-2.5 py-1 rounded-full font-semibold transition-all min-h-[28px]',
            timing.isTomorrow
              ? 'bg-white text-[#221b14] shadow-sm'
              : 'text-[#6b5847] hover:text-[#221b14]',
          )}
        >
          Tmrw
        </button>
      </div>

      {/* Meal switcher */}
      <div className="flex items-center p-0.5 bg-[#f4ede0] rounded-full border border-[#ede4d3] text-[11px]">
        <button
          type="button"
          onClick={() => timing.setActiveSlot('lunch')}
          className={cn(
            'px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 transition-all min-h-[28px]',
            timing.activeSlot === 'lunch'
              ? 'bg-white text-[#221b14] shadow-sm'
              : 'text-[#6b5847] hover:text-[#221b14]',
          )}
        >
          <Sun className="size-3 text-amber-500" />
          Lunch
        </button>
        <button
          type="button"
          onClick={() => timing.setActiveSlot('dinner')}
          className={cn(
            'px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 transition-all min-h-[28px]',
            timing.activeSlot === 'dinner'
              ? 'bg-white text-[#221b14] shadow-sm'
              : 'text-[#6b5847] hover:text-[#221b14]',
          )}
        >
          <Moon className="size-3 text-indigo-400" />
          Dinner
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
  const [internalCategory, setInternalCategory] = useState<string>('all')
  const selectedCategory = controlledSelectedCategory ?? internalCategory
  const setSelectedCategory = controlledOnSelectCategory ?? setInternalCategory
  const [searchQuery, setSearchQuery] = useState('')
  const { itemCount, subtotal } = useCartSummary()

  // Item counts per category based on currently available listings
  const itemCounts = useMemo(() => {
    const counts: Record<string, number> = { all: listings.length }
    for (const cat of categories) {
      const count = listings.filter(
        (l) =>
          l.food_items?.category_id === cat.id ||
          l.food_items?.categories?.id === cat.id ||
          l.food_items?.categories?.slug === cat.slug,
      ).length
      counts[cat.id] = count
      if (cat.slug) {
        counts[cat.slug] = count
      }
    }
    const uncategorizedCount = listings.filter(
      (l) =>
        !l.food_items?.category_id &&
        !l.food_items?.categories?.id &&
        !l.food_items?.categories?.slug,
    ).length
    if (uncategorizedCount > 0) {
      counts['other'] = uncategorizedCount
    }
    return counts
  }, [listings, categories])

  // Only display categories defined by admin products available that actually have items
  // Always keep Thalis/Meals category active so customers can always view and switch meal slots
  const availableCategories = useMemo(() => {
    return categories.filter((c) => {
      if (c.is_active === false) return false
      const isThaliCategory =
        c.category_type === 'thali' ||
        c.slug === 'thalis' ||
        c.name.toLowerCase().includes('thali') ||
        c.name.toLowerCase().includes('meal')
      if (isThaliCategory) return true
      const count = itemCounts[c.id] ?? (c.slug ? itemCounts[c.slug] : 0) ?? 0
      return count > 0
    })
  }, [categories, itemCounts])

  // Automatically reset category filter if currently selected category has no available items
  useEffect(() => {
    if (selectedCategory !== 'all' && selectedCategory !== 'other') {
      const exists = availableCategories.some(
        (c) => c.id === selectedCategory || c.slug === selectedCategory,
      )
      if (!exists) {
        setSelectedCategory('all')
      }
    } else if (selectedCategory === 'other' && (itemCounts['other'] ?? 0) === 0) {
      setSelectedCategory('all')
    }
  }, [availableCategories, selectedCategory, itemCounts])

  // Filter & search
  const filteredList = useMemo(() => {
    let items = listings

    if (selectedCategory !== 'all') {
      if (selectedCategory === 'other') {
        items = items.filter(
          (l) =>
            !l.food_items?.category_id &&
            !l.food_items?.categories?.id &&
            !l.food_items?.categories?.slug,
        )
      } else {
        items = items.filter(
          (l) =>
            l.food_items?.category_id === selectedCategory ||
            l.food_items?.categories?.id === selectedCategory ||
            l.food_items?.categories?.slug === selectedCategory ||
            l.food_items?.categories?.name?.toLowerCase() === selectedCategory.toLowerCase(),
        )
      }
    }

    const q = searchQuery.trim().toLowerCase()
    if (q) {
      items = items.filter(
        (l) =>
          l.food_items?.name?.toLowerCase().includes(q) ||
          l.food_items?.description?.toLowerCase().includes(q) ||
          l.food_items?.categories?.name?.toLowerCase().includes(q),
      )
    }

    return items
  }, [listings, selectedCategory, searchQuery])

  // Group listings by category for continuous feed
  const groupedSections = useMemo(() => {
    const sections: {
      category: Tables<'categories'> | null
      key: string
      name: string
      description: string | null
      emoji: string
      items: MenuListing[]
      isThali: boolean
    }[] = []

    const handledIds = new Set<string>()
    const sortedCategories = [...availableCategories].sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
    )

    for (const cat of sortedCategories) {
      const items = listings.filter(
        (l) =>
          l.food_items?.category_id === cat.id ||
          l.food_items?.categories?.id === cat.id ||
          l.food_items?.categories?.slug === cat.slug,
      )
      const isThali =
        cat.category_type === 'thali' ||
        cat.slug?.includes('thali') ||
        items.some((i) => i.food_items?.kind === 'thali')

      // Create a section if there are actually items available in this category OR if it's the core Thali category
      if (items.length > 0 || isThali) {
        items.forEach((item) => handledIds.add(item.id))
        const visuals = getCategoryVisuals(cat)
        sections.push({
          category: cat,
          key: cat.id,
          name: cat.name,
          description: cat.description,
          emoji: visuals.emoji,
          items,
          isThali,
        })
      }
    }

    const remainingItems = listings.filter((l) => !handledIds.has(l.id))
    if (remainingItems.length > 0) {
      sections.push({
        category: null,
        key: 'other',
        name: 'Other Dishes',
        description: 'Fresh daily additions',
        emoji: '🍛',
        items: remainingItems,
        isThali: remainingItems.some((i) => i.food_items?.kind === 'thali'),
      })
    }

    return sections
  }, [listings, availableCategories])

  const selectedCategoryObj = useMemo(() => {
    if (selectedCategory === 'all') return null
    return availableCategories.find((c) => c.id === selectedCategory || c.slug === selectedCategory)
  }, [availableCategories, selectedCategory])

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
          itemCounts={itemCounts}
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
        ) : filteredList.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={UtensilsCrossed}
              title={searchQuery ? 'No dishes match your search' : 'No items found'}
              description={
                searchQuery
                  ? `No matches for "${searchQuery}". Try a different search term.`
                  : 'Check back soon as items are updated daily.'
              }
            />
          </div>
        ) : selectedCategory === 'all' && !searchQuery ? (
          /* ── DYNAMIC SECTIONS FEED ── */
          <div className="space-y-8 pt-2">
            {groupedSections.map((sec) => {
              const firstThali = sec.items.find((i) => i.food_items?.kind === 'thali') || sec.items[0]
              const isItemsCutoffPassed = firstThali
                ? isCutoffPassed(firstThali)
                : (timing.activeSlotInfo?.isCutoffPassed ?? false)
              const cutoffTimeStr =
                firstThali?.cutoff_time || firstThali?.daily_menus?.cutoff_time || timing.activeSlotInfo?.cutoffTime
              const formattedCutoff =
                formatCutoffDisplay(cutoffTimeStr) || timing.activeSlotInfo?.formattedCutoff || ''

              return (
                <div key={sec.key}>
                  {/* Section header */}
                  <div className="flex items-start justify-between pb-3 mb-1 border-b border-[#ede4d3]">
                    <div className="flex items-start gap-2">
                      <span className="text-xl leading-none mt-0.5">{sec.emoji}</span>
                      <div>
                        <h2 className="text-sm font-extrabold text-[#221b14] leading-tight">{sec.name}</h2>
                        {sec.description && (
                          <p className="text-[11px] text-[#6b5847] mt-0.5">{sec.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {sec.isThali && <MobileSlotSwitcher timing={timing} />}
                      {sec.items.length > 0 && (
                        <span className="text-xs text-neutral-400 font-medium">{sec.items.length}</span>
                      )}
                    </div>
                  </div>

                  {/* Cutoff or pre-order status notice for thali section */}
                  {sec.isThali && (
                    <>
                      {isItemsCutoffPassed ? (
                        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200/80 rounded-xl mb-3 text-[11px] text-amber-900 font-medium">
                          <Clock className="size-3.5 text-amber-600 shrink-0" />
                          <span>
                            Ordering for {timing.isToday ? "today's" : ''}{' '}
                            {timing.activeSlot === 'lunch' ? 'Lunch' : 'Dinner'} is closed
                            {formattedCutoff ? ` (Cutoff: ${formattedCutoff})` : ''}.
                          </span>
                        </div>
                      ) : !timing.slots[timing.activeSlot]?.isPublished ? (
                        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50/80 border border-amber-200/80 rounded-xl mb-3 text-[11px] text-amber-900 font-medium">
                          <Clock className="size-3.5 text-amber-600 shrink-0" />
                          <span>
                            {timing.isTomorrow
                              ? `Pre-orders open for Tomorrow's ${timing.activeSlot === 'lunch' ? 'Lunch' : 'Dinner'}. Daily specials announced soon.`
                              : `Today's ${timing.activeSlot === 'lunch' ? 'Lunch' : 'Dinner'} specials announced soon. Fixed thalis available.`}
                          </span>
                        </div>
                      ) : null}
                    </>
                  )}

                  {/* Items or empty state */}
                  {sec.items.length === 0 ? (
                    sec.isThali ? (
                      isItemsCutoffPassed ? (
                        <div className="py-8 px-4 text-center bg-white rounded-2xl border border-dashed border-[#ede4d3] my-2">
                          <div className="size-10 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-2 text-base">
                            🔒
                          </div>
                          <h3 className="text-sm font-bold text-neutral-800">
                            Ordering closed for {timing.activeSlot === 'lunch' ? 'Lunch' : 'Dinner'}
                          </h3>
                          <p className="text-[11px] text-neutral-500 max-w-xs mx-auto mt-1 leading-relaxed">
                            The cutoff {formattedCutoff ? `(${formattedCutoff})` : ''} for{' '}
                            {timing.isToday ? "today's" : ''} {timing.activeSlot} has passed.
                          </p>
                        </div>
                      ) : (
                        <div className="py-8 px-4 text-center bg-amber-50/40 rounded-2xl border border-dashed border-amber-200 my-2">
                          <div className="size-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2 text-xl">
                            🍱
                          </div>
                          <h3 className="text-sm font-bold text-[#221b14]">Menu coming soon</h3>
                          <p className="text-[11px] text-neutral-500 max-w-xs mx-auto mt-1 leading-relaxed">
                            {timing.isTomorrow ? "Tomorrow's" : "Today's"}{' '}
                            {timing.activeSlot === 'lunch' ? 'Lunch' : 'Dinner'} menu hasn't been published yet.
                          </p>
                        </div>
                      )
                    ) : (
                      <div className="py-5 text-center bg-white rounded-xl border border-dashed border-[#ede4d3]">
                        <p className="text-xs text-neutral-500 font-medium">No dishes available in this section.</p>
                      </div>
                    )
                  ) : (
                    <div>
                      {sec.items.map((item) => (
                        <MobileMenuItemRow key={item.id} listing={item} onCustomize={onCustomize} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          /* ── SINGLE CATEGORY OR SEARCH RESULTS ── */
          <div className="pt-2">
            <div className="pb-3 mb-1 flex items-start justify-between border-b border-[#ede4d3]">
              <h2 className="text-sm font-bold text-[#221b14] flex items-center gap-1.5">
                {searchQuery ? (
                  <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                ) : selectedCategoryObj ? (
                  <>
                    <span>{getCategoryVisuals(selectedCategoryObj).emoji}</span>
                    <span>{selectedCategoryObj.name}</span>
                  </>
                ) : (
                  'Selected Items'
                )}
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                {!searchQuery &&
                  (selectedCategoryObj?.category_type === 'thali' ||
                    selectedCategoryObj?.slug?.includes('thali')) && (
                    <MobileSlotSwitcher timing={timing} />
                  )}
                <span className="text-xs text-neutral-400 font-medium">{filteredList.length}</span>
              </div>
            </div>

            {/* Cutoff banner for single-category thali */}
            {(() => {
              const isSingleThali =
                !searchQuery &&
                (selectedCategoryObj?.category_type === 'thali' ||
                  selectedCategoryObj?.slug?.includes('thali'))
              const firstThali = filteredList.find((i) => i.food_items?.kind === 'thali') || filteredList[0]
              const isSingleCutoffPassed = firstThali
                ? isCutoffPassed(firstThali)
                : (timing.activeSlotInfo?.isCutoffPassed ?? false)
              const cutoffTimeStr =
                firstThali?.cutoff_time ||
                firstThali?.daily_menus?.cutoff_time ||
                timing.activeSlotInfo?.cutoffTime
              const formattedCutoff =
                formatCutoffDisplay(cutoffTimeStr) || timing.activeSlotInfo?.formattedCutoff || ''

              if (!isSingleThali || filteredList.length === 0) return null
              if (isSingleCutoffPassed) {
                return (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200/80 rounded-xl mb-3 text-[11px] text-amber-900 font-medium">
                    <Clock className="size-3.5 text-amber-600 shrink-0" />
                    <span>
                      Ordering for {timing.isToday ? "today's" : ''}{' '}
                      {timing.activeSlot === 'lunch' ? 'Lunch' : 'Dinner'} is closed
                      {formattedCutoff ? ` (Cutoff: ${formattedCutoff})` : ''}.
                    </span>
                  </div>
                )
              }
              if (!timing.slots[timing.activeSlot]?.isPublished) {
                return (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50/80 border border-amber-200/80 rounded-xl mb-3 text-[11px] text-amber-900 font-medium">
                    <Clock className="size-3.5 text-amber-600 shrink-0" />
                    <span>
                      {timing.isTomorrow
                        ? `Pre-orders open for Tomorrow's ${timing.activeSlot === 'lunch' ? 'Lunch' : 'Dinner'}. Daily specials announced soon.`
                        : `Today's ${timing.activeSlot === 'lunch' ? 'Lunch' : 'Dinner'} specials announced soon.`}
                    </span>
                  </div>
                )
              }
              return null
            })()}

            <div>
              {filteredList.map((item) => (
                <MobileMenuItemRow key={item.id} listing={item} onCustomize={onCustomize} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── FLOATING CART BAR ── */}
      {itemCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 z-40 max-w-md mx-auto">
          <Link
            to={ROUTES.checkout}
            className="flex items-center justify-between bg-[#185834] hover:bg-[#0f4024] active:scale-[0.99] text-white px-4 py-3.5 rounded-2xl shadow-xl transition-all duration-150"
          >
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                {itemCount}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold leading-none opacity-90">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} added
                </p>
                <p className="text-sm font-extrabold leading-none mt-1">
                  {CURRENCY_SYMBOL}{subtotal}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold bg-white/15 px-3 py-1.5 rounded-xl">
              <span>Checkout</span>
              <ArrowRight className="size-3.5" />
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
