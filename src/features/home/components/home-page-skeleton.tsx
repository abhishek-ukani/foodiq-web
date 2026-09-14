import { Skeleton } from '@/components/ui/skeleton'

export function HomePageSkeleton() {
  return (
    <div
      className="flex flex-col min-h-screen bg-background pb-12 overflow-hidden"
      aria-busy
      aria-live="polite"
    >
      <span className="sr-only">Loading home page...</span>

      {/* ── 1. HERO SECTION SKELETON ── */}
      <section className="relative overflow-hidden py-8 sm:py-12 lg:py-16">
        {/* Soft warm background vignette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,#fef3e2_0%,transparent_60%)]"
        />

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Copy & CTAs */}
            <div className="space-y-6 lg:col-span-7">
              {/* "Real Homemade Food" Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-terracotta/20 bg-terracotta/5 px-3.5 py-1.5">
                <Skeleton className="size-3.5 rounded-full bg-terracotta/20" />
                <Skeleton className="h-3 w-32 rounded-full bg-terracotta/20" />
              </div>

              {/* Headline */}
              <div className="space-y-2 sm:space-y-3">
                <Skeleton className="h-10 sm:h-12 lg:h-14 w-4/5 max-w-md rounded-2xl" />
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-10 sm:h-12 lg:h-14 w-3/5 max-w-xs rounded-2xl" />
                  <Skeleton className="size-8 sm:size-10 rounded-full shrink-0 bg-terracotta/20" />
                </div>
              </div>

              {/* Subtitle */}
              <div className="space-y-2 max-w-xl">
                <Skeleton className="h-4 sm:h-4.5 w-full rounded-lg" />
                <Skeleton className="h-4 sm:h-4.5 w-4/5 rounded-lg" />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Skeleton className="h-12 w-44 rounded-full bg-primary/25" />
                <Skeleton className="h-12 w-36 rounded-full border-2 border-terracotta/20 bg-transparent" />
              </div>

              {/* Trust Highlights Strip with Vertical Dividers */}
              <div className="border-t border-border/70 pt-6">
                <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:divide-x sm:divide-border/80">
                  {/* Fresh Ingredients */}
                  <div className="flex items-center gap-2.5 sm:pr-4">
                    <Skeleton className="size-5 rounded-md shrink-0 bg-primary/20" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-12 rounded-sm" />
                      <Skeleton className="h-3 w-18 rounded-sm" />
                    </div>
                  </div>

                  {/* Home Made */}
                  <div className="flex items-center gap-2.5 sm:px-4">
                    <Skeleton className="size-5 rounded-md shrink-0 bg-primary/20" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-12 rounded-sm" />
                      <Skeleton className="h-3 w-14 rounded-sm" />
                    </div>
                  </div>

                  {/* Hygienic & Safe */}
                  <div className="flex items-center gap-2.5 sm:px-4">
                    <Skeleton className="size-5 rounded-md shrink-0 bg-primary/20" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-14 rounded-sm" />
                      <Skeleton className="h-3 w-12 rounded-sm" />
                    </div>
                  </div>

                  {/* On-Time Delivery */}
                  <div className="flex items-center gap-2.5 sm:pl-4">
                    <Skeleton className="size-5 rounded-md shrink-0 bg-primary/20" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-14 rounded-sm" />
                      <Skeleton className="h-3 w-16 rounded-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Plate */}
            <div className="relative lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Soft warm plate glow */}
                <div className="absolute -inset-4 rounded-full bg-amber-500/10 blur-2xl -z-10" />

                <div className="relative overflow-hidden rounded-[2.5rem] border border-border/60 bg-card/60 p-2 shadow-xl shadow-amber-950/5">
                  <div className="relative aspect-[4/3] sm:aspect-square w-full overflow-hidden rounded-[2.2rem]">
                    <Skeleton className="size-full rounded-[2.2rem]" />
                    {/* Bottom floating tag inside plate */}
                    <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between">
                      <Skeleton className="h-4 w-36 rounded-md bg-white/40" />
                      <Skeleton className="h-5 w-24 rounded-full bg-white/40" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. CATEGORY TILES STRIP SKELETON ── */}
      <section className="relative mx-auto max-w-6xl px-4 py-4 sm:py-8 w-full">
        <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4.5 overflow-x-auto sm:overflow-visible scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 pt-6 sm:pt-7 pb-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="shrink-0 w-36 sm:w-auto rounded-[1.75rem] border border-[#EDE4D3] bg-[#FCF8F2] p-3.5 sm:p-4 flex flex-col items-center justify-between shadow-[0_4px_16px_-4px_rgba(80,50,20,0.06)]"
            >
              {/* Dish circle presentation */}
              <div className="relative w-full h-24 sm:h-28 flex flex-col items-center justify-center mb-2.5">
                <Skeleton className="size-20 sm:size-24 rounded-full shadow-xs" />
                <div className="w-16 sm:w-20 h-2 sm:h-2.5 rounded-full bg-amber-950/10 blur-xs mt-1" />
              </div>

              {/* Dish Titles */}
              <div className="w-full space-y-1.5 flex flex-col items-center">
                <Skeleton className="h-4 w-20 sm:w-24 rounded-md" />
                <Skeleton className="h-3 w-16 sm:w-20 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. TODAY'S SPECIAL DISH SHOWCASE SKELETON ── */}
      <section className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14 w-full">
        {/* Section Header */}
        <div className="mb-8 text-center space-y-2">
          <div className="inline-flex items-center justify-center">
            <Skeleton className="h-6 w-44 rounded-full bg-terracotta/15" />
          </div>
          <Skeleton className="h-8 sm:h-9 w-64 sm:w-80 rounded-xl mx-auto" />
          <Skeleton className="h-4 w-72 sm:w-96 rounded-md mx-auto" />
        </div>

        {/* 4 Dishes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs"
            >
              <Skeleton className="aspect-[4/3] w-full rounded-t-3xl" />
              <div className="flex flex-1 flex-col p-4 sm:p-5 space-y-2.5">
                <Skeleton className="h-4.5 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
                <Skeleton className="h-3 w-full rounded-md" />
                <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between">
                  <Skeleton className="h-3 w-20 rounded-md" />
                  <Skeleton className="h-4 w-12 rounded-md bg-primary/20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. BRAND STORY BANNER SKELETON ── */}
      <section className="relative mx-auto max-w-6xl px-4 py-6 sm:py-10 w-full">
        <div className="overflow-hidden rounded-[2.5rem] border border-border/80 bg-gradient-to-r from-[#FFFDF9] via-[#FAF4E8] to-[#FFFDF9] p-6 sm:p-10 shadow-xs">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Story Image */}
            <div className="lg:col-span-4">
              <Skeleton className="aspect-[4/3] sm:aspect-square w-full rounded-[2rem]" />
            </div>

            {/* Story Copy */}
            <div className="space-y-4 lg:col-span-5">
              <Skeleton className="h-4 w-24 rounded-full bg-terracotta/20" />
              <Skeleton className="h-8 sm:h-9 w-4/5 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-2/3 rounded-md" />
              </div>
              <Skeleton className="h-10 w-28 rounded-full bg-primary/20 pt-1" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
