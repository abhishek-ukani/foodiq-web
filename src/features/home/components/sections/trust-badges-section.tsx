import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  Ban,
  Droplets,
  Sparkles,
  CheckCircle2,
  HeartHandshake,
  Award,
  ChevronRight,
} from 'lucide-react'
import { Reveal } from '@/components/common/reveal'
import { cn } from '@/lib/utils'

// Kitchen non-negotiable pledges
const KITCHEN_PLEDGES = [
  {
    id: 'soda',
    icon: Ban,
    accentColor: '#D85820',
    title: 'Zero Baking Soda',
    gujaratiTitle: 'ક્યારેય સોડા નહિ',
    tagline: '100% Natural Fermentation',
    description:
      'We never add baking soda to soften dal, sabji, or dhokla. We give natural slow fermentation and gentle cooking the time they deserve.',
    badge: 'Zero Chemicals',
  },
  {
    id: 'oil',
    icon: Droplets,
    accentColor: '#C9891F',
    title: 'Pure Groundnut Oil & Ghee',
    gujaratiTitle: 'શુદ્ધ સીંગતેલ અને અમૂલ ઘી',
    tagline: 'No Palm Oil, Ever',
    description:
      'Zero palm oil, zero adulterated cottonseed blends. Every tadka is prepared in native cold-pressed groundnut oil (સીંગતેલ) and pure Amul ghee.',
    badge: '100% Cold-Pressed',
  },
  {
    id: 'dairy',
    icon: Award,
    accentColor: '#185834',
    title: '100% Amul Dairy Only',
    gujaratiTitle: 'માત્ર અમૂલ ડેરી પ્રોડક્ટ્સ',
    tagline: 'Gold Standard Purity',
    description:
      'Fresh Amul milk for our homestyle kadhi, creamy curd for fresh mint chaas, and golden Amul butter for warm phulkas & rotla.',
    badge: 'Trusted Quality',
  },
  {
    id: 'water',
    icon: ShieldCheck,
    accentColor: '#2A7349',
    title: 'RO Purified Water',
    gujaratiTitle: 'RO પ્યુરિફાઇડ પાણી',
    tagline: 'Multi-Stage Filtration',
    description:
      'From washing fresh greens and lentils to kneading soft dough and boiling dals — multi-stage RO purified water is used throughout our kitchen.',
    badge: 'Hygienic Cooking',
  },
  {
    id: 'veg',
    icon: Sparkles,
    accentColor: '#185834',
    title: '100% Pure Vegetarian',
    gujaratiTitle: 'શુદ્ધ શાકાહારી રસોઈ',
    tagline: 'Traditional Sacred Kitchen',
    description:
      'A strictly pure vegetarian home kitchen space. No eggs, no non-veg contamination, following timeless Gujarati kitchen cleanliness codes.',
    badge: 'Shuddh Shakahaar',
  },
]

// Trusted Household Pantry Brands
const PANTRY_BRANDS = [
  {
    name: 'Amul',
    category: 'Ghee, Butter & Milk',
    gujaratiCategory: 'શુદ્ધ ઘી અને માખણ',
    standard: '100% Pure Cow & Buffalo Dairy',
    icon: '🥛',
  },
  {
    name: 'Gulab / Farm Kachi Ghani',
    category: 'Filter Groundnut Oil',
    gujaratiCategory: 'શુદ્ધ કાચી ઘાણી સીંગતેલ',
    standard: 'Zero Palm Oil • Native Saurashtra',
    icon: '🥜',
  },
  {
    name: 'Hathi & Ramdev',
    category: 'Whole Sun-Dried Spices',
    gujaratiCategory: 'દેશી હાથે ખાંડેલા મસાલા',
    standard: 'Zero Artificial Color or Starch',
    icon: '🌶️',
  },
  {
    name: 'Sharbati / MP Wheat',
    category: 'Chakki Fresh Atta',
    gujaratiCategory: 'દેશી ઘઉં અને બાજરો',
    standard: 'Stone-Ground 100% Whole Grain',
    icon: '🌾',
  },
  {
    name: 'Tata Salt & Sendha Namak',
    category: 'Pure Himalayan & Iodized',
    gujaratiCategory: 'સિંધવ મીઠું અને શુદ્ધ નમક',
    standard: 'Natural Mineral Balance',
    icon: '🧂',
  },
]

