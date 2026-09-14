import { Skeleton } from '@/components/ui/skeleton'

export function PageLoader() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:py-12" aria-busy aria-live="polite">
      <span className="sr-only">Loading page</span>
      {/* Header Skeleton */}
      <div className="space-y-2 border-b border-neutral-200 pb-6">
        <Skeleton className="h-8 w-48 sm:w-64 rounded-xl" />
        <Skeleton className="h-4 w-72 sm:w-96 rounded-lg" />
      </div>

      {/* Filter / Tabs Skeleton */}
      <div className="flex items-center gap-3 py-2">
        <Skeleton className="h-10 w-28 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="rounded-2xl border border-neutral-200/80 bg-white p-4 space-y-3 shadow-2xs">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-3 w-1/2 rounded-md" />
            <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
