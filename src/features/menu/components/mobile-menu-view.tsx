import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowRight, UtensilsCrossed, Sun, Moon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { AmbientTimingStrip } from '@/features/menu/components/ambient-timing-strip'
import {
  CategoryShowcaseBar,
  type CategoryKey,
} from '@/features/menu/components/category-showcase-bar'
import { MobileMenuItemRow } from '@/features/menu/components/mobile-menu-item-row'
import { useCartSummary } from '@/features/cart/hooks/use-cart'
import { CURRENCY_SYMBOL, ROUTES } from '@/constants'
import type { MenuListing, AlwaysAvailableItem } from '@/features/menu/services/menu-service'
import type { MealTimingState } from '@/features/menu/hooks/use-meal-timing'
import { cn } from '@/lib/utils'

type MobileMenuViewProps = {
  listings: MenuListing[]
  alwaysAvailableItems: AlwaysAvailableItem[]
  timing: MealTimingState
  isPending: boolean
  onCustomize: (listing: MenuListing) => void
}

export function MobileMenuView({
  listings,
  alwaysAvailableItems,
  timing,
  isPending,
  onCustomize,
}: MobileMenuViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { itemCount, subtotal } = useCartSummary()

  // Convert alwaysAvailableItems into synthetic listings for unified display
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

  // Group items by category
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
    return anytimeListings.filter((l) => {
      const cat = l.food_items?.categories?.category_type
      return cat === 'beverage'
    })
  }, [anytimeListings])

  // Item counts for circular icons
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

  // Filtered list when a specific category or search is active
  const filteredList = useMemo(() => {
    let items: MenuListing[] = []

    if (selectedCategory === 'thali') items = thaliItems
    else if (selectedCategory === 'farsan') items = farsanItems
    else if (selectedCategory === 'sabji') items = sabjiItems
    else if (selectedCategory === 'sweet') items = sweetItems
    else if (selectedCategory === 'beverage') items = beverageItems
    else items = [...thaliItems, ...farsanItems, ...sabjiItems, ...sweetItems, ...beverageItems]

    const q = searchQuery.trim().toLowerCase()
    if (q) {
      items = items.filter((l) =>
        l.food_items?.name?.toLowerCase().includes(q) ||
        l.food_items?.description?.toLowerCase().includes(q),
      )
    }

    return items
  }, [selectedCategory, thaliItems, farsanItems, sabjiItems, sweetItems, beverageItems, searchQuery])

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
            placeholder="Search for Thalis, Farsan, Sabjis, Sweets..."
            className="h-9.5 pl-9 pr-3 text-xs bg-neutral-50/90 border-neutral-200/90 rounded-xl placeholder:text-neutral-400 focus-visible:ring-neutral-900"
          />
        </div>

        {/* 3. Visual Circular Category Showcase (Zepto / Swiggy style) */}
        <CategoryShowcaseBar
          activeCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat)
          }}
          itemCounts={itemCounts}
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
          /* ── CONTINUOUS UNIFIED FEED (ALL CATEGORIES DISPLAYED NATURALLY) ── */
          <div className="space-y-8 pt-1">
            {/* 1. Today's Meal Thalis */}
            {thaliItems.length > 0 && (
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🍱</span>
                    <div>
                      <h2 className="text-base font-extrabold text-neutral-900 leading-tight">
                        Today&apos;s Meal Thalis
                      </h2>
                      <p className="text-[11px] text-neutral-400">
                        Complete homestyle meal with rotis, sabji, dal-rice & sides
                      </p>
                    </div>
                  </div>

                  {/* Scoped Lunch / Dinner toggle embedded directly in the section */}
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
                </div>

                <div>
                  {thaliItems.map((item) => (
                    <MobileMenuItemRow
                      key={item.id}
                      listing={item}
                      onCustomize={onCustomize}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 2. Gujarati Farsan & Nasta (24x7 Available) */}
            {farsanItems.length > 0 && (
              <div>
                <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🥟</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-extrabold text-neutral-900 leading-tight">
                          Gujarati Farsan & Nasta
                        </h2>
                        <span className="text-[10px] font-bold text-white bg-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          24x7 Dispatch
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        Handcrafted snacks, gathiya & namkeen, ready to enjoy anytime
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-neutral-400">
                    {farsanItems.length} items
                  </span>
                </div>

                <div>
                  {farsanItems.map((item) => (
                    <MobileMenuItemRow
                      key={item.id}
                      listing={item}
                      isAlwaysAvailable
                      onCustomize={onCustomize}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 3. Daily Fresh Sabjis & Rotis */}
            {sabjiItems.length > 0 && (
              <div>
                <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🍛</span>
                    <div>
                      <h2 className="text-base font-extrabold text-neutral-900 leading-tight">
                        Daily Sabjis & Rotis
                      </h2>
                      <p className="text-[11px] text-neutral-400">
                        Extra portions of today&apos;s fresh cooked sabjis and hot breads
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-neutral-400">
                    {sabjiItems.length} items
                  </span>
                </div>

                <div>
                  {sabjiItems.map((item) => (
                    <MobileMenuItemRow
                      key={item.id}
                      listing={item}
                      onCustomize={onCustomize}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 4. Sweets & Mithai */}
            {sweetItems.length > 0 && (
              <div>
                <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🍯</span>
                    <div>
                      <h2 className="text-base font-extrabold text-neutral-900 leading-tight">
                        Authentic Sweets & Mithai
                      </h2>
                      <p className="text-[11px] text-neutral-400">
                        Traditional homemade Gujarati prashad & sweets
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-neutral-400">
                    {sweetItems.length} items
                  </span>
                </div>

                <div>
                  {sweetItems.map((item) => (
                    <MobileMenuItemRow
                      key={item.id}
                      listing={item}
                      isAlwaysAvailable
                      onCustomize={onCustomize}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 5. Beverages & Sides */}
            {beverageItems.length > 0 && (
              <div>
                <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🥛</span>
                    <div>
                      <h2 className="text-base font-extrabold text-neutral-900 leading-tight">
                        Beverages & Sides
                      </h2>
                      <p className="text-[11px] text-neutral-400">
                        Refreshing homestyle chaas, salads & accompaniments
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-neutral-400">
                    {beverageItems.length} items
                  </span>
                </div>

                <div>
                  {beverageItems.map((item) => (
                    <MobileMenuItemRow
                      key={item.id}
                      listing={item}
                      isAlwaysAvailable
                      onCustomize={onCustomize}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── SPECIFIC CATEGORY FILTERED VIEW ── */
          <div>
            <div className="py-2 mb-1 flex items-center justify-between border-b border-neutral-100">
              <h2 className="text-sm font-bold text-neutral-800">
                {selectedCategory === 'thali' && '🍱 Meal Thalis'}
                {selectedCategory === 'farsan' && '🥟 Gujarati Farsan & Nasta (24x7)'}
                {selectedCategory === 'sabji' && '🍛 Daily Sabjis & Rotis'}
                {selectedCategory === 'sweet' && '🍯 Sweets & Mithai'}
                {selectedCategory === 'beverage' && '🥛 Beverages & Sides'}
                {searchQuery && `Search: "${searchQuery}"`}
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
                  isAlwaysAvailable={selectedCategory === 'farsan' || item.id.startsWith('anytime-')}
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