export function TrustBadgesSection() {
  const [activePledgeId, setActivePledgeId] = useState<string>(KITCHEN_PLEDGES[0].id)
  const activePledge = KITCHEN_PLEDGES.find((p) => p.id === activePledgeId) || KITCHEN_PLEDGES[0]

  return (
    <section id="trust-standards" className="relative overflow-hidden bg-background py-16 sm:py-20 lg:py-24">
      {/* ── Soft Warm Ambient Vignette ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-0 size-[32rem] rounded-full bg-[radial-gradient(ellipse_at_center,#C9891F12_0%,transparent_70%)]" />
        <div className="absolute -bottom-10 right-0 size-[36rem] rounded-full bg-[radial-gradient(ellipse_at_center,#18583410_0%,transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle, #8B4513 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* ── SECTION HEADER ── */}
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-600/30 bg-amber-50/80 px-4 py-1.5 text-xs font-semibold text-amber-900 tracking-wide shadow-xs">
              <ShieldCheck className="size-3.5 text-[#D85820] shrink-0" aria-hidden="true" />
              <span>પારદર્શક રસોઈ • 100% Transparent Pantry</span>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.18]">
              The Ingredients We Trust for Our Family,{' '}
              <br className="hidden sm:inline" />
              <span className="font-serif italic text-[#D85820] font-normal">
                Are the Only Ones in Your Meal
              </span>
            </h2>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="font-gujarati text-base sm:text-lg text-primary font-semibold">
              &ldquo;જે અન્ન અમે અમારા બાળકને ખવડાવીએ, એ જ અન્ન તમારા ઘર સુધી પહોંચે છે.&rdquo;
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground font-sans">
              No commercial shortcuts, no synthetic enhancers, and zero palm oil. Here is our
              open-kitchen pledge and the exact pantry staples we cook with every single day.
            </p>
          </Reveal>
        </div>

        {/* ── 5 KITCHEN PLEDGES INTERACTIVE TABS & CARDS ── */}
        <div className="mt-12 sm:mt-16">
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Our 5 Non-Negotiable Kitchen Rules
            </span>
          </div>

          {/* Desktop & Tablet: Interactive 5-Pillar Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {KITCHEN_PLEDGES.map((pledge) => {
              const Icon = pledge.icon
              const isSelected = pledge.id === activePledgeId

              return (
                <button
                  key={pledge.id}
                  type="button"
                  onClick={() => setActivePledgeId(pledge.id)}
                  className={cn(
                    'group relative flex flex-col items-center justify-between p-4 rounded-2xl border text-center transition-all duration-200 cursor-pointer text-left',
                    isSelected
                      ? 'border-[#D85820] bg-white shadow-md ring-2 ring-[#D85820]/15'
                      : 'border-[#EDE4D3] bg-[#FCF8F2] hover:bg-white hover:border-[#D85820]/40 shadow-2xs',
                  )}
                >
                  <div className="space-y-2 flex flex-col items-center">
                    <div
                      className={cn(
                        'flex size-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
                        isSelected ? 'bg-[#D85820] text-white' : 'bg-amber-500/10 text-[#D85820]',
                      )}
                    >
                      <Icon className="size-5.5 stroke-[1.8]" />
                    </div>

                    <div>
                      <h3 className="font-serif text-sm sm:text-base font-bold text-foreground leading-tight">
                        {pledge.title}
                      </h3>
                      <p className="font-gujarati text-xs text-[#D85820] font-semibold mt-0.5">
                        {pledge.gujaratiTitle}
                      </p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      'mt-3 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-colors',
                      isSelected
                        ? 'bg-[#D85820]/10 text-[#D85820]'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {pledge.badge}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Detailed Spotlight Card for the Selected Pledge */}
          <div className="mt-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePledge.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="relative overflow-hidden rounded-3xl border border-[#EDE4D3] bg-gradient-to-r from-white via-[#FCFAF5] to-white p-6 sm:p-8 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <activePledge.icon className="size-6 stroke-[1.8]" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-gujarati font-bold text-sm text-[#D85820]">
                          {activePledge.gujaratiTitle}
                        </span>
                        <span className="text-muted-foreground/40">•</span>
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                          {activePledge.tagline}
                        </span>
                      </div>
                      <h4 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                        {activePledge.title}
                      </h4>
                      <p className="text-sm sm:text-base leading-relaxed text-muted-foreground max-w-2xl font-sans pt-1">
                        {activePledge.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center sm:self-center">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-600/25 px-4 py-2 text-xs font-semibold text-emerald-800">
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      <span>Always Verified Daily</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── PANTRY STAPLES BRAND SEALS SHELF ── */}
        <div className="mt-14 sm:mt-20">
          <div className="text-center space-y-2 mb-8">
            <Reveal>
              <div className="inline-flex items-center gap-1.5 text-xs font-serif italic text-primary">
                <Sparkles className="size-3.5" />
                <span>અમારી રસોઈ પેન્ટ્રી</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Household Brands You Recognize &amp; Respect
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
                No generic white-label drums or commercial food-service substitutes.
                Every dish is cooked using the exact household brands found in proud Gujarati kitchens.
              </p>
            </Reveal>
          </div>

          {/* 5 Brand Seal Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {PANTRY_BRANDS.map((item, idx) => (
              <Reveal key={item.name} delay={idx * 0.06}>
                <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-[#EDE4D3] bg-white p-4 sm:p-5 shadow-2xs hover:border-primary/40 hover:shadow-md transition-all duration-200">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl select-none" role="img" aria-label={item.name}>
                        {item.icon}
                      </span>
                      <span className="font-gujarati text-[11px] font-semibold text-[#D85820]">
                        {item.gujaratiCategory}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-serif text-base sm:text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                        {item.category}
                      </p>
                    </div>

                    <p className="text-[11px] text-muted-foreground/85 leading-snug font-sans">
                      {item.standard}
                    </p>
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-[#EDE4D3]/70 flex items-center justify-between text-[11px] font-semibold text-primary">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" />
                      Standard Pantry
                    </span>
                    <ChevronRight className="size-3 text-muted-foreground/50 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── FOOTER TRUST QUOTE BANNER ── */}
        <Reveal delay={0.2}>
          <div className="mt-12 rounded-3xl border border-amber-600/25 bg-amber-50/70 p-6 sm:p-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#D85820]/15 text-[#D85820]">
                <HeartHandshake className="size-6 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="font-serif text-base sm:text-lg font-bold text-foreground">
                  Our Health &amp; Hygiene Guarantee
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Clean, temperature-controlled kitchen, masked preparation, and fresh stainless steel containers.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex justify-center sm:justify-end">
              <span className="inline-flex items-center gap-2 rounded-full bg-white border border-[#EDE4D3] px-4 py-2 text-xs font-bold text-foreground shadow-2xs">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                FSSAI &amp; Hygiene Compliant
              </span>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  )
}
