import { useState, useMemo, useEffect } from 'react'
import { ArrowRight, UtensilsCrossed, Clock, CalendarOff, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import {
  CategoryShowcaseBar,
  getCategoryVisuals,
} from '@/features/menu/components/category-showcase-bar'
import { MenuProductCard } from '@/features/menu/components/menu-product-card'
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
      <div className="flex items-center p-0.5 bg-neutral-100/90 rounded-full border border-[#E9E5DA] text-xs">
        <button
          type="button"
          onClick={() => timing.setDate(timing.todayDate)}
          className={cn(
            'px-3.5 py-1 rounded-full font-semibold transition-all min-h-[30px] cursor-pointer select-none',
            timing.isToday
              ? 'bg-[#185834] text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900',
          )}
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => timing.setDate(timing.tomorrowDate)}
          className={cn(
            'px-3.5 py-1 rounded-full font-semibold transition-all min-h-[30px] cursor-pointer select-none',
            timing.isTomorrow
              ? 'bg-[#185834] text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900',
          )}
        >
          Tomorrow
        </button>
      </div>

      {/* Lunch / Dinner pill */}
      <div className="flex items-center p-0.5 bg-neutral-100/90 rounded-full border border-[#E9E5DA] text-xs">
        <button
          type="button"
          onClick={() => timing.setActiveSlot('lunch')}
          className={cn(
            'px-3.5 py-1 rounded-full font-semibold transition-all min-h-[30px] cursor-pointer select-none flex items-center gap-1.5',
            timing.activeSlot === 'lunch'
              ? isLunchOpen
                ? 'bg-[#185834] text-white shadow-xs'
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
            'px-3.5 py-1 rounded-full font-semibold transition-all min-h-[30px] cursor-pointer select-none flex items-center gap-1.5',
            timing.activeSlot === 'dinner'
              ? isDinnerOpen
                ? 'bg-[#185834] text-white shadow-xs'
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
  const [internalCategory, setInternalCategory] = useState<string>('all')
  const selectedCategory = controlledSelectedCategory ?? internalCategory
  const setSelectedCategory = controlledOnSelectCategory ?? setInternalCategory
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('default')
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

  // Filter & sort
  const filtered = useMemo(() => {
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

    const query = search.trim().toLowerCase()
    if (query) {
      items = items.filter(
        (l) =>
          l.food_items?.name?.toLowerCase().includes(query) ||
          l.food_items?.description?.toLowerCase().includes(query) ||
          l.food_items?.categories?.name?.toLowerCase().includes(query),
      )
    }

    const priceOf = (l: MenuListing) => l.price_override ?? l.food_items?.price ?? 0
    if (sort === 'price-asc') items = [...items].sort((a, b) => priceOf(a) - priceOf(b))
    if (sort === 'price-desc') items = [...items].sort((a, b) => priceOf(b) - priceOf(a))
    if (sort === 'name') items = [...items].sort((a, b) => a.food_items.name.localeCompare(b.food_items.name))

    return items
  }, [listings, selectedCategory, search, sort])

  // Grouped sections for the "all" view (Farsan first, then Thalis, matching the target mock)
  const groupedSections = useMemo(() => {
    const sections: {
      category: Tables<'categories'> | null
      key: string
      name: string
      subtitle: string
      image: string | null
      emoji: string
      items: MenuListing[]
      isThali: boolean
    }[] = []

    const handledIds = new Set<string>()

    // Priority ordering: Farsan first, then Thalis, then others
    const getSortPriority = (nameOrSlug: string) => {
      const s = nameOrSlug.toLowerCase()
      if (s.includes('farsan') || s.includes('snack')) return 1
      if (s.includes('thali')) return 2
      if (s.includes('sabji') || s.includes('shabji')) return 3
      if (s.includes('bread') || s.includes('rotli')) return 4
      if (s.includes('sweet')) return 5
      if (s.includes('beverage')) return 6
      return 10
    }

    const sortedCategories = [...availableCategories].sort(
      (a, b) => getSortPriority(a.slug || a.name) - getSortPriority(b.slug || b.name),
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

        let subtitle = cat.description || ''
        const nameLower = cat.name.toLowerCase()
        if (nameLower.includes('farsan')) {
          subtitle = 'Crispy, tasty and perfect for your cravings'
        } else if (isThali) {
          subtitle = 'Delicious & Authentic Fixed Gujarati Thalis'
        } else if (nameLower.includes('sabji') || nameLower.includes('shabji')) {
          subtitle = 'Homestyle authentic Kathiyawadi & Gujarati curries'
        } else if (nameLower.includes('rotli') || nameLower.includes('bread')) {
          subtitle = 'Soft hot phulkas, parathas & desi bhakhri'
        } else if (nameLower.includes('sweet')) {
          subtitle = 'Rich, traditional Gujarati sweets and mithais'
        } else if (nameLower.includes('beverage')) {
          subtitle = 'Chilled spiced masala chhas and refreshing drinks'
        }

        sections.push({
          category: cat,
          key: cat.id,
          name: cat.name,
          subtitle,
          image: cat.image_url || null,
          emoji: getCategoryVisuals(cat).emoji,
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
        subtitle: 'Fresh daily additions',
        image: null,
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
            itemCounts={itemCounts}
            isLoading={isPending}
          />
        </div>
      </div>

      {/* ── 3. MAIN CONTENT CONTAINER ── */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
        {isPending ? (
          <ContentSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title={search ? 'No dishes match your search' : 'No items found in this section'}
            description="Try selecting a different category or adjusting your search."
          />
        ) : selectedCategory === 'all' && !search ? (
          /* ── DYNAMIC SECTIONS FEED (Target Design Mock: Farsan 4-col Grid, Thalis 2-col Grid) ── */
          <div className="space-y-12 sm:space-y-14">
            {groupedSections.map((sec) => {
              return (
                <section key={sec.key} aria-labelledby={`section-${sec.key}`} className="scroll-mt-32">
                  {/* ── SECTION HEADER ── */}
                  <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                    {/* Left: Category Icon + Title + Subtitle */}
                    <div className="flex items-center gap-3">
                      {sec.image ? (
                        <div className="size-9 rounded-full overflow-hidden border border-[#E9E5DA] shadow-2xs shrink-0">
                          <img
                            src={sec.image}
                            alt={sec.name}
                            loading="lazy"
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                      ) : (
                        <div className="size-9 rounded-full bg-white border border-[#E9E5DA] shadow-2xs shrink-0 flex items-center justify-center text-lg leading-none">
                          {sec.emoji}
                        </div>
                      )}
                      <div>
                        <h2 className="text-xl font-bold text-[#17231D] leading-tight">
                          {sec.name}
                        </h2>
                        {sec.subtitle && (
                          <p className="text-xs text-[#7A817B] mt-0.5">{sec.subtitle}</p>
                        )}
                      </div>
                    </div>

                    {/* Right: Controls & "View all" Link */}
                    <div className="flex items-center gap-4 shrink-0">
                      {sec.isThali && <ThaliSlotSwitcher timing={timing} />}

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#7A817B]">
                          {sec.items.length} {sec.items.length === 1 ? 'item' : 'items'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedCategory(sec.category?.id ?? sec.key)}
                          className="flex items-center gap-1 text-xs text-[#087443] font-semibold hover:underline cursor-pointer"
                        >
                          <span>View all</span>
                          <ArrowRight className="size-3 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notice banner for thali section */}
                  {sec.isThali && (() => {
                    const notice = getClosureNotice(timing)
                    if (!notice) return null
                    const isHoliday = notice.type === 'holiday'
                    const isCutoff = notice.type === 'cutoff'

                    return (
                      <div
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-2xl mb-5 text-xs font-medium',
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

                  {/* ── ITEMS DISPLAY ── */}
                  {sec.items.length === 0 ? (
                    sec.isThali ? (
                      <div className="py-10 text-center bg-amber-50/40 rounded-2xl border border-dashed border-amber-200">
                        <div className="size-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2 text-2xl">
                          {timing.activeHoliday ? '🗓️' : timing.slots[timing.activeSlot]?.isCutoffPassed ? '🔒' : '🍱'}
                        </div>
                        <h3 className="text-base font-bold text-[#17231D]">
                          {timing.activeHoliday
                            ? `Closed for ${timing.activeHoliday.title}`
                            : timing.slots[timing.activeSlot]?.isCutoffPassed
                            ? `Ordering closed for ${timing.activeSlot === 'lunch' ? 'Lunch' : 'Dinner'}`
                            : `${timing.isTomorrow ? "Tomorrow's" : "Today's"} ${
                                timing.activeSlot === 'lunch' ? 'Lunch' : 'Dinner'
                              } menu coming soon`}
                        </h3>
                        <p className="text-xs text-[#7A817B] max-w-sm mx-auto mt-1 leading-relaxed">
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
                      <div className="py-10 text-center bg-white rounded-2xl border border-dashed border-[#E9E5DA]">
                        <p className="text-sm text-[#7A817B] font-medium">No dishes currently available in this section.</p>
                      </div>
                    )
                  ) : sec.isThali ? (
                    /* ── THALIS: 2-Column Wide Horizontal Cards (Target Design Mock) ── */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {sec.items.map((item) => (
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
                  ) : (
                    /* ── FARSAN / REGULAR: 4-Column Vertical Product Cards (Target Design Mock) ── */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {sec.items.map((item) => (
                        <MenuProductCard
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
                </section>
              )
            })}
          </div>
        ) : (
          /* ── SINGLE CATEGORY OR SEARCH RESULTS VIEW ── */
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#E9E5DA]/80 flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-[#17231D] flex items-center gap-2">
                  {search ? (
                    <>Results for &ldquo;{search}&rdquo;</>
                  ) : selectedCategoryObj ? (
                    <span>{selectedCategoryObj.name}</span>
                  ) : (
                    'Selected Dishes'
                  )}
                </h2>
                <p className="text-xs text-[#7A817B] mt-0.5">
                  {filtered.length} {filtered.length === 1 ? 'item' : 'items'} available
                </p>
              </div>

              {!search &&
                (selectedCategoryObj?.category_type === 'thali' ||
                  selectedCategoryObj?.slug?.includes('thali')) && (
                  <ThaliSlotSwitcher timing={timing} />
                )}
            </div>

            {/* Cutoff / Closure / Coming Soon notice */}
            {(() => {
              const isSingleThali =
                !search &&
                (selectedCategoryObj?.category_type === 'thali' ||
                  selectedCategoryObj?.slug?.includes('thali'))

              if (!isSingleThali) return null
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

            {/* Grid display */}
            {selectedCategoryObj?.category_type === 'thali' ||
            selectedCategoryObj?.slug?.includes('thali') ||
            filtered.every((i) => i.food_items?.kind === 'thali') ? (
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {filtered.map((item) => (
                  <MenuProductCard
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
            className="flex items-center justify-between bg-[#087443] hover:bg-[#065b34] active:scale-[0.99] text-white px-5 py-3.5 rounded-2xl shadow-[0_10px_30px_rgba(8,116,67,0.35)] transition-all duration-150"
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
