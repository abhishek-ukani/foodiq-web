import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowRight, UtensilsCrossed, Sun, Moon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { AmbientTimingStrip } from '@/features/menu/components/ambient-timing-strip'
import {
  CategoryShowcaseBar,
  getCategoryVisuals,
} from '@/features/menu/components/category-showcase-bar'
import { MobileMenuItemRow } from '@/features/menu/components/mobile-menu-item-row'
import { useCartSummary } from '@/features/cart/hooks/use-cart'
import { CURRENCY_SYMBOL, ROUTES } from '@/constants'
import type { MenuListing } from '@/features/menu/services/menu-service'
import type { MealTimingState } from '@/features/menu/hooks/use-meal-timing'
import type { Tables } from '@/types/database.types'
import { cn } from '@/lib/utils'

type MobileMenuViewProps = {
  listings: MenuListing[]
  categories: Tables<'categories'>[]
  timing: MealTimingState
  isPending: boolean
  onCustomize: (listing: MenuListing) => void
}

export function MobileMenuView({
  listings,
  categories,
  timing,
  isPending,
  onCustomize,
}: MobileMenuViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { itemCount, subtotal } = useCartSummary()

  // Item counts per category
  const itemCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: listings.length,
    }
    for (const cat of categories) {
      counts[cat.id] = listings.filter(
        (l) => l.food_items?.category_id === cat.id || l.food_items?.categories?.slug === cat.slug,
      ).length
    }
    return counts
  }, [listings, categories])

  // Filter & search
  const filteredList = useMemo(() => {
    let items = listings

    if (selectedCategory !== 'all') {
      items = items.filter(
        (l) =>
          l.food_items?.category_id === selectedCategory ||
          l.food_items?.categories?.slug === selectedCategory,
      )
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

  // Group listings dynamically by category for continuous feed
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

    // Sort categories by display_order
    const sortedCategories = [...categories].sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
    )

    for (const cat of sortedCategories) {
      const items = listings.filter(
        (l) => l.food_items?.category_id === cat.id || l.food_items?.categories?.slug === cat.slug,
      )
      if (items.length > 0) {
        items.forEach((item) => handledIds.add(item.id))
        const visuals = getCategoryVisuals(cat)
        const isThali =
          cat.category_type === 'thali' ||
          cat.slug?.includes('thali') ||
          items.some((i) => i.food_items?.kind === 'thali')

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

    // Capture any items that were not mapped to an active category
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
  }, [listings, categories])

  const selectedCategoryObj = useMemo(() => {
    if (selectedCategory === 'all') return null
    return categories.find((c) => c.id === selectedCategory || c.slug === selectedCategory)
  }, [categories, selectedCategory])

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* ── STICKY TOP APP HEADER ── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-100 px-4 pt-2 pb-2 space-y-2">
        {/* 1. Slim Ambient Timing Strip */}
        <AmbientTimingStrip timing={timing} />

        {/* 2. Quick Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for Thalis, Sabjis, Sweets..."
            className="h-9.5 pl-9 pr-3 text-xs bg-neutral-50/90 border-neutral-200/90 rounded-xl placeholder:text-neutral-400 focus-visible:ring-neutral-900"
          />
        </div>

        {/* 3. Visual Circular Category Showcase */}
        <CategoryShowcaseBar
          categories={categories}
          activeCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat)
          }}
          itemCounts={itemCounts}
          isLoading={isPending}
        />
      </div>

      {/* ── CONTENT BODY ── */}
      <div className="px-4 pt-2">
        {isPending ? (
          <div className="space-y-4 pt-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3 py-3 border-b border-neutral-100">
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
          /* ── DYNAMIC SECTIONS CONTINUOUS FEED ── */
          <div className="space-y-8 pt-1">
            {groupedSections.map((sec) => (
              <div key={sec.key}>
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{sec.emoji}</span>
                    <div>
                      <h2 className="text-base font-extrabold text-neutral-900 leading-tight">
                        {sec.name}
                      </h2>
                      {sec.description && (
                        <p className="text-[11px] text-neutral-400">
                          {sec.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Scoped Lunch / Dinner toggle embedded directly in the section */}
                    {sec.isThali && (
                      <div className="flex items-center p-0.5 bg-neutral-100 rounded-lg border text-xs shrink-0">
                        <button
                          type="button"
                          onClick={() => timing.setActiveSlot('lunch')}
                          className={cn(
                            'px-2 py-1 rounded-md font-semibold text-[11px] flex items-center gap-1 transition-all',
                            timing.activeSlot === 'lunch'
                              ? 'bg-white text-neutral-900 shadow-2xs'
                              : 'text-neutral-500 hover:text-neutral-900',
                          )}
                        >
                          <Sun className="size-3 text-amber-500" />
                          <span>Lunch</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => timing.setActiveSlot('dinner')}
                          className={cn(
                            'px-2 py-1 rounded-md font-semibold text-[11px] flex items-center gap-1 transition-all',
                            timing.activeSlot === 'dinner'
                              ? 'bg-white text-neutral-900 shadow-2xs'
                              : 'text-neutral-500 hover:text-neutral-900',
                          )}
                        >
                          <Moon className="size-3 text-indigo-500" />
                          <span>Dinner</span>
                        </button>
                      </div>
                    )}
                    <span className="text-xs text-neutral-400 font-medium">
                      {sec.items.length}
                    </span>
                  </div>
                </div>

                <div>
                  {sec.items.map((item) => (
                    <MobileMenuItemRow
                      key={item.id}
                      listing={item}
                      onCustomize={onCustomize}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── SINGLE CATEGORY OR SEARCH RESULTS ── */
          <div className="pt-2">
            <div className="pb-2 mb-2 flex items-center justify-between border-b border-neutral-100">
              <h2 className="text-sm font-bold text-neutral-800 flex items-center gap-1.5">
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
              <span className="text-xs text-neutral-400">
                {filteredList.length} {filteredList.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            <div>
              {filteredList.map((item) => (
                <MobileMenuItemRow
                  key={item.id}
                  listing={item}
                  onCustomize={onCustomize}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── FLOATING CART SUMMARY BAR ── */}
      {itemCount > 0 && (
        <div className="fixed bottom-3 inset-x-4 z-40 max-w-md mx-auto">
          <Link
            to={ROUTES.cart}
            className="flex items-center justify-between bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white px-4 py-3.5 rounded-2xl shadow-xl transition-all duration-150 border border-emerald-600"
          >
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                {itemCount}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold leading-none">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} added
                </p>
                <p className="text-sm font-extrabold leading-none mt-1">
                  {CURRENCY_SYMBOL}
                  {subtotal}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider bg-white/15 px-3 py-1.5 rounded-xl">
              <span>View Cart</span>
              <ArrowRight className="size-3.5" />
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
