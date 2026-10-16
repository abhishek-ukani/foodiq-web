import { useState, useMemo } from 'react'
import {
  HandHeart,
  Heart,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  Camera,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/common/reveal'
import { cn } from '@/lib/utils'

// Preset Donation Tiers (Traditional Shubh amounts)
const TIERS = [
  {
    thalis: 1,
    amount: 51,
    title: '1 Thali',
    impact: 'Feeds 1 person a complete wholesome meal',
  },
  {
    thalis: 5,
    amount: 251,
    title: '5 Thalis',
    popular: true,
    impact: 'Feeds a family waiting outside the hospital',
  },
  {
    thalis: 11,
    amount: 551,
    title: '11 Thalis',
    impact: 'Feeds 11 elders at local shelter homes',
  },
  {
    thalis: 21,
    amount: 1100,
    title: '21 Thalis',
    impact: 'Special occasion sadavrat for an entire ward',
  },
]

export function AnnadaanSection() {
  const [selectedThalis, setSelectedThalis] = useState(5)

  // Calculate amount based on selected thalis (₹50 approx / thali with rounded traditional numbers)
  const totalAmount = useMemo(() => {
    const tier = TIERS.find((t) => t.thalis === selectedThalis)
    if (tier) return tier.amount
    return selectedThalis * 51
  }, [selectedThalis])

  const currentImpact = useMemo(() => {
    const tier = TIERS.find((t) => t.thalis === selectedThalis)
    if (tier) return tier.impact
    return `Feeds ${selectedThalis} people a hot, nourishing home-cooked thali`
  }, [selectedThalis])

  // Pre-filled WhatsApp message for donation
  const whatsappUrl = useMemo(() => {
    const text = encodeURIComponent(
      `Pranam FoodIQ team! I would like to contribute towards the Annadaan Initiative (અન્નદાન સેવા):\n` +
        `• Sponsoring: ${selectedThalis} Fresh Thalis\n` +
        `• Contribution: ₹${totalAmount.toLocaleString('en-IN')}\n\n` +
        `Please guide me with the UPI payment details and sharing of distribution photos.`,
    )
    return `https://wa.me/919999999999?text=${text}`
  }, [selectedThalis, totalAmount])

  return (
    <section id="annadaan" className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EC] to-[#FFFDF9] py-16 sm:py-20 lg:py-24 border-t border-[#EDE4D3]">
      {/* Soft Ambient Radiance */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 size-96 rounded-full bg-[radial-gradient(ellipse_at_center,#D8582010_0%,transparent_70%)]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* ── SECTION HEADER ── */}
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-terracotta/30 bg-terracotta/5 px-4 py-1.5 text-xs font-semibold text-terracotta tracking-wide shadow-xs">
              <HandHeart className="size-4 shrink-0 text-terracotta" aria-hidden="true" />
              <span>અન્નદાન એ જ મહાદાન • Annadaan Seva</span>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.18]">
              No One Sleeps Hungry —{' '}
              <span className="font-serif italic text-terracotta font-normal">Sponsor a Fresh Meal</span>
            </h2>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="font-gujarati text-base sm:text-lg text-primary font-semibold">
              &ldquo;જે અન્ન ખવડાવે તે પુણ્ય કમાય&rdquo; — શુદ્ધ અને સાત્વિક સદાવ્રત સેવા
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground font-sans max-w-2xl mx-auto">
              In Kathiyawad and Gujarat, sharing food has always been a sacred tradition.
              Sponsor fresh homemade thalis for hospital attendants, shelter homes, and people in need.
            </p>
          </Reveal>
        </div>

        {/* ── INTERACTIVE SPONSOR CARD ── */}
        <div className="mt-10 sm:mt-14 max-w-3xl mx-auto rounded-3xl border border-[#EDE4D3] bg-white p-6 sm:p-8 shadow-sm">
          <div className="space-y-6">

            {/* Step 1: Select Thali Tier */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Heart className="size-3.5 text-terracotta" />
                  <span>Choose Meals to Sponsor</span>
                </label>
                <span className="text-xs font-bold text-terracotta bg-terracotta/10 px-2.5 py-0.5 rounded-full">
                  ₹51 / Thali
                </span>
              </div>

              {/* 4 Preset Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {TIERS.map((tier) => {
                  const isSelected = selectedThalis === tier.thalis

                  return (
                    <button
                      key={tier.thalis}
                      type="button"
                      onClick={() => setSelectedThalis(tier.thalis)}
                      className={cn(
                        'relative p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center',
                        isSelected
                          ? 'border-terracotta bg-terracotta/5 ring-2 ring-terracotta/20 shadow-xs'
                          : 'border-[#EDE4D3] bg-muted/20 hover:bg-muted/50 hover:border-terracotta/30',
                      )}
                    >
                      {tier.popular && (
                        <span className="absolute -top-2.5 rounded-full bg-terracotta text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-xs">
                          Most Chosen
                        </span>
                      )}
                      <span className="text-sm sm:text-base font-bold text-foreground">
                        {tier.title}
                      </span>
                      <span className="text-xs font-semibold text-terracotta mt-0.5">
                        ₹{tier.amount}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Custom Count Stepper */}
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#EDE4D3] bg-[#FAF6EE] px-4 py-2.5">
                <span className="text-xs font-semibold text-foreground">
                  Custom number of thalis:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedThalis((c) => Math.max(1, c - 1))}
                    className="size-8 rounded-full border border-[#EDE4D3] bg-white flex items-center justify-center font-bold text-sm hover:bg-muted cursor-pointer transition-colors"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold w-12 text-center text-foreground">
                    {selectedThalis}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedThalis((c) => Math.min(100, c + 1))}
                    className="size-8 rounded-full border border-[#EDE4D3] bg-white flex items-center justify-center font-bold text-sm hover:bg-muted cursor-pointer transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Impact Summary & CTA */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-primary/15 pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Your Generous Impact
                  </span>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {currentImpact}
                  </p>
                </div>
                <div className="sm:text-right">
                  <span className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                  <p className="text-[10px] text-muted-foreground">
                    For {selectedThalis} fresh home thalis
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <Button
                  size="lg"
                  className="w-full sm:flex-1 h-11 rounded-full bg-[#185834] text-white hover:bg-[#185834]/90 text-sm font-semibold shadow-md pill-tap"
                  asChild
                >
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                    <MessageCircle className="size-4.5" />
                    <span>Sponsor {selectedThalis} Meals via WhatsApp</span>
                  </a>
                </Button>
              </div>

              <p className="text-[11px] text-center text-muted-foreground leading-tight">
                🙏 100% of your contribution goes toward freshly prepared food. We send distribution photos on WhatsApp after every drive.
              </p>
            </div>

          </div>
        </div>

        {/* ── 3 PILLARS OF ANNADAAN TRANSPARENCY ── */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="flex items-start gap-3 rounded-2xl border border-[#EDE4D3] bg-white p-4 shadow-2xs">
            <div className="size-9 rounded-xl bg-amber-500/10 text-amber-900 flex items-center justify-center shrink-0">
              <Sparkles className="size-4.5 text-terracotta" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-foreground">Same Purity &amp; Taste</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cooked with pure groundnut oil and fresh Amul ghee. Never leftovers or discarded food.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-[#EDE4D3] bg-white p-4 shadow-2xs">
            <div className="size-9 rounded-xl bg-emerald-500/10 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="size-4.5 text-primary" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-foreground">Direct Handover</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Delivered directly to hospital attendants, elderly shelter homes, and sadavrat centers.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-[#EDE4D3] bg-white p-4 shadow-2xs">
            <div className="size-9 rounded-xl bg-blue-500/10 text-blue-800 flex items-center justify-center shrink-0">
              <Camera className="size-4.5 text-blue-700" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-foreground">Photo Transparency</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Every donor receives verified distribution photos and thank-you updates.
              </p>
            </div>
          </div>
        </div>

        {/* ── LIVE IMPACT COUNTER STRIP ── */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-center">
          <div>
            <span className="font-display text-xl sm:text-2xl font-bold text-primary">
              4,280+
            </span>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
              Meals Distributed
            </p>
          </div>
          <span className="text-muted-foreground/30">•</span>
          <div>
            <span className="font-display text-xl sm:text-2xl font-bold text-terracotta">
              100%
            </span>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
              Goes to Food
            </p>
          </div>
          <span className="text-muted-foreground/30">•</span>
          <div>
            <span className="font-display text-xl sm:text-2xl font-bold text-foreground">
              Weekly
            </span>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
              Distribution Drives
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}
