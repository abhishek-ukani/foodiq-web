import { Skeleton } from '@/components/ui/skeleton'

export function MenuPageSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-16" aria-busy aria-live="polite">
      <span className="sr-only">Loading menu</span>

      {/* ── MOBILE VIEW (< md) ── */}
      <div className="block md:hidden">
        <div className="sticky top-0 z-30 bg-white/95 border-b border-neutral-100 px-4 pt-2 pb-2 space-y-2">
          {/* Timing strip */}
          <Skeleton className="h-8 w-full rounded-full" />
          {/* Search bar */}
          <Skeleton className="h-9.5 w-full rounded-xl" />
          {/* Category pills */}
          <div className="flex items-center gap-3 overflow-x-hidden py-2 -mx-4 px-4">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
                <Skeleton className="size-13 rounded-full" />
                <Skeleton className="h-2.5 w-10 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile item rows */}
        <div className="px-4 pt-4 space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex gap-3 py-3 border-b border-neutral-100">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/3 rounded-md" />
                <Skeleton className="h-3 w-full rounded-md" />
              </div>
              <Skeleton className="size-24 rounded-2xl shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* ── DESKTOP VIEW (>= md) ── */}
      <div className="hidden md:block mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between pb-6 border-b border-neutral-200">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-neutral-900 tracking-tight">
              Explore FoodIQ Menu
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Homestyle Gujarati dishes, freshly cooked daily and delivered to your doorstep.
            </p>
          </div>
          <Skeleton className="h-9 w-52 rounded-full" />
        </div>

        {/* Search & Sort */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-10.5 max-w-md flex-1 rounded-xl" />
            <Skeleton className="h-10.5 w-48 rounded-xl" />
          </div>

          {/* Categories bar */}
          <div className="pt-2 flex items-center gap-4">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
                <Skeleton className="size-14 rounded-full" />
                <Skeleton className="h-2.5 w-12 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Section header skeleton */}
        <div className="mb-4 flex items-center justify-between pb-2 border-b">
          <div className="flex items-center gap-2">
            <Skeleton className="size-6 rounded-md" />
            <Skeleton className="h-6 w-28 rounded-md" />
          </div>
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="h-36 rounded-2xl border border-neutral-200/80 bg-white p-4 flex gap-4 shadow-2xs"
            >
              <div className="flex-1 space-y-2.5">
                <Skeleton className="h-4 w-1/2 rounded" />
                <Skeleton className="h-4 w-1/4 rounded" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-4/5 rounded" />
              </div>
              <div className="flex flex-col items-center justify-between shrink-0">
                <Skeleton className="size-20 rounded-xl" />
                <Skeleton className="h-7 w-20 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
