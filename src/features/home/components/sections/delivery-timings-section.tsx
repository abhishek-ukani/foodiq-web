import { Clock, Phone, MapPin, ShoppingBag, Bike, ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/common/reveal'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'

export function DeliveryTimingsSection() {

  return (
    <section
      id="delivery-timings"
      className="relative overflow-hidden bg-[#F3ECE0] py-16 sm:py-24 lg:py-28 text-foreground"
    >
      {/* Subtle Warm Amber Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-0 size-96 rounded-full bg-primary/5 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-0 size-96 rounded-full bg-amber-500/5 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-12">
        {/* ── HEADER: Airy & High-Contrast ── */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12 sm:mb-16">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Clock className="size-3.5 shrink-0" />
              <span>રસોઈ અને ડિલિવરી સમય • Daily Tiffin Schedule</span>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Cooked Fresh On Your Schedule
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-sm sm:text-base text-muted-foreground font-sans max-w-xl mx-auto leading-relaxed">
              Cooked fresh in small batches right before delivery. Place your order before cutoff, or pick up takeaway.
            </p>
          </Reveal>
        </div>

        {/* ── MAIN TWO-COLUMN CONTENT WITH AMPLE EMPTY SPACE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-5xl mx-auto items-stretch">

          {/* LEFT: Spacious Cutoff Card (Lunch & Dinner) */}
          <div className="lg:col-span-7 rounded-[2.5rem] bg-card border border-border/70 p-7 sm:p-10 shadow-sm flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <Clock className="size-4" />
                  Order Cutoff Times
                </span>
                <span className="text-xs text-muted-foreground font-medium">Fresh Daily Batches</span>
              </div>

              {/* Clean 2-Box Timings with Generous Whitespace */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Lunch Box */}
                <div className="rounded-2xl bg-[#FAF5EC] p-6 border border-amber-900/10 space-y-2">
                  <span className="text-lg font-semibold  text-amber-800">
                    Lunch
                  </span>
                  <p className="text-xs text-muted-foreground">Place order by</p>
                  <div className="flex items-baseline gap-1.5 pt-1">
                    <span className="font-display text-4xl sm:text-5xl font-bold text-foreground">
                      10:00
                    </span>
                    <span className="text-sm font-bold text-primary uppercase">AM</span>
                  </div>

                </div>

                {/* Dinner Box */}
                <div className="rounded-2xl bg-[#FAF5EC] p-6 border border-amber-900/10 space-y-2">
                  <span className="text-lg font-semibold  text-amber-800">
                    Dinner
                  </span>
                  <p className="text-xs text-muted-foreground">Place order by</p>
                  <div className="flex items-baseline gap-1.5 pt-1">
                    <span className="font-display text-4xl sm:text-5xl font-bold text-foreground">
                      6:00
                    </span>
                    <span className="text-sm font-bold text-primary uppercase">PM</span>
                  </div>

                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-6 border-t border-border/60 flex flex-wrap items-center gap-4 sm:gap-6">
              <Button
                size="lg"
                className="min-h-[52px] rounded-full bg-white text-primary hover:bg-[#FAF6EE] px-9 text-sm sm:text-base font-bold shadow-xl shadow-black/20 transition-all hover:scale-105 active:scale-95 group/btn cursor-pointer justify-center"
                asChild
              >
                <Link
                  to={ROUTES.menu}
                  onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
                  className="flex items-center gap-2"
                >
                  <span>Order Now</span>
                  <ArrowRight className="size-4.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </Link>
              </Button>

              <a
                href="tel:+919999999999"
                className="inline-flex min-h-[44px] items-center gap-2 text-xs sm:text-sm font-bold text-foreground hover:text-primary transition-colors"
              >
                <Phone className="size-4 text-primary" />
                <span>Call Us Now: +91 99999 99999</span>
              </a>
            </div>
          </div>

          {/* RIGHT: Highlighting Delivery, Takeaway, City & Apps */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
            {/* Delivery & City Highlights */}
            <div className="rounded-[2.5rem] bg-card border border-border/70 p-7 sm:p-8 shadow-sm space-y-6">
              {/* Highlight 1: Free Delivery */}
              <div className="flex items-start gap-4">
                <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Bike className="size-5.5" />
                </div>
                <div>
                  <h4 className="font-display text-base font-bold text-foreground">
                    Free Home Delivery
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Zero delivery charge within 3 km of our local kitchen.
                  </p>
                </div>
              </div>

              {/* Highlight 2: Take-away & No Dine-in */}
              <div className="flex items-start gap-4">
                <div className="size-11 rounded-2xl bg-amber-500/10 text-amber-800 shrink-0 flex items-center justify-center">
                  <ShoppingBag className="size-5.5" />
                </div>
                <div>
                  <h4 className="font-display text-base font-bold text-foreground">
                    Take-away &amp; Delivery Only
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Fresh pickup counter open daily. We are a pure delivery kitchen with no dine-in.
                  </p>
                </div>
              </div>

              {/* Highlight 3: Ahmedabad Exclusivity */}
              <div className="flex items-start gap-4">
                <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-800 shrink-0 flex items-center justify-center">
                  <MapPin className="size-5.5" />
                </div>
                <div>
                  <h4 className="font-display text-base font-bold text-foreground">
                    Exclusively in Ahmedabad
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Operating exclusively across Ahmedabad to guarantee speed, freshness, and piping hot meals.
                  </p>
                </div>
              </div>
            </div>

            {/* Coming Soon on Apps Card */}
            <div className="rounded-[2rem] bg-card border border-border/70 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                  Coming Soon On
                </span>
                <span className="text-xs text-muted-foreground">Order from your favorite platforms</span>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Zomato Badge */}
                <div className="h-10 px-3.5 rounded-xl bg-[#E23744] text-white flex items-center justify-center shadow-xs font-black italic text-xs tracking-tighter">
                  zomato
                </div>

                {/* Swiggy Badge */}
                <div className="h-10 px-3 rounded-xl bg-[#FC8019] text-white flex items-center justify-center shadow-xs font-black text-[11px] tracking-wider uppercase">
                  swiggy
                </div>

                {/* Toing Badge */}
                <div className="h-10 px-3.5 rounded-xl bg-[#07472A] text-[#FF3E7A] flex items-center justify-center shadow-xs font-black text-xs tracking-tight">
                  toing
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}
