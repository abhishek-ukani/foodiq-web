import { useState, useCallback } from 'react'
import dayjs from 'dayjs'
import { useMenuForDate, useAlwaysAvailableItems } from '@/features/menu/hooks/use-menu-queries'
import { useMealTiming } from '@/features/menu/hooks/use-meal-timing'
import { MobileMenuView } from '@/features/menu/components/mobile-menu-view'
import { DesktopMenuView } from '@/features/menu/components/desktop-menu-view'
import { ThaliCustomizerDrawer } from '@/features/menu/components/thali-customizer-drawer'
import { ErrorState } from '@/components/common/error-state'
import type { MenuListing } from '@/features/menu/services/menu-service'

export function MenuPage() {
  const [date] = useState(dayjs().format('YYYY-MM-DD'))
  const timing = useMealTiming(date)

  // Fetch menu filtered by active meal slot ('lunch' | 'dinner')
  const {
    data: listings = [],
    isPending: isMenuPending,
    isError: isMenuError,
    refetch: refetchMenu,
  } = useMenuForDate(date, timing.activeSlot)

  // Fetch always available (24x7) items (farsan, snacks, sweets, beverages)
  const {
    data: alwaysAvailableItems = [],
    isPending: isAlwaysPending,
    isError: isAlwaysError,
    refetch: refetchAlways,
  } = useAlwaysAvailableItems()

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

  if (isMenuError || isAlwaysError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <ErrorState
          title="Could not load menu"
          description="We had trouble fetching today's menu. Please try again."
          onRetry={() => {
            refetchMenu()
            refetchAlways()
            timing.refetchTiming()
          }}
        />
      </div>
    )
  }

  const isPending = isMenuPending || isAlwaysPending

  return (
    <>
      {/* ── MOBILE VIEW (< md) — Swiggy/Zomato Style Row Layout ── */}
      <div className="block md:hidden">
        <MobileMenuView
          listings={listings}
          alwaysAvailableItems={alwaysAvailableItems}
          timing={timing}
          isPending={isPending}
          onCustomize={handleCustomize}
        />
      </div>

      {/* ── DESKTOP VIEW (>= md) — Multi-column Grid Layout ── */}
      <div className="hidden md:block">
        <DesktopMenuView
          listings={listings}
          alwaysAvailableItems={alwaysAvailableItems}
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
        date={date}
        mealType={timing.activeSlot}
      />
    </>
  )
}
