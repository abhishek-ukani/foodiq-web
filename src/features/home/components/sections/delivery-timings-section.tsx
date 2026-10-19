import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Sun,
  Moon,
  Clock,
  Truck,
  Flame,
  CirclePause,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/common/reveal'
import { ROUTES } from '@/constants'
import { cn } from '@/lib/utils'
import { useMealTiming } from '@/features/menu/hooks/use-meal-timing'

export function DeliveryTimingsSection() {
  const timing = useMealTiming()

  const lunchCutoff = timing.slots.lunch?.formattedCutoff || '11:30 AM'
  const dinnerCutoff = timing.slots.dinner?.formattedCutoff || '8:00 PM'

  // Calculate live kitchen status based on real database cutoffs
  const currentSlotState = useMemo<'lunch' | 'dinner' | 'tomorrow'>(() => {
    if (timing.isLunchOpen) return 'lunch'
    if (timing.isDinnerOpen) return 'dinner'
    return 'tomorrow'
  }, [timing.isLunchOpen, timing.isDinnerOpen])

  return (
    <section id="delivery-timings" className="relative overflow-hidden bg-[#FAF6EE] py-16 sm:py-20 lg:py-24 border-t border-[#EDE4D3]">
      {/* Soft Ambient Radiance */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-0 size-96 rounded-full bg-[radial-gradient(ellipse_at_center,#C9891F10_0%,transparent_70%)]" />
        <div className="absolute bottom-0 left-0 size-96 rounded-full bg-[radial-gradient(ellipse_at_center,#18583410_0%,transparent_70%)]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* ── SECTION HEADER ── */}
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-600/30 bg-amber-50/90 px-4 py-1.5 text-xs font-semibold text-amber-950 tracking-wide shadow-xs">
              <Clock className="size-3.5 text-[#D85820] shrink-0" aria-hidden="true" />
              <span>રસોઈ અને ડિલિવરી સમય • Daily Tiffin Schedule</span>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.18]">
              Cooked Fresh On Your Schedule,{' '}
              <span className="font-serif italic text-[#D85820] font-normal">Delivered Piping Hot</span>
            </h2>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="font-gujarati text-base sm:text-lg text-primary font-semibold">
              બપોર અને સાંજની તાજી રસોઈ — ક્યારેય ફ્રીઝ કરેલું કે વાસી નહીં
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground font-sans max-w-2xl mx-auto">
              We cook strictly in small batches right before delivery. Soft phulkas, warm dal, and seasonal shaak arrive fresh in spill-proof thermal carriers.
            </p>
          </Reveal>
        </div>

        {/* ── LIVE KITCHEN STATUS PILL ── */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-600/30 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-950 shadow-xs">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-emerald-600" />
            </span>
            <span>
              {currentSlotState === 'lunch' && `Kitchen is accepting orders for Today’s Lunch (Cutoff ${lunchCutoff})`}
              {currentSlotState === 'dinner' && `Kitchen is accepting orders for Tonight’s Dinner (Cutoff ${dinnerCutoff})`}
              {currentSlotState === 'tomorrow' && 'Evening orders closed • Accepting Pre-orders for Tomorrow’s Lunch'}
            </span>
          </div>
        </div>

        {/* ── 2 MEAL SLOTS CARDS ── */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">

          {/* Slot 1: Lunch Tiffin */}
          <div className={cn(
            'group relative flex flex-col justify-between rounded-3xl border p-6 sm:p-8 transition-all duration-200 bg-white shadow-sm',
            currentSlotState === 'lunch'
              ? 'border-[#D85820] ring-2 ring-[#D85820]/15'
              : 'border-[#EDE4D3] hover:border-[#D85820]/40',
          )}>
            <div className="space-y-6">
              {/* Header with Sun Icon */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-900">
                    <Sun className="size-6 text-[#D85820]" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                      Lunch Meal
                    </h3>
                    <p className="font-gujarati text-xs sm:text-sm font-semibold text-[#D85820]">
                      બપોરનું જમણ
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-amber-50 border border-amber-600/25 px-2.5 py-1 text-[11px] font-bold text-amber-900">
                  Cutoff: {lunchCutoff}
                </span>
              </div>

              {/* Timeline Steps */}
              <div className="space-y-3 rounded-2xl bg-[#FAF6EE] p-4 border border-[#EDE4D3]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Clock className="size-3.5 text-primary" />
                    Order Locked By
                  </span>
                  <span className="font-bold text-foreground">{lunchCutoff}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Flame className="size-3.5 text-[#D85820]" />
                    Fresh Cooking Window
                  </span>
                  <span className="font-bold text-foreground">10:30 AM – 11:30 AM</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#EDE4D3]">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-bold text-primary">
                    <Truck className="size-3.5 text-primary" />
                    Doorstep Delivery
                  </span>
                  <span className="font-bold text-primary text-sm">12:00 PM – 2:00 PM</span>
                </div>
              </div>

              {/* Description Pills */}
              <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-muted-foreground">
                <span className="bg-muted/40 px-2.5 py-1 rounded-full">Hot Phulkas &amp; Sabji</span>
                <span className="bg-muted/40 px-2.5 py-1 rounded-full">Gujarati Dal-Rice</span>
                <span className="bg-muted/40 px-2.5 py-1 rounded-full">Chilled Chaas</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6 pt-4 border-t border-[#EDE4D3]">
              <Button
                size="lg"
                className="w-full h-11 rounded-full bg-primary text-white hover:bg-primary/90 text-sm font-semibold shadow-xs pill-tap"
                asChild
              >
                <Link to={`${ROUTES.menu}?meal=lunch&category=thalis`} className="flex items-center justify-center gap-2">
                  <span>Order Lunch Thali</span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Slot 2: Dinner Tiffin */}
          <div className={cn(
            'group relative flex flex-col justify-between rounded-3xl border p-6 sm:p-8 transition-all duration-200 bg-white shadow-sm',
            currentSlotState === 'dinner'
              ? 'border-[#185834] ring-2 ring-[#185834]/15'
              : 'border-[#EDE4D3] hover:border-[#185834]/40',
          )}>
            <div className="space-y-6">
              {/* Header with Moon Icon */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-primary">
                    <Moon className="size-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                      Dinner Meal
                    </h3>
                    <p className="font-gujarati text-xs sm:text-sm font-semibold text-primary">
                      સાંજનું જમણ
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-50 border border-emerald-600/25 px-2.5 py-1 text-[11px] font-bold text-emerald-900">
                  Cutoff: {dinnerCutoff}
                </span>
              </div>

              {/* Timeline Steps */}
              <div className="space-y-3 rounded-2xl bg-[#FAF6EE] p-4 border border-[#EDE4D3]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Clock className="size-3.5 text-primary" />
                    Order Locked By
                  </span>
                  <span className="font-bold text-foreground">{dinnerCutoff}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Flame className="size-3.5 text-[#D85820]" />
                    Fresh Cooking Window
                  </span>
                  <span className="font-bold text-foreground">5:30 PM – 6:30 PM</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#EDE4D3]">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-bold text-primary">
                    <Truck className="size-3.5 text-primary" />
                    Doorstep Delivery
                  </span>
                  <span className="font-bold text-primary text-sm">7:30 PM – 9:30 PM</span>
                </div>
              </div>

              {/* Description Pills */}
              <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-muted-foreground">
                <span className="bg-muted/40 px-2.5 py-1 rounded-full">Bajra Rotlo &amp; Ringan Ollo</span>
                <span className="bg-muted/40 px-2.5 py-1 rounded-full">Desi Kadhi-Khichdi</span>
                <span className="bg-muted/40 px-2.5 py-1 rounded-full">Garlic Chutney</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6 pt-4 border-t border-[#EDE4D3]">
              <Button
                size="lg"
                className="w-full h-11 rounded-full bg-[#185834] text-white hover:bg-[#185834]/90 text-sm font-semibold shadow-xs pill-tap"
                asChild
              >
                <Link to={`${ROUTES.menu}?meal=dinner&category=thalis`} className="flex items-center justify-center gap-2">
                  <span>Order Dinner Thali</span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

        </div>

        {/* ── 4 KITCHEN COMMITMENTS (Zero walls of text) ── */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-[#EDE4D3] bg-white p-4 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2">
              <Flame className="size-4.5 text-[#D85820] shrink-0" />
              <h4 className="font-serif text-xs sm:text-sm font-bold text-foreground">Zero Pre-Cooking</h4>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Every sabji and rotli is cooked only after the batch is locked.
            </p>
          </div>

          <div className="rounded-2xl border border-[#EDE4D3] bg-white p-4 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2">
              <Truck className="size-4.5 text-primary shrink-0" />
              <h4 className="font-serif text-xs sm:text-sm font-bold text-foreground">Thermal Insulated</h4>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Special heat-retaining food containers keep meals hot for 60+ minutes.
            </p>
          </div>

          <div className="rounded-2xl border border-[#EDE4D3] bg-white p-4 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2">
              <CirclePause className="size-4.5 text-[#D85820] shrink-0" />
              <h4 className="font-serif text-xs sm:text-sm font-bold text-foreground">Easy Pause Anytime</h4>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Skip or pause meal delivery anytime before cutoff on WhatsApp.
            </p>
          </div>

          <div className="rounded-2xl border border-[#EDE4D3] bg-white p-4 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4.5 text-primary shrink-0" />
              <h4 className="font-serif text-xs sm:text-sm font-bold text-foreground">On-Time Guarantee</h4>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Consistent daily delivery route within your fixed 30-minute window.
            </p>
          </div>
        </div>

        {/* ── SERVICE CITIES FOOTER ── */}
        <div className="mt-8 text-center text-xs font-medium text-muted-foreground">
          <p className="flex items-center justify-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" />
            <span>Serving fresh homemade tiffins daily across Ahmedabad &amp; Gandhinagar</span>
          </p>
        </div>

      </div>
    </section>
  )
}
