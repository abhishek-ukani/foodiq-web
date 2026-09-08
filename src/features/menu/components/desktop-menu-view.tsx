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
  type CategoryKey,
} from '@/features/menu/components/category-showcase-bar'
import { MobileMenuItemRow } from '@/features/menu/components/mobile-menu-item-row'
import type { MenuListing, AlwaysAvailableItem } from '@/features/menu/services/menu-service'
import type { MealTimingState } from '@/features/menu/hooks/use-meal-timing'
import { cn } from '@/lib/utils'

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name'

type DesktopMenuViewProps = {
  listings: MenuListing[]
  alwaysAvailableItems: AlwaysAvailableItem[]
  timing: MealTimingState
  isPending: boolean
  onCustomize: (listing: MenuListing) => void
}

export function DesktopMenuView({
  listings,
  alwaysAvailableItems,
  timing,
  isPending,
  onCustomize,
}: DesktopMenuViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('default')

  // Convert alwaysAvailableItems into synthetic listings
  const anytimeListings = useMemo<MenuListing[]>(() => {
    return alwaysAvailableItems.map((item) => ({
      id: `anytime-${item.id}`,
      daily_menu_id: 'anytime',
      food_item_id: item.id,
      price_override: null,
      available_quantity: null,
      sold_quantity: 0,
      is_available: item.is_available,
      is_special: false,
      is_standalone_sale: true,
      is_thali_option: false,
      cutoff_time: null,
      cutoff_note: null,
      display_order: item.display_order ?? 0,
      created_at: item.created_at,
      updated_at: item.updated_at,
      food_items: item as any,
      daily_menus: {
        menu_date: '',
        is_published: true,
        meal_type: timing.activeSlot,
        cutoff_time: null,
      },
    }))
  }, [alwaysAvailableItems, timing.activeSlot])

  const thaliItems = useMemo(() => {
    return listings.filter((l) => l.food_items?.kind === 'thali')
  }, [listings])

  const farsanItems = useMemo(() => {
    return anytimeListings.filter((l) => {
      const cat = l.food_items?.categories?.category_type
      const slug = l.food_items?.categories?.slug || ''
      const name = l.food_items?.name?.toLowerCase() || ''
      return (
        cat === 'snack' ||
        slug.includes('snack') ||
        slug.includes('farsan') ||
        name.includes('gathiya') ||
        name.includes('chewdo') ||
        name.includes('fryum') ||
        name.includes('papad') ||
        name.includes('khakhra') ||
        name.includes('thepla')
      )
    })
  }, [anytimeListings])

  const sabjiItems = useMemo(() => {
    return listings.filter((l) => {
      const cat = l.food_items?.categories?.category_type
      const kind = l.food_items?.kind
      return kind !== 'thali' && (cat === 'sabji' || cat === 'bread' || cat === 'rice' || cat === 'general')
    })
  }, [listings])

  const sweetItems = useMemo(() => {
    return anytimeListings.filter((l) => l.food_items?.categories?.category_type === 'sweet')
  }, [anytimeListings])

  const beverageItems = useMemo(() => {
    return anytimeListings.filter((l) => l.food_items?.categories?.category_type === 'beverage')
  }, [anytimeListings])

  const itemCounts = useMemo(() => {
    return {
      all: listings.length + anytimeListings.length,
      thali: thaliItems.length,
      farsan: farsanItems.length,
      sabji: sabjiItems.length,
      sweet: sweetItems.length,
      beverage: beverageItems.length,
    }
  }, [listings, anytimeListings, thaliItems, farsanItems, sabjiItems, sweetItems, beverageItems])

  // Filter & sort
  const filtered = useMemo(() => {
    let items: MenuListing[] = []

    if (selectedCategory === 'thali') items = thaliItems
    else if (selectedCategory === 'farsan') items = farsanItems
    else if (selectedCategory === 'sabji') items = sabjiItems
    else if (selectedCategory === 'sweet') items = sweetItems
    else if (selectedCategory === 'beverage') items = beverageItems
    else items = [...thaliItems, ...farsanItems, ...sabjiItems, ...sweetItems, ...beverageItems]

    const query = search.trim().toLowerCase()
    if (query) {
      items = items.filter((l) =>
        l.food_items?.name?.toLowerCase().includes(query) ||
        l.food_items?.description?.toLowerCase().includes(query),
      )
    }

    const priceOf = (l: MenuListing) => l.price_override ?? l.food_items?.price ?? 0

    if (sort === 'price-asc') items = [...items].sort((a, b) => priceOf(a) - priceOf(b))
    if (sort === 'price-desc') items = [...items].sort((a, b) => priceOf(b) - priceOf(a))
    if (sort === 'name') items = [...items].sort((a, b) => a.food_items.name.localeCompare(b.food_items.name))

    return items
  }, [selectedCategory, thaliItems, farsanItems, sabjiItems, sweetItems, beverageItems, search, sort])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* ── TOP HEADER ── */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-neutral-900 tracking-tight">
            Explore FoodIQ Menu
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Homestyle Gujarati thalis, freshly cooked daily sabjis, and handcrafted farsan.
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
              placeholder="Search dishes, thalis, farsan, sweets…"
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

        {/* Category Showcase Bar (Zepto / Swiggy style circular icons) */}
        <div className="pt-2">
          <CategoryShowcaseBar
            activeCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            itemCounts={itemCounts}
          />
        </div>
      </div>

      {/* ── CONTENT GRID ── */}
      {isPending ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="p-4 bg-white rounded-2xl border border-neutral-200 flex gap-4">
              <div className="flex-1 space-y-2.5">
                <Skeleton className="h-5 w-1/2 rounded" />
                <Skeleton className="h-4 w-1/4 rounded" />
                <Skeleton className="h-4 w-3/4 rounded" />
              </div>
              <Skeleton className="size-28 rounded-2xl shrink-0" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title={search ? 'No dishes match your search' : 'No items found in this section'}
          description="Try selecting a different category or adjusting your search."
        />
      ) : selectedCategory === 'all' && !search ? (
        /* ── CONTINUOUS FEED (DESKTOP 2-COLUMN GRID BY SECTION) ── */
        <div className="space-y-10">
          {/* 1. Meal Thalis */}
          {thaliItems.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🍱</span>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">
                      Today&apos;s Meal Thalis
                    </h2>
                    <p className="text-xs text-neutral-400">
                      Complete homestyle meal with rotis, sabji, dal-rice & sides
                    </p>
                  </div>
                </div>

                {/* Lunch / Dinner switcher right in the Thali header */}
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
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {thaliItems.map((item) => (
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
          )}

          {/* 2. Gujarati Farsan & Nasta */}
          {farsanItems.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🥟</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-neutral-900">
                        Gujarati Farsan & Nasta
                      </h2>
                      <span className="text-[10px] font-bold text-white bg-emerald-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        24x7 Available
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Freshly handcrafted snacks, gathiya, khakhra & namkeen, ready for immediate dispatch
                    </p>
                  </div>
                </div>
                <span className="text-xs text-neutral-400 font-medium">
                  {farsanItems.length} items
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {farsanItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-md hover:border-neutral-300 transition-all duration-200"
                  >
                    <MobileMenuItemRow
                      listing={item}
                      isAlwaysAvailable
                      onCustomize={onCustomize}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. Daily Sabjis & Rotis */}
          {sabjiItems.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🍛</span>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">
                      Daily Sabjis & Fresh Rotis
                    </h2>
                    <p className="text-xs text-neutral-400">
                      Extra portions of today&apos;s cooked vegetables and breads
                    </p>
                  </div>
                </div>
                <span className="text-xs text-neutral-400 font-medium">
                  {sabjiItems.length} items
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sabjiItems.map((item) => (
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
          )}

          {/* 4. Sweets & Mithai */}
          {sweetItems.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🍯</span>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">
                      Authentic Sweets & Mithai
                    </h2>
                    <p className="text-xs text-neutral-400">
                      Traditional Gujarati prashad & sweets
                    </p>
                  </div>
                </div>
                <span className="text-xs text-neutral-400 font-medium">
                  {sweetItems.length} items
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sweetItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-md hover:border-neutral-300 transition-all duration-200"
                  >
                    <MobileMenuItemRow
                      listing={item}
                      isAlwaysAvailable
                      onCustomize={onCustomize}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 5. Beverages & Sides */}
          {beverageItems.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🥛</span>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">
                      Beverages & Sides
                    </h2>
                    <p className="text-xs text-neutral-400">
                      Chhash, salads, pickles & sides
                    </p>
                  </div>
                </div>
                <span className="text-xs text-neutral-400 font-medium">
                  {beverageItems.length} items
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {beverageItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-md hover:border-neutral-300 transition-all duration-200"
                  >
                    <MobileMenuItemRow
                      listing={item}
                      isAlwaysAvailable
                      onCustomize={onCustomize}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        /* ── SINGLE CATEGORY FILTERED GRID ── */
        <div>
          <div className="py-2 mb-4 flex items-center justify-between border-b">
            <h2 className="text-lg font-bold text-neutral-800">
              {selectedCategory === 'thali' && '🍱 Meal Thalis'}
              {selectedCategory === 'farsan' && '🥟 Gujarati Farsan & Nasta (24x7)'}
              {selectedCategory === 'sabji' && '🍛 Daily Sabjis & Fresh Rotis'}
              {selectedCategory === 'sweet' && '🍯 Authentic Sweets & Mithai'}
              {selectedCategory === 'beverage' && '🥛 Beverages & Sides'}
              {search && `Search: "${search}"`}
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
                  isAlwaysAvailable={selectedCategory === 'farsan' || item.id.startsWith('anytime-')}
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
