import { cn } from '@/lib/utils'
import type { Tables } from '@/types/database.types'

export type CategoryKey = string

export interface DynamicCategoryItem {
  key: string
  label: string
  emoji: string
  color: string
}

const LUCIDE_TO_EMOJI: Record<string, string> = {
  utensils: '🍱',
  utensilscrossed: '🍽️',
  soup: '🍛',
  coffee: '🥛',
  cake: '🍯',
  cookie: '🥟',
  pluscircle: '➕',
  tag: '🏷️',
  package: '📦',
  pizza: '🍕',
  salad: '🥗',
  flame: '🔥',
}

function getCategoryColor(type: string, slug: string): string {
  if (type === 'thali' || slug.includes('thali')) return 'bg-amber-100/80 text-amber-900'
  if (type === 'snack' || slug.includes('snack') || slug.includes('farsan')) return 'bg-orange-100/80 text-orange-900'
  if (type === 'sabji' || slug.includes('shabji') || slug.includes('sabji')) return 'bg-emerald-100/80 text-emerald-900'
  if (type === 'sweet' || slug.includes('sweet') || slug.includes('mithai')) return 'bg-yellow-100/80 text-yellow-900'
  if (type === 'beverage' || slug.includes('beverage') || slug.includes('chaas')) return 'bg-cyan-100/80 text-cyan-900'
  if (type === 'bread' || slug.includes('bread') || slug.includes('rotli')) return 'bg-amber-50/90 text-amber-900'
  if (type === 'rice' || slug.includes('rice') || slug.includes('dal')) return 'bg-stone-100 text-stone-800'
  return 'bg-neutral-100 text-neutral-800'
}

export function getCategoryVisuals(cat: Partial<Tables<'categories'>> | null): { emoji: string; color: string } {
  if (!cat) return { emoji: '🍽️', color: 'bg-neutral-100 text-neutral-800' }

  const type = (cat.category_type || '').toLowerCase()
  const slug = (cat.slug || '').toLowerCase()
  const name = (cat.name || '').toLowerCase()
  const iconRaw = (cat.icon || '').trim()
  const iconClean = iconRaw.toLowerCase().replace(/[-_\s]/g, '')

  // 1. If cat.icon is a recognized icon identifier
  if (iconClean && LUCIDE_TO_EMOJI[iconClean]) {
    return { emoji: LUCIDE_TO_EMOJI[iconClean], color: getCategoryColor(type, slug) }
  }

  // 2. If cat.icon is an actual emoji character (short string)
  if (iconRaw && iconRaw.length <= 4 && /\p{Emoji}/u.test(iconRaw)) {
    return { emoji: iconRaw, color: getCategoryColor(type, slug) }
  }

  // 3. Fallback based on type, slug, or name
  if (type === 'thali' || slug.includes('thali') || name.includes('thali')) {
    return { emoji: '🍱', color: 'bg-amber-100/80 text-amber-900' }
  }
  if (type === 'snack' || slug.includes('snack') || slug.includes('farsan') || name.includes('farsan') || name.includes('nasta')) {
    return { emoji: '🥟', color: 'bg-orange-100/80 text-orange-900' }
  }
  if (type === 'sabji' || slug.includes('shabji') || slug.includes('sabji') || name.includes('sabji') || name.includes('shabji')) {
    return { emoji: '🍛', color: 'bg-emerald-100/80 text-emerald-900' }
  }
  if (type === 'sweet' || slug.includes('sweet') || name.includes('sweet') || name.includes('mithai')) {
    return { emoji: '🍯', color: 'bg-yellow-100/80 text-yellow-900' }
  }
  if (type === 'beverage' || slug.includes('beverage') || name.includes('beverage') || name.includes('chaas') || name.includes('chhash')) {
    return { emoji: '🥛', color: 'bg-cyan-100/80 text-cyan-900' }
  }
  if (type === 'bread' || slug.includes('bread') || name.includes('rotli') || name.includes('rotla') || name.includes('bhakhri')) {
    return { emoji: '🫓', color: 'bg-amber-50/90 text-amber-900' }
  }
  if (type === 'rice' || slug.includes('rice') || name.includes('dal') || name.includes('rice') || name.includes('bhat')) {
    return { emoji: '🍚', color: 'bg-stone-100 text-stone-800' }
  }

  return { emoji: '🍲', color: 'bg-neutral-100 text-neutral-800' }
}

type CategoryShowcaseBarProps = {
  categories: Tables<'categories'>[]
  activeCategory: string
  onSelectCategory: (key: string) => void
  itemCounts?: Record<string, number>
  isLoading?: boolean
  className?: string
}

export function CategoryShowcaseBarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('w-full overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <div className="flex items-center gap-3 sm:gap-4 min-w-max">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 select-none shrink-0">
            <div className="size-13 sm:size-14 rounded-full bg-neutral-200/80 animate-pulse border-2 border-transparent" />
            <div className="h-2.5 w-11 rounded-full bg-neutral-200/80 animate-pulse mt-0.5" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CategoryShowcaseBar({
  categories,
  activeCategory,
  onSelectCategory,
  itemCounts = {},
  isLoading = false,
  className,
}: CategoryShowcaseBarProps) {
  if (isLoading) {
    return <CategoryShowcaseBarSkeleton className={className} />
  }

  // Only display active categories that actually contain items in the current menu
  const itemsWithCounts = categories.filter(
    (cat) => cat.is_active !== false && ((itemCounts[cat.id] ?? 0) > 0 || (itemCounts[cat.slug] ?? 0) > 0),
  )

  // Built items: "All" followed by categories that have items in the current menu
  const displayItems: DynamicCategoryItem[] = [
    {
      key: 'all',
      label: 'All',
      emoji: '🍽️',
      color: 'bg-neutral-100 text-neutral-800',
    },
    ...itemsWithCounts.map((cat) => {
      const visuals = getCategoryVisuals(cat)
      return {
        key: cat.id,
        label: cat.name,
        emoji: visuals.emoji,
        color: visuals.color,
      }
    }),
  ]

  return (
    <div className={cn('w-full overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <div className="flex items-center gap-3 sm:gap-4 min-w-max">
        {displayItems.map((cat) => {
          const isActive = activeCategory === cat.key
          const count = itemCounts[cat.key]

          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onSelectCategory(cat.key)}
              className="flex flex-col items-center gap-1.5 group select-none shrink-0"
            >
              {/* Circular Icon Container (Zepto / Blinkit / Swiggy style) */}
              <div className="relative">
                <div
                  className={cn(
                    'size-13 sm:size-14 rounded-full flex items-center justify-center text-2xl transition-all duration-200 border-2',
                    cat.color,
                    isActive
                      ? 'border-neutral-900 scale-105 shadow-md ring-2 ring-neutral-900/10'
                      : 'border-transparent group-hover:scale-105 group-hover:border-neutral-300 shadow-2xs',
                  )}
                >
                  <span>{cat.emoji}</span>
                </div>
              </div>

              {/* Label & Count */}
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'text-[11px] sm:text-xs tracking-tight transition-colors whitespace-nowrap',
                    isActive ? 'font-bold text-neutral-900' : 'font-medium text-neutral-600 group-hover:text-neutral-900',
                  )}
                >
                  {cat.label}
                </span>
                {count !== undefined && count > 0 && cat.key !== 'all' && (
                  <span className="text-[9px] text-neutral-400 font-medium">
                    {count} {count === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>

              {/* Active Underline Pill */}
              <div
                className={cn(
                  'h-0.5 w-6 rounded-full transition-all duration-200',
                  isActive ? 'bg-neutral-900' : 'bg-transparent',
                )}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
