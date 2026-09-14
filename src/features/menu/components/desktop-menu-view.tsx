import { useState, useMemo } from 'react'
import { Search, UtensilsCrossed, Sun, Moon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState } from '@/components/common/empty-state'
import { AmbientTimingStrip } from '@/features/menu/components/ambient-timing-strip'
import {
  CategoryShowcaseBar,
  getCategoryVisuals,
} from '@/features/menu/components/category-showcase-bar'
import { MobileMenuItemRow } from '@/features/menu/components/mobile-menu-item-row'
import type { MenuListing } from '@/features/menu/services/menu-service'
import type { MealTimingState } from '@/features/menu/hooks/use-meal-timing'
import type { Tables } from '@/types/database.types'
import { cn } from '@/lib/utils'

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name'

type DesktopMenuViewProps = {
  listings: MenuListing[]
  categories: Tables<'categories'>[]
  timing: MealTimingState
  isPending: boolean
  onCustomize: (listing: MenuListing) => void
}

export function DesktopMenuView({
  listings,
  categories,
  timing,
  isPending,
  onCustomize,
}: DesktopMenuViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('default')

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

  // Filter & sort
  const filtered = useMemo(() => {
    let items = listings

    if (selectedCategory !== 'all') {
      items = items.filter(
        (l) =>
          l.food_items?.category_id === selectedCategory ||
          l.food_items?.categories?.slug === selectedCategory,
      )
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
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* ── TOP HEADER ── */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-neutral-900 tracking-tight">
            Explore FoodIQ Menu
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Homestyle Gujarati dishes, freshly cooked daily and delivered to your doorstep.
          </p>
        </div>

        {/* Ambient Timing Strip */}
        <div className="w-full md:w-auto">
          <AmbientTimingStrip timing={timing} />
        </div>
      </div>

      {/* ── SEARCH & CATEGORY SHOWCASE ── */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative max-w-md flex-1">
            <Search className="text-neutral-400 absolute top-1/2 left-3.5 size-4 -translate-y-1/2" aria-hidden />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes, thalis, sabjis, sweets…"
              className="pl-10 h-10.5 rounded-xl bg-neutral-50/80 border-neutral-200 text-sm"
            />
          </div>

          {/* Sort */}
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-full sm:w-48 h-10.5 rounded-xl text-xs font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Sort: Featured</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name">Name: A to Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Showcase Bar */}
        <div className="pt-2">
          <CategoryShowcaseBar
            categories={categories}
            activeCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            itemCounts={itemCounts}
            isLoading={isPending}
          />
        </div>
      </div>

      {/* ── CONTENT GRID ── */}
      {isPending ? (
        <div className="space-y-6">
          {/* Section header skeleton */}
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center gap-2">
              <Skeleton className="size-6 rounded-md" />
              <Skeleton className="h-6 w-28 rounded-md" />
            </div>
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="p-4 bg-white rounded-2xl border border-neutral-200/80 flex gap-4 shadow-2xs"
              >
                <div className="flex-1 space-y-2.5">
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                  <Skeleton className="h-4 w-1/4 rounded-md" />
                  <div className="flex gap-2 pt-1">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-4/5 rounded-md" />
                </div>
                <div className="flex flex-col items-center justify-between shrink-0">
                  <Skeleton className="size-20 rounded-xl" />
                  <Skeleton className="h-7 w-20 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title={search ? 'No dishes match your search' : 'No items found in this section'}
          description="Try selecting a different category or adjusting your search."
        />
      ) : selectedCategory === 'all' && !search ? (
        /* ── DYNAMIC SECTIONS CONTINUOUS FEED ── */
        <div className="space-y-10">
          {groupedSections.map((sec) => (
            <section key={sec.key}>
              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{sec.emoji}</span>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">
                      {sec.name}
                    </h2>
                    {sec.description && (
                      <p className="text-xs text-neutral-400">
                        {sec.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Lunch / Dinner switcher in the Thali section */}
                  {sec.isThali && (
                    <div className="flex items-center p-1 bg-neutral-100 rounded-xl border text-xs">
                      <button
                        type="button"
                        onClick={() => timing.setActiveSlot('lunch')}
                        className={cn(
                          'px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all',
                          timing.activeSlot === 'lunch'
                            ? 'bg-white text-neutral-900 shadow-xs'
                            : 'text-neutral-500 hover:text-neutral-900',
                        )}
                      >
                        <Sun className="size-3.5 text-amber-500" />
                        <span>Lunch</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => timing.setActiveSlot('dinner')}
                        className={cn(
                          'px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all',
                          timing.activeSlot === 'dinner'
                            ? 'bg-white text-neutral-900 shadow-xs'
                            : 'text-neutral-500 hover:text-neutral-900',
                        )}
                      >
                        <Moon className="size-3.5 text-indigo-500" />
                        <span>Dinner</span>
                      </button>
                    </div>
                  )}

                  <span className="text-xs text-neutral-400 font-medium">
                    {sec.items.length} {sec.items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sec.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-md hover:border-neutral-300 transition-all duration-200"
                  >
                    <MobileMenuItemRow
                      listing={item}
                      onCustomize={onCustomize}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        /* ── SINGLE CATEGORY OR SEARCH FILTERED GRID ── */
        <div>
          <div className="py-2 mb-4 flex items-center justify-between border-b">
            <h2 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
              {search ? (
                <span>Search: &ldquo;{search}&rdquo;</span>
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
              {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-md hover:border-neutral-300 transition-all duration-200"
              >
                <MobileMenuItemRow
                  listing={item}
                  onCustomize={onCustomize}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
