import { useState, useMemo } from 'react'
import {
  PartyPopper,
  Users,
  Sparkles,
  Phone,
  MessageCircle,
  CheckCircle2,
  Clock,
  Flame,
  Briefcase,
  Heart,
  Luggage,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/common/reveal'
import { cn } from '@/lib/utils'

// 4 Occasion Types
const OCCASIONS = [
  {
    id: 'family',
    icon: Heart,
    title: 'Family & Kitty Parties',
    gujaratiTitle: 'કૌટુંબિક પ્રસંગ અને મેળાવડો',
    recommendedFor: 'Birthdays, Anniversaries, Vastu',
    badge: '15 to 60 Guests',
    accent: '#D85820',
  },
  {
    id: 'pooja',
    icon: Sparkles,
    title: 'Pooja & Religious Functions',
    gujaratiTitle: 'પૂજા અને ધાર્મિક ઉત્સવ',
    recommendedFor: 'Satyanarayan Katha, Navratri, Diwali',
    badge: 'Jain / No Onion-Garlic',
    accent: '#C9891F',
  },
  {
    id: 'office',
    icon: Briefcase,
    title: 'Office & Corporate Lunches',
    gujaratiTitle: 'ઓફિસ લંચ અને મીટિંગ',
    recommendedFor: 'Team Lunches, Client Meetings, Training',
    badge: 'Individual Boxed Meals',
    accent: '#185834',
  },
  {
    id: 'travel',
    icon: Luggage,
    title: 'Travel & Train Packs',
    gujaratiTitle: 'પ્રવાસ અને ટ્રેન ભાથું',
    recommendedFor: 'Outstation trips, Long Drives, Pilgrimages',
    badge: 'Long-Lasting Freshness',
    accent: '#2A7349',
  },
]

// 3 Catering Packages
const PACKAGES = [
  {
    id: 'standard',
    name: 'Ghar Nu Jaman',
    gujaratiName: 'ઘરનું જમણ',
    pricePerPerson: 149,
    description: 'Wholesome everyday celebration meal',
    items: [
      '2 Seasonal Rasoi Shaak',
      '5 Soft Phulka Rotlis',
      'Gujarati Dal & Steamed Rice',
      'Fresh Mint Chaas',
      'Kachumber & Chutney',
    ],
  },
  {
    id: 'kathiyawadi',
    name: 'Kathiyawadi Dawat',
    gujaratiName: 'કાઠિયાવાડી દાવત',
    pricePerPerson: 219,
    popular: true,
    description: 'Authentic Saurashtra feast with hot rotla',
    items: [
      'Ringan Bharthu & Sev Tameta',
      '2 Clay-Tava Bajra Rotla with Ghee & Jaggery',
      'Vaghareli Khichdi & Desi Kadhi',
      'Lasaniya Marcha & Garlic Chutney',
      'Chilled Masala Chaas',
    ],
  },
  {
    id: 'utsav',
    name: 'Utsav Special Thali',
    gujaratiName: 'ઉત્સવ સ્પેશિયલ થાળી',
    pricePerPerson: 289,
    description: 'Grand festive feast with sweet & farsan',
    items: [
      '2 Royal Gujarati Sabjis',
      '1 Traditional Sweet (Mohanthal/Shrikhand)',
      '1 Fresh Farsan (Dhokla or Samosa)',
      'Pure Ghee Phulkas or Puris',
      'Dal, Bhat, Chaas, Papad & Achar',
    ],
  },
]

// Preset Guest counts for quick selection
const GUEST_COUNTS = [15, 25, 50, 75, 100]

export function OccasionsSection() {
  const [selectedOccasion, setSelectedOccasion] = useState(OCCASIONS[0].id)
  const [guestCount, setGuestCount] = useState(25)
  const [selectedPackage, setSelectedPackage] = useState(PACKAGES[1].id)

  const activeOccasionObj = OCCASIONS.find((o) => o.id === selectedOccasion) || OCCASIONS[0]
  const activePackageObj = PACKAGES.find((p) => p.id === selectedPackage) || PACKAGES[1]

  const estimatedTotal = useMemo(() => {
    return guestCount * activePackageObj.pricePerPerson
  }, [guestCount, activePackageObj])

  // Pre-filled WhatsApp inquiry link
  const whatsappUrl = useMemo(() => {
    const text = encodeURIComponent(
      `Hello FoodIQ! I would like to inquire about bulk catering:\n` +
        `• Occasion: ${activeOccasionObj.title} (${activeOccasionObj.gujaratiTitle})\n` +
        `• Guest Count: ${guestCount} people\n` +
        `• Package: ${activePackageObj.name} (₹${activePackageObj.pricePerPerson}/person)\n` +
        `• Estimated Budget: ~₹${estimatedTotal.toLocaleString('en-IN')}\n\n` +
        `Could you please share your custom menu options and availability?`,
    )
    return `https://wa.me/919999999999?text=${text}`
  }, [activeOccasionObj, guestCount, activePackageObj, estimatedTotal])

  return (
    <section id="occasions" className="relative overflow-hidden bg-[#FAF6EE] py-16 sm:py-20 lg:py-24">
      {/* ── Soft Ambient Background ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-0 size-96 rounded-full bg-[radial-gradient(ellipse_at_center,#C9891F12_0%,transparent_70%)]" />
        <div className="absolute bottom-0 left-0 size-96 rounded-full bg-[radial-gradient(ellipse_at_center,#D8582012_0%,transparent_70%)]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* ── SECTION HEADER ── */}
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-600/30 bg-amber-50/90 px-4 py-1.5 text-xs font-semibold text-amber-950 tracking-wide shadow-xs">
              <PartyPopper className="size-3.5 text-[#D85820] shrink-0" aria-hidden="true" />
              <span>પ્રસંગ અને ઉત્સવ • Celebrations &amp; Bulk Catering</span>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.18]">
              Bring the Taste of Home to{' '}
              <span className="font-serif italic text-[#D85820] font-normal">Your Special Occasions</span>
            </h2>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="font-gujarati text-base sm:text-lg text-primary font-semibold">
              ગૃહપ્રવેશ, પૂજા કે ઓફિસ લંચ — રસભરી રસોઈ, પ્રેમપૂર્વક પીરસાયેલી
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground font-sans max-w-2xl mx-auto">
              From intimate family pujas to office team lunches, we prepare pure homemade meals
              fresh on your schedule. 10 to 150+ guests, cooked with pure groundnut oil and Amul ghee.
            </p>
          </Reveal>
        </div>

        {/* ── 4 OCCASION SELECTOR TILES ── */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {OCCASIONS.map((occ) => {
            const Icon = occ.icon
            const isSelected = occ.id === selectedOccasion

            return (
              <button
                key={occ.id}
                type="button"
                onClick={() => setSelectedOccasion(occ.id)}
                className={cn(
                  'group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer',
                  isSelected
                    ? 'border-[#D85820] bg-white shadow-md ring-2 ring-[#D85820]/15'
                    : 'border-[#EDE4D3] bg-white/70 hover:bg-white hover:border-[#D85820]/40 shadow-2xs',
                )}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        'flex size-10 items-center justify-center rounded-xl transition-transform group-hover:scale-105',
                        isSelected ? 'bg-[#D85820] text-white' : 'bg-amber-500/10 text-[#D85820]',
                      )}
                    >
                      <Icon className="size-5 stroke-[1.8]" />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                      {occ.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-sm sm:text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                      {occ.title}
                    </h3>
                    <p className="font-gujarati text-xs text-[#D85820] font-semibold mt-0.5 leading-tight">
                      {occ.gujaratiTitle}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground mt-2 line-clamp-1 font-sans">
                  {occ.recommendedFor}
                </p>
              </button>
            )
          })}
        </div>

        {/* ── INTERACTIVE CATERING ESTIMATOR & MENU PLANNER ── */}
        <div className="mt-8 rounded-3xl border border-[#EDE4D3] bg-white p-6 sm:p-8 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">

            {/* Left Column: Guest Count & Package Selector */}
            <div className="space-y-6 lg:col-span-7">

              {/* Step A: Guest Count */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Users className="size-3.5 text-primary" />
                    <span>How Many Guests?</span>
                  </label>
                  <span className="text-sm font-bold text-[#D85820]">
                    {guestCount} Guests
                  </span>
                </div>

                {/* Quick Guest Count Buttons */}
                <div className="flex flex-wrap gap-2">
                  {GUEST_COUNTS.map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setGuestCount(count)}
                      className={cn(
                        'px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer',
                        guestCount === count
                          ? 'border-primary bg-primary text-white shadow-xs'
                          : 'border-[#EDE4D3] bg-muted/30 text-foreground hover:bg-muted/80',
                      )}
                    >
                      {count} People
                    </button>
                  ))}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => setGuestCount((c) => Math.max(10, c - 5))}
                      className="size-8 rounded-full border border-[#EDE4D3] flex items-center justify-center font-bold text-sm hover:bg-muted cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold w-10 text-center">{guestCount}</span>
                    <button
                      type="button"
                      onClick={() => setGuestCount((c) => Math.min(300, c + 5))}
                      className="size-8 rounded-full border border-[#EDE4D3] flex items-center justify-center font-bold text-sm hover:bg-muted cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Step B: Choose Meal Package */}
              <div className="space-y-3 pt-2 border-t border-[#EDE4D3]">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" />
                  <span>Choose Your Meal Style</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PACKAGES.map((pkg) => {
                    const isSelected = pkg.id === selectedPackage

                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackage(pkg.id)}
                        className={cn(
                          'relative p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between',
                          isSelected
                            ? 'border-[#D85820] bg-amber-50/50 shadow-xs ring-1 ring-[#D85820]'
                            : 'border-[#EDE4D3] bg-white hover:border-[#D85820]/40',
                        )}
                      >
                        {pkg.popular && (
                          <span className="absolute -top-2 right-2.5 rounded-full bg-[#D85820] text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                            Most Loved
                          </span>
                        )}

                        <div>
                          <p className="font-serif text-sm font-bold text-foreground leading-snug">
                            {pkg.name}
                          </p>
                          <p className="font-gujarati text-xs text-[#D85820] font-semibold mt-0.5">
                            {pkg.gujaratiName}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                            {pkg.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-[#EDE4D3]/60 flex items-baseline justify-between">
                          <span className="text-xs font-bold text-foreground">
                            ₹{pkg.pricePerPerson}
                          </span>
                          <span className="text-[10px] text-muted-foreground">/ person</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Estimate & One-Tap WhatsApp Inquiry */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6 lg:col-span-5 space-y-5">
              <div className="flex items-center justify-between border-b border-primary/15 pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Estimated Budget
                  </span>
                  <p className="text-xs text-muted-foreground">
                    For {guestCount} guests • {activePackageObj.name}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                    ₹{estimatedTotal.toLocaleString('en-IN')}
                  </span>
                  <p className="text-[10px] text-muted-foreground">
                    ₹{activePackageObj.pricePerPerson} per person
                  </p>
                </div>
              </div>

              {/* What's Included List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-foreground">What&apos;s Included:</span>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {activePackageObj.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                      <span className="text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Direct CTAs */}
              <div className="space-y-2 pt-2">
                <Button
                  size="lg"
                  className="w-full h-11 rounded-full bg-[#185834] text-white hover:bg-[#185834]/90 text-sm font-semibold shadow-md pill-tap"
                  asChild
                >
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                    <MessageCircle className="size-4.5" />
                    <span>Inquire via WhatsApp</span>
                  </a>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-10 rounded-full border-primary/30 text-primary hover:bg-primary/10 text-xs font-semibold pill-tap"
                  asChild
                >
                  <a href="tel:+919999999999" className="flex items-center justify-center gap-1.5">
                    <Phone className="size-3.5" />
                    <span>Or Call Us: +91 99999 99999</span>
                  </a>
                </Button>
              </div>

              {/* Delivery Note */}
              <p className="text-[11px] text-center text-muted-foreground leading-tight">
                ⚡ Please order at least 24 hours in advance for bulk batches. Custom Jain and fasting menus available.
              </p>
            </div>

          </div>
        </div>

        {/* ── BOTTOM BULK QUALITY PILLARS ── */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2.5 rounded-2xl border border-[#EDE4D3] bg-white p-3.5 shadow-2xs">
            <Clock className="size-5 text-[#D85820] shrink-0" />
            <div>
              <p className="text-xs font-bold text-foreground">On-Time Delivery</p>
              <p className="text-[10px] text-muted-foreground">Hot at your doorstep</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl border border-[#EDE4D3] bg-white p-3.5 shadow-2xs">
            <Flame className="size-5 text-[#D85820] shrink-0" />
            <div>
              <p className="text-xs font-bold text-foreground">Cooked Fresh Daily</p>
              <p className="text-[10px] text-muted-foreground">Never pre-frozen</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl border border-[#EDE4D3] bg-white p-3.5 shadow-2xs">
            <Sparkles className="size-5 text-primary shrink-0" />
            <div>
              <p className="text-xs font-bold text-foreground">100% Pure Vegetarian</p>
              <p className="text-[10px] text-muted-foreground">Zero onion-garlic option</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl border border-[#EDE4D3] bg-white p-3.5 shadow-2xs">
            <CheckCircle2 className="size-5 text-primary shrink-0" />
            <div>
              <p className="text-xs font-bold text-foreground">Eco Spill-Proof Pack</p>
              <p className="text-[10px] text-muted-foreground">Ready to serve trays</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
