import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMenuForDate, useActiveCategories } from '@/features/menu/hooks/use-menu-queries'
import { useMealTiming } from '@/features/menu/hooks/use-meal-timing'
import { MobileMenuView } from '@/features/menu/components/mobile-menu-view'
import { DesktopMenuView } from '@/features/menu/components/desktop-menu-view'
import { ThaliCustomizerDrawer } from '@/features/menu/components/thali-customizer-drawer'
import { ErrorState } from '@/components/common/error-state'
import type { MenuListing } from '@/features/menu/services/menu-service'
import type { MealType, Tables } from '@/types/database.types'

export function resolveCategoryKey(
  param: string | null | undefined,
  categoriesList: Tables<'categories'>[],
): string {
  if (!param || param === 'all') return 'all'
  const p = param.trim().toLowerCase()

  // 1. Direct ID match
  const byId = categoriesList.find((c) => c.id === param)
  if (byId) return byId.id

  // 2. Slug exact match
  const bySlug = categoriesList.find((c) => (c.slug || '').toLowerCase() === p)
  if (bySlug) return bySlug.id

  // 3. Name exact match
  const byName = categoriesList.find((c) => c.name.toLowerCase() === p)
  if (byName) return byName.id

  // 4. "meals" / "meal" / "thalis" / "thali" keyword match
  if (p === 'meals' || p === 'meal' || p === 'thali' || p === 'thalis') {
    const thaliCat = categoriesList.find(
      (c) =>
        c.category_type === 'thali' ||
        (c.slug || '').toLowerCase().includes('thali') ||
        c.name.toLowerCase().includes('thali') ||
        c.name.toLowerCase().includes('meal'),
    )
    if (thaliCat) return thaliCat.id
  }

  // 5. Partial slug or name match
  const partial = categoriesList.find(
    (c) =>
      (c.slug || '').toLowerCase().includes(p) ||
      c.name.toLowerCase().includes(p),
  )
  if (partial) return partial.id

  return 'all'
}

export function MenuPage() {
  const timing = useMealTiming()
  const [searchParams, setSearchParams] = useSearchParams()

  const categoryParam = searchParams.get('category')
  const mealParam = searchParams.get('meal') as MealType | null
  const dateParam = searchParams.get('date')

  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  // Sync date if specified in URL
  useEffect(() => {
    if (dateParam && dateParam !== timing.date) {
      timing.setDate(dateParam)
    }
  }, [dateParam, timing])

  // Sync meal slot (lunch / dinner) if specified in URL
  useEffect(() => {
    if ((mealParam === 'lunch' || mealParam === 'dinner') && timing.activeSlot !== mealParam) {
      timing.setActiveSlot(mealParam)
    }
  }, [mealParam, timing])

  // Fetch menu filtered by active meal slot ('lunch' | 'dinner') and date (today/tomorrow)
  const {
    data: listings = [],
    isPending: isMenuPending,
    isError: isMenuError,
    refetch: refetchMenu,
  } = useMenuForDate(timing.date, timing.activeSlot)

  // Fetch active categories from admin database
  const {
    data: categories = [],
    isPending: isCategoriesPending,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useActiveCategories()

  // Resolve categoryParam when categories load or URL changes
  useEffect(() => {
    if (categoryParam && categories.length > 0) {
      const resolved = resolveCategoryKey(categoryParam, categories)
      setSelectedCategory(resolved)
    } else if (!categoryParam) {
      setSelectedCategory('all')
    }
  }, [categoryParam, categories])

  const handleSelectCategory = useCallback(
    (catKey: string) => {
      setSelectedCategory(catKey)
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (catKey === 'all') {
            next.delete('category')
          } else {
            const catObj = categories.find((c) => c.id === catKey)
            next.set('category', catObj?.slug || catKey)
          }
          return next
        },
        { replace: true },
      )
    },
    [categories, setSearchParams],
  )

  // Inline Customizer Drawer state
  const [customizingSlug, setCustomizingSlug] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleCustomize = useCallback((listing: MenuListing) => {
    setCustomizingSlug(listing.food_items.slug)
    setIsDrawerOpen(true)
  }, [])

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false)
  }, [])

  if (isMenuError || isCategoriesError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <ErrorState
          title="Could not load menu"
          description="We had trouble fetching today's menu. Please try again."
          onRetry={() => {
            refetchMenu()
            refetchCategories()
            timing.refetchTiming()
          }}
        />
      </div>
    )
  }

  const isPending = isMenuPending || isCategoriesPending

  return (
    <>
      {/* ── MOBILE VIEW (< md) — Swiggy/Zomato Style Row Layout ── */}
      <div className="block md:hidden">
        <MobileMenuView
          listings={listings}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          timing={timing}
          isPending={isPending}
          onCustomize={handleCustomize}
        />
      </div>

      {/* ── DESKTOP VIEW (>= md) — Multi-column Grid Layout ── */}
      <div className="hidden md:block">
        <DesktopMenuView
          listings={listings}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          timing={timing}
          isPending={isPending}
          onCustomize={handleCustomize}
        />
      </div>

      {/* ── SHARED INLINE THALI CUSTOMIZER DRAWER (Bottom Sheet / Modal) ── */}
      <ThaliCustomizerDrawer
        slug={customizingSlug}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        date={timing.date}
        mealType={timing.activeSlot}
      />
    </>
  )
}
