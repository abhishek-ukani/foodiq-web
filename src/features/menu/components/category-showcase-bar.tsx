import { cn } from '@/lib/utils'
import type { Tables } from '@/types/database.types'

export type CategoryKey = string

export interface CategoryPillItem {
  key: string
  label: string
  slug?: string | null
  image: string | null
  emoji: string
}

export function getCategoryVisuals(cat: Partial<Tables<'categories'>> | null): { emoji: string; color: string } {
  if (!cat) return { emoji: '🍽️', color: 'bg-neutral-100 text-neutral-800' }
  const slug = (cat.slug || '').toLowerCase()
  if (slug.includes('thali')) return { emoji: '🍱', color: 'bg-amber-100/80 text-amber-900' }
  if (slug.includes('farsan') || slug.includes('snack')) return { emoji: '🥟', color: 'bg-orange-100/80 text-orange-900' }
  if (slug.includes('sabji') || slug.includes('shabji')) return { emoji: '🍛', color: 'bg-emerald-100/80 text-emerald-900' }
  if (slug.includes('sweet')) return { emoji: '🍯', color: 'bg-yellow-100/80 text-yellow-900' }
  if (slug.includes('beverage')) return { emoji: '🥛', color: 'bg-cyan-100/80 text-cyan-900' }
  if (slug.includes('bread') || slug.includes('rotli')) return { emoji: '🫓', color: 'bg-amber-50/90 text-amber-900' }
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
    <div className={cn('w-full overflow-x-auto scrollbar-none no-scrollbar', className)}>
      <div className="flex items-center gap-2.5 min-w-max">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="h-11 rounded-full bg-[#EFE9DC]/80 animate-pulse shrink-0"
            style={{ width: `${80 + i * 14}px` }}
          />
        ))}
      </div>
    </div>
  )
}

export function CategoryShowcaseBar({
  categories,
  activeCategory,
  onSelectCategory,
  itemCounts,
  isLoading = false,
  className,
}: CategoryShowcaseBarProps) {
  if (isLoading) {
    return <CategoryShowcaseBarSkeleton className={className} />
  }

  // Dynamic from admin panel: only show active categories that have available items
  // Always keep Thalis/Meals category visible so customers can explore and pre-order thalis anytime
  const activeCategories = categories
    .filter((c) => {
      if (c.is_active === false) return false
      const isThaliCategory =
        c.category_type === 'thali' ||
        c.slug === 'thalis' ||
        c.name.toLowerCase().includes('thali') ||
        c.name.toLowerCase().includes('meal')
      if (isThaliCategory) return true
      if (itemCounts) {
        const count = itemCounts[c.id] ?? (c.slug ? itemCounts[c.slug] : 0) ?? 0
        return count > 0
      }
      return true
    })
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))

  const displayItems: CategoryPillItem[] = [
    { key: 'all', label: 'All', slug: 'all', image: null, emoji: '🍽️' },
    ...activeCategories.map((cat) => ({
      key: cat.id,
      label: cat.name,
      slug: cat.slug,
      image: cat.image_url || null,
      emoji: getCategoryVisuals(cat).emoji,
    })),
  ]

  // If there are uncategorized items with count > 0, include "Other" pill
  if (itemCounts && (itemCounts['other'] ?? 0) > 0) {
    displayItems.push({
      key: 'other',
      label: 'Other',
      slug: 'other',
      image: null,
      emoji: '🍛',
    })
  }

  return (
    <div className={cn('w-full overflow-x-auto scrollbar-none no-scrollbar py-1', className)}>
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-max px-0.5">
        {displayItems.map((cat) => {
          const isActive =
            activeCategory === cat.key ||
            (activeCategory !== 'all' &&
              ((Boolean(cat.slug) && cat.slug?.toLowerCase() === activeCategory.toLowerCase()) ||
               cat.label.toLowerCase() === activeCategory.toLowerCase()))

          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onSelectCategory(cat.key)}
              className={cn(
                'inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 border shrink-0 min-h-[42px] cursor-pointer select-none',
                isActive
                  ? 'bg-[#087443] text-white border-[#087443] shadow-[0_2px_8px_rgba(8,116,67,0.25)] ring-1 ring-[#087443]'
                  : 'bg-white text-[#17231D] border-[#E9E5DA] hover:border-[#087443]/40 hover:bg-[#FAF8F2] shadow-2xs',
              )}
            >
              {/* Category visual: image if uploaded in admin, else category icon */}
              {cat.image ? (
                <div
                  className={cn(
                    'size-6 sm:size-7 rounded-full overflow-hidden shrink-0 border transition-transform',
                    isActive ? 'border-white/30 scale-105' : 'border-[#E9E5DA]/80',
                  )}
                >
                  <img
                    src={cat.image}
                    alt={cat.label}
                    loading="lazy"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              ) : (
                <span className="text-base leading-none shrink-0">{cat.emoji}</span>
              )}

              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
