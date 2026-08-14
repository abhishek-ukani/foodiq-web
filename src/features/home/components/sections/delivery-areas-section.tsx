import { useState, useMemo } from 'react'
import { MapPin, Clock, Search, Sparkles, Truck, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { useDeliveryAreas } from '@/features/home/hooks/use-home-queries'
import { CURRENCY_SYMBOL } from '@/constants'

export function DeliveryAreasSection() {
  const { data: areas, isPending, isError, refetch } = useDeliveryAreas()
  const [search, setSearch] = useState('')

  const filteredAreas = useMemo(() => {
    if (!areas) return []
    if (!search.trim()) return areas
    const q = search.toLowerCase().trim()
    return areas.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.pincode.toLowerCase().includes(q) ||
        a.city?.toLowerCase().includes(q),
    )
  }, [areas, search])

  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      {/* Background Subtle Accent */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-96 w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-3xl"
        aria-hidden
      />

      <div className="mx-auto max-w-5xl px-4 text-center">
        {/* Section Pill Header */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
          <MapPin className="size-3.5" aria-hidden />
          Delivery Zones & Neighborhoods
        </div>

        <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Currently serving these neighbourhoods
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-base">
          Enter your address or pincode below to check if we deliver fresh, hot meals directly to your doorstep.
        </p>

        {/* Interactive Search Bar */}
        {areas && areas.length > 0 && (
          <div className="mx-auto mt-8 max-w-md">
            <div className="relative flex items-center">
              <Search className="text-muted-foreground absolute left-3.5 size-4" />
              <Input
                type="text"
                placeholder="Search by neighborhood name or pincode (e.g. Adajan, 395007)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-card/80 border-slate-200 pl-10 pr-4 shadow-sm backdrop-blur transition-all focus:border-emerald-500 focus:ring-emerald-500 dark:border-slate-800"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-muted-foreground hover:text-foreground absolute right-3 text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="mt-10">
          {isPending ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : !areas?.length ? (
            <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-slate-300 bg-card/50 p-8 text-center backdrop-blur dark:border-slate-800">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <MapPin className="size-6" />
              </div>
              <h3 className="text-lg font-semibold">Delivery areas coming soon</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                We are actively setting up our first service areas in Surat. Check back shortly or contact our team for bulk pre-orders.
              </p>
            </div>
          ) : filteredAreas.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-sm">
                No delivery areas matching &quot;<span className="font-semibold text-foreground">{search}</span>&quot;.
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                We&apos;re expanding fast! Contact us if you&apos;d like your area added next.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
              {filteredAreas.map((area) => (
                <div
                  key={area.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-card p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-md dark:border-slate-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg font-bold text-foreground group-hover:text-emerald-600 transition-colors dark:group-hover:text-emerald-400">
                          {area.name}
                        </h3>
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                      </div>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {area.city ?? 'Surat'}{area.state ? `, ${area.state}` : ''}
                      </p>
                    </div>

                    <Badge variant="secondary" className="font-mono text-xs font-semibold tracking-wider">
                      {area.pincode}
                    </Badge>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs dark:border-slate-800/60">
                    <div className="text-muted-foreground flex items-center gap-1.5 font-medium">
                      <Clock className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{area.estimated_minutes ? `~${area.estimated_minutes} mins` : '30-40 mins'}</span>
                    </div>

                    <div className="flex items-center gap-1 font-medium">
                      <Truck className="size-3.5 text-slate-400" />
                      {area.free_delivery_above && area.free_delivery_above > 0 ? (
                        <span className="text-emerald-600 font-semibold dark:text-emerald-400">
                          Free over {CURRENCY_SYMBOL}{area.free_delivery_above}
                        </span>
                      ) : (
                        <span className="text-foreground">
                          {CURRENCY_SYMBOL}{area.delivery_charge} delivery
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Note */}
        {areas && areas.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>Select your delivery slot at checkout for scheduled meal arrival.</span>
          </div>
        )}
      </div>
    </section>
  )
}
