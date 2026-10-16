import { Skeleton } from '@/components/ui/skeleton'

export function MenuPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#faf6ee]" aria-busy aria-live="polite">
      <span className="sr-only">Loading menu</span>

      {/* ── MOBILE VIEW (< md) ── */}
      <div className="block md:hidden">
        {/* Compact hero banner */}
        <div className="bg-[#faf6ee] border-b border-[#ede4d3] px-4 pt-5 pb-4">
          <Skeleton className="h-3 w-40 rounded mb-2" />
          <Skeleton className="h-7 w-72 rounded-lg mb-1" />
          <Skeleton className="h-7 w-48 rounded-lg" />
        </div>

        {/* Sticky search + category pills */}
        <div className="border-b border-[#ede4d3] px-4 pt-3 pb-3 space-y-2.5">
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="flex items-center gap-2 overflow-x-hidden">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-9 rounded-full shrink-0" style={{ width: `${60 + i * 12}px` }} />
            ))}
          </div>
        </div>

        {/* Item rows */}
        <div className="px-4 pt-4 space-y-0">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex gap-3 py-4 border-b border-[#ede4d3]">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/3 rounded" />
                <Skeleton className="h-3 w-full rounded" />
              </div>
              <Skeleton className="size-24 rounded-2xl shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* ── DESKTOP VIEW (>= md) ── */}
      <div className="hidden md:block">
        {/* Hero skeleton */}
        <div className="border-b border-[#ede4d3] px-4 py-10 lg:py-14">
          <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <Skeleton className="h-3 w-48 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-4/5 rounded-xl" />
              </div>
              <Skeleton className="h-4 w-full max-w-md rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-12 w-full max-w-md rounded-2xl" />
            </div>
            <Skeleton className="aspect-[4/3] w-full max-w-[480px] ml-auto rounded-[2rem]" />
          </div>
        </div>

        {/* Category pills + sort bar */}
        <div className="border-b border-[#ede4d3] px-4 py-3">
          <div className="mx-auto max-w-6xl flex items-center gap-3 justify-between">
            <div className="flex items-center gap-2 flex-1">
              {Array.from({ length: 7 }, (_, i) => (
                <Skeleton key={i} className="h-9 rounded-full shrink-0" style={{ width: `${64 + i * 10}px` }} />
              ))}
            </div>
            <Skeleton className="h-9 w-44 rounded-full shrink-0" />
          </div>
        </div>

        {/* Content grid */}
        <div className="mx-auto max-w-6xl px-4 py-10 space-y-12">
          {/* Section 1 – Thali (larger cards) */}
          <div>
            <div className="flex items-start justify-between pb-4 mb-6 border-b border-[#ede4d3]">
              <div className="flex items-start gap-3">
                <Skeleton className="size-7 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-28 rounded-lg" />
                  <Skeleton className="h-3 w-48 rounded" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 2 }, (_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-[#ede4d3]/80 bg-white">
                  <Skeleton className="aspect-[16/9] w-full rounded-none" />
                  <div className="p-4 space-y-2.5">
                    <Skeleton className="h-5 w-3/4 rounded" />
                    <div className="flex gap-1">
                      <Skeleton className="h-5 w-14 rounded-md" />
                      <Skeleton className="h-5 w-16 rounded-md" />
                      <Skeleton className="h-5 w-12 rounded-md" />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <Skeleton className="h-6 w-16 rounded" />
                      <Skeleton className="h-9 w-24 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2 – standard 4-col grid */}
          <div>
            <div className="flex items-start gap-3 pb-4 mb-6 border-b border-[#ede4d3]">
              <Skeleton className="size-7 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-24 rounded-lg" />
                <Skeleton className="h-3 w-36 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-[#ede4d3]/80 bg-white">
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <div className="p-3.5 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                    <div className="flex items-center justify-between pt-1">
                      <Skeleton className="h-5 w-14 rounded" />
                      <Skeleton className="h-8 w-20 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
