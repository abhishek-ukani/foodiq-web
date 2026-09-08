import { cn } from '@/lib/utils'

export type CategoryKey = 'all' | 'thali' | 'farsan' | 'sabji' | 'sweet' | 'beverage'

export type CategoryItem = {
  key: CategoryKey
  label: string
  emoji: string
  badge?: string
  color: string
}

export const CATEGORIES: CategoryItem[] = [
  { key: 'all', label: 'All', emoji: '🍽️', color: 'bg-neutral-100 text-neutral-800' },
  { key: 'thali', label: 'Thalis', emoji: '🍱', color: 'bg-amber-100/80 text-amber-900' },
  { key: 'farsan', label: 'Farsan & Nasta', emoji: '🥟', badge: '24x7', color: 'bg-orange-100/80 text-orange-900' },
  { key: 'sabji', label: 'Sabjis & Rotis', emoji: '🍛', color: 'bg-emerald-100/80 text-emerald-900' },
  { key: 'sweet', label: 'Mithai', emoji: '🍯', color: 'bg-yellow-100/80 text-yellow-900' },
  { key: 'beverage', label: 'Beverages', emoji: '🥛', color: 'bg-cyan-100/80 text-cyan-900' },
]

type CategoryShowcaseBarProps = {
  activeCategory: CategoryKey
  onSelectCategory: (key: CategoryKey) => void
  itemCounts?: Partial<Record<CategoryKey, number>>
  className?: string
}

export function CategoryShowcaseBar({
  activeCategory,
  onSelectCategory,
  itemCounts,
  className,
}: CategoryShowcaseBarProps) {
  return (
    <div className={cn('w-full overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <div className="flex items-center gap-3 sm:gap-4 min-w-max">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key
          const count = itemCounts?.[cat.key]

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

                {/* Micro Badge (e.g. 24x7) */}
                {cat.badge && (
                  <span className="absolute -top-1 -right-1 text-[9px] font-extrabold text-white bg-emerald-600 px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-xs">
                    {cat.badge}
                  </span>
                )}
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
                    {count} items
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
