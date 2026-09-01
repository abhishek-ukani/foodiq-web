import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { AlertTriangle, Search, UtensilsCrossed } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { MenuItemCard } from '@/features/menu/components/menu-item-card'
import { useMenuForDate } from '@/features/menu/hooks/use-menu-queries'
import { isCutoffPassed } from '@/features/menu/services/menu-service'
import type { MealType } from '@/types/database.types'

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name'

const MEAL_TABS: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
]

export function MenuPage() {
  const [date] = useState(dayjs().format('YYYY-MM-DD'))
  const [meal, setMeal] = useState<MealType>('lunch')
  const [hasAutoSelectedMeal, setHasAutoSelectedMeal] = useState(false)
  const [category, setCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('default')

  const { data: listings, isPending, isError, refetch } = useMenuForDate(date)

  // Auto-select the first meal tab that is currently published and open for order
  useEffect(() => {
    if (!listings || listings.length === 0 || hasAutoSelectedMeal) return

    const currentHour = dayjs().hour()
    const preferredOrder: MealType[] =
      currentHour < 11
        ? ['breakfast', 'lunch', 'dinner']
        : currentHour < 15
        ? ['lunch', 'dinner', 'breakfast']
        : ['dinner', 'lunch', 'breakfast']

    for (const m of preferredOrder) {
      const mealListings = listings.filter((l) => l.daily_menus.meal_type === m)
      if (mealListings.length > 0) {
        const isCutoff = mealListings.some((l) => isCutoffPassed(l))
        if (!isCutoff) {
          setMeal(m)
          setHasAutoSelectedMeal(true)
          return
        }
      }
    }

    // Fallback if all meals are cutoff: pick the first meal that has listings
    for (const m of preferredOrder) {
      const mealListings = listings.filter((l) => l.daily_menus.meal_type === m)
      if (mealListings.length > 0) {
        setMeal(m)
        setHasAutoSelectedMeal(true)
        return
      }
    }
  }, [listings, hasAutoSelectedMeal])

  const categories = useMemo(() => {
    if (!listings) return []
    const map = new Map<string, string>()
    for (const listing of listings) {
      const cat = listing.food_items.categories
      if (cat) map.set(cat.id, cat.name)
    }
    return Array.from(map, ([id, name]) => ({ id, name }))
  }, [listings])

  const filtered = useMemo(() => {
    if (!listings) return []
    let result = listings

    if (meal) {
      result = result.filter((l) => l.daily_menus.meal_type === meal)
    }
    if (category) {
      result = result.filter((l) => l.food_items.category_id === category)
    }
    const query = search.trim().toLowerCase()
    if (query) {
      result = result.filter((l) => l.food_items.name.toLowerCase().includes(query))
    }

    const priceOf = (l: (typeof result)[number]) =>
      l.price_override ?? l.food_items.price

    if (sort === 'price-asc') result = [...result].sort((a, b) => priceOf(a) - priceOf(b))
    if (sort === 'price-desc') result = [...result].sort((a, b) => priceOf(b) - priceOf(a))
    if (sort === 'name') result = [...result].sort((a, b) => a.food_items.name.localeCompare(b.food_items.name))

    return result
  }, [listings, meal, category, search, sort])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold">Today&apos;s Menu</h1>
        <p className="text-muted-foreground mt-1">{dayjs(date).format('dddd, D MMMM YYYY')}</p>
      </div>

      <div className="mb-6 flex flex-col gap-4">
        <Tabs value={meal} onValueChange={(v) => setMeal(v as MealType)}>
          <TabsList>
            {MEAL_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" aria-hidden />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes…"
              className="pl-9"
            />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-full sm:w-48">
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

        {categories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge
                key={cat.id}
                variant={category === cat.id ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1"
                onClick={() => setCategory(category === cat.id ? null : cat.id)}
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      {(() => {
        const mealListings = listings?.filter((l) => l.daily_menus.meal_type === meal) || []
        if (!mealListings.length) {
          return (
            <Alert variant="warning" className="mb-6">
              <AlertTriangle className="size-4" />
              <AlertDescription>
                {meal === 'dinner' ? '🍲 Dinner' : meal === 'lunch' ? '🍱 Lunch' : 'Breakfast'} menu for today has not been published yet by our kitchen. Please check back soon!
              </AlertDescription>
            </Alert>
          )
        }
        const isMealCutoff = mealListings.some((l) => isCutoffPassed(l))
        if (isMealCutoff) {
          return (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="size-4" />
              <AlertDescription>
                Ordering for today's {meal.toUpperCase()} is closed because the cutoff time has passed.
              </AlertDescription>
            </Alert>
          )
        }
        return null
      })()}

      {isPending ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !filtered.length ? (
        <EmptyState
          icon={UtensilsCrossed}
          title={listings?.length ? 'No dishes match your filters' : "Today's menu isn't ready yet"}
          description={
            listings?.length
              ? 'Try a different search term or category.'
              : "Our kitchen hasn't published today's menu yet — check back soon."
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((listing, index) => (
            <MenuItemCard key={listing.id} listing={listing} delay={index * 0.02} />
          ))}
        </div>
      )}
    </div>
  )
}
