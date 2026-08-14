import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Search, UtensilsCrossed } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import type { MealType } from '@/types/database.types'

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name'

const MEAL_TABS: { value: MealType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
]

export function MenuPage() {
  const [date] = useState(dayjs().format('YYYY-MM-DD'))
  const [meal, setMeal] = useState<MealType | 'all'>('all')
  const [category, setCategory] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('default')

  const { data: listings, isPending, isError, refetch } = useMenuForDate(date)

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

    if (meal !== 'all') {
      result = result.filter((l) => l.daily_menus.meal_type === meal)
    } else {
      // The same dish is usually listed for both lunch and dinner; showing every
      // meal at once must not render it twice.
      const seen = new Set<string>()
      result = result.filter((l) => {
        if (seen.has(l.food_item_id)) return false
        seen.add(l.food_item_id)
        return true
      })
    }
    if (category !== 'all') {
      result = result.filter((l) => l.food_items.category_id === category)
    }
    const query = search.trim().toLowerCase()
    if (query) {
      result = result.filter((l) => l.food_items.name.toLowerCase().includes(query))
    }

    const priceOf = (l: (typeof result)[number]) =>
      l.price_override ?? l.food_items.offer_price ?? l.food_items.price

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
        <Tabs value={meal} onValueChange={(v) => setMeal(v as MealType | 'all')}>
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
            <Badge
              variant={category === 'all' ? 'default' : 'outline'}
              className="cursor-pointer px-3 py-1"
              onClick={() => setCategory('all')}
            >
              All
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat.id}
                variant={category === cat.id ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1"
                onClick={() => setCategory(cat.id)}
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

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
