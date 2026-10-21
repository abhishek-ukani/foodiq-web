import { motion } from 'framer-motion'
import {
  Sprout,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  HeartHandshake,
} from 'lucide-react'
import { Reveal } from '@/components/common/reveal'

const FARM_HARVEST_IMAGE = '/images/gir-farm-harvest.jpg'

// Farmer commitments (preserved exactly as user liked)
const FARM_COMMITMENTS = [
  'Directly grown & harvested in Gir Somnath',
  'Zero chemical food colors or synthetic soda',
  '100% Cold-pressed edible oils only',
  'Traditional clay-pot & slow-fire techniques',
]

// Single unified 5-ingredient shelf (from 3 separate blocks down to 1 non-repeating shelf)
const UNIFIED_INGREDIENTS = [
  {
    icon: '🥜',
    englishTitle: 'Cold-Pressed Groundnut Oil',
    gujaratiTitle: 'કાચી ઘાણીનું સીંગતેલ',
    tag: 'Never Palm Oil',
    source: 'Native Gir Magfali • Gulab / Kachi Ghani',
    description:
      '100% pure filter groundnut oil extracted slowly without chemical solvents. Zero palm oil, zero cottonseed blends.',
  },
  {
    icon: '🥛',
    englishTitle: '100% Pure Amul Dairy',
    gujaratiTitle: 'શુદ્ધ અમૂલ ઘી, માખણ અને દૂધ',
    tag: 'Zero Margarine',
    source: 'Amul Taaza Milk, Pure Cow Ghee & Butter',
    description:
      'Fresh Amul milk for kadhi and mint chaas. Warm rotlis & rotlo are glazed with pure Amul cow ghee — never vanaspati.',
  },
  {
    icon: '🌾',
    englishTitle: 'Farm Grains & Desi Bajra',
    gujaratiTitle: 'દેશી ઘઉં અને બાજરો',
    tag: 'Stone-Ground Daily',
    source: 'Sharbati Wheat & Saurashtra Black Bajra',
    description:
      'Sun-ripened wheat for soft home phulkas, and native black bajra stone-ground for Kathiyawadi clay-tava rotla.',
  },
  {
    icon: '🌶️',
    englishTitle: 'Sun-Dried Spices & Dals',
    gujaratiTitle: 'હાથે ખાંડેલા મસાલા અને દેશી દાળ',
    tag: 'Zero Baking Soda',
    source: 'Unpolished Dals • Hathi & Ramdev Spices',
    description:
      'Sun-cured turmeric, cumin, and unpolished tuver & moong. Zero baking soda, zero synthetic food colors.',
  },
  {
    icon: '💧',
    englishTitle: 'RO Water & Rock Salt',
    gujaratiTitle: 'RO પાણી અને સિંધવ મીઠું',
    tag: '100% Pure Veg',
    source: 'Multi-Stage RO • Tata Salt & Sendha Namak',
    description:
      'Multi-stage RO purified water for all soaking, boiling, and kneading. 100% pure vegetarian sacred kitchen.',
  },
]

export function FarmStorySection() {
  return (
    <section id="farm-roots" className="relative overflow-hidden bg-[#FAF6EE] py-16 sm:py-20 lg:py-24">
      {/* ── Soft organic background gradient & textile texture ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 right-1/4 size-[32rem] rounded-full bg-[radial-gradient(ellipse_at_center,#2A734912_0%,transparent_70%)]" />
        <div className="absolute bottom-0 left-10 size-[28rem] rounded-full bg-[radial-gradient(ellipse_at_center,#D8582012_0%,transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle, #2A7349 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* ── SECTION HEADER (Preserved exactly) ── */}
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-xs font-semibold text-primary tracking-wide shadow-xs">
              <Sprout className="size-3.5 shrink-0" aria-hidden="true" />
              <span>ખેડૂત પરિવાર • Our Farmer Heritage</span>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.18]">
              We Come from the Soil of{' '}
              <span className="font-serif italic text-primary font-normal">Gir Somnath</span>
            </h2>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="font-gujarati text-base sm:text-lg text-[#D85820] font-semibold">
              સીધું ખેતરમાંથી રસોઈ ઘર સુધી — અમારો વારસો
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground font-sans">
              Long before we started cooking daily meals, our family&apos;s hands worked the fertile
              ground of <strong className="text-foreground font-semibold">Gir Somnath</strong>.
              We are farmers first. We know the difference honest, unadulterated ingredients make
              to your health — because our primary raw materials come straight from our native fields.
            </p>
          </Reveal>
        </div>

        {/* ── 2-COLUMN STORY & VISUAL SPOTLIGHT (Preserved exactly as shown in screenshot) ── */}
        <div className="mt-12 sm:mt-16 grid gap-10 lg:grid-cols-12 lg:items-center">

          {/* Left Column: Farm Harvest Photo + Quote Card */}
          <Reveal className="lg:col-span-6">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              <div
                aria-hidden="true"
                className="absolute -inset-3 rounded-[2.5rem] border border-amber-600/20 bg-amber-500/5 -z-10"
              />

              <div className="relative overflow-hidden rounded-[2.2rem] border border-[#EDE4D3] bg-card p-2 shadow-xl shadow-amber-950/8">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.8rem]">
                  <img
                    src={FARM_HARVEST_IMAGE}
                    alt="Harvesting groundnuts and golden grains in Gir Somnath agricultural farm"
                    className="size-full object-cover transition-transform duration-700 hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />

                  {/* Photo Caption Pill */}
                  <div className="absolute bottom-4 left-4 right-4 text-white drop-shadow-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-medium uppercase tracking-wider text-amber-200">
                          Gir Somnath Agricultural Fields
                        </span>
                        <p className="text-sm sm:text-base font-bold leading-tight">
                          Seasonal Groundnut &amp; Grain Harvest
                        </p>
                      </div>
                      <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-semibold">
                        100% Native
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Farmer Quote Card */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="mt-4 rounded-2xl border border-primary/20 bg-white/90 p-4 sm:p-5 shadow-sm backdrop-blur-xs"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl leading-none">🌿</span>
                  <div className="space-y-1">
                    <p className="font-gujarati text-sm sm:text-base font-semibold text-primary leading-snug">
                      &ldquo;જે અન્નમાં ધરતીનો પરસેવો અને પ્રેમ ભળેલો હોય, એનો સ્વાદ કોઈ ફેક્ટરીમાં ન બને.&rdquo;
                    </p>
                    <p className="font-serif italic text-xs text-muted-foreground">
                      &mdash; When food carries the honest care of the soil, its flavor cannot be replicated.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </Reveal>

          {/* Right Column: Sourcing Commitments & Philosophy */}
          <div className="space-y-6 lg:col-span-6">
            <Reveal delay={0.1}>
              <div className="inline-flex items-center gap-1.5 text-xs font-serif italic text-[#D85820]">
                <Sparkles className="size-3.5" />
                <span>Our Farm Promise</span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-1">
                Real Food Begins in the Field, Not in a Cold Storage
              </h3>
            </Reveal>

            <Reveal delay={0.15}>
              <p className="text-sm sm:text-base leading-relaxed text-muted-foreground font-sans">
                Most cloud kitchens buy mass-produced grains and solvent-extracted vegetable oils in bulk.
                We refuse to do that. We know that real Gujarati food gets its authentic soul from
                <strong className="text-foreground"> cold-pressed groundnut oil (સીંગતેલ)</strong>,
                slow-ground <strong className="text-foreground">desi bajra</strong>, and unpolished pulses
                grown by farmer hands.
              </p>
            </Reveal>

            {/* Checklist of Commitments */}
            <div className="space-y-3 pt-2">
              {FARM_COMMITMENTS.map((item, idx) => (
                <Reveal key={item} delay={0.2 + idx * 0.05}>
                  <div className="flex items-center gap-3 rounded-xl border border-[#EDE4D3] bg-white/70 p-3 shadow-xs">
                    <CheckCircle2 className="size-5 text-primary shrink-0 stroke-[2.2]" />
                    <span className="text-xs sm:text-sm font-semibold text-foreground">
                      {item}
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Quality Seals Row */}
            <Reveal delay={0.4}>
              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[#EDE4D3]">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <ShieldCheck className="size-4 text-primary" />
                  <span>No Palm Oil</span>
                </div>
                <span className="text-muted-foreground/30">•</span>
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <HeartHandshake className="size-4 text-[#D85820]" />
                  <span>Direct Farmer Income</span>
                </div>
                <span className="text-muted-foreground/30">•</span>
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Sprout className="size-4 text-primary" />
                  <span>Zero Adulteration</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* ── SINGLE UNIFIED INGREDIENT SHELF (From 3 separate blocks down to 1 non-repeating shelf) ── */}
        <div className="mt-14 sm:mt-20">
          <div className="text-center space-y-2 mb-8">
            <Reveal>
              <div className="inline-flex items-center gap-1.5 text-xs font-serif italic text-primary">
                <Sparkles className="size-3.5" />
                <span>પારદર્શક સામગ્રી • 100% Transparent Sourcing</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                The 5 Pure Ingredients We Cook With Every Day
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
                No palm oil, no baking soda, no commercial substitutes. Direct farm harvests
                and household staples you recognize and respect.
              </p>
            </Reveal>
          </div>

          {/* 5 Non-Repeating Ingredient Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {UNIFIED_INGREDIENTS.map((item, index) => (
              <Reveal key={item.englishTitle} delay={index * 0.06}>
                <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-[#EDE4D3] bg-white p-4 sm:p-5 shadow-2xs hover:border-primary/40 hover:shadow-md transition-all duration-200">
                  <div className="space-y-2.5">
                    {/* Emoji Icon & Top Tag */}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl select-none" role="img" aria-label={item.englishTitle}>
                        {item.icon}
                      </span>
                      <span className="rounded-full bg-amber-50 border border-amber-600/25 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                        {item.tag}
                      </span>
                    </div>

                    {/* Titles */}
                    <div>
                      <h4 className="font-serif text-sm sm:text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                        {item.englishTitle}
                      </h4>
                      <p className="font-gujarati text-xs text-[#D85820] font-semibold mt-0.5 leading-tight">
                        {item.gujaratiTitle}
                      </p>
                      <p className="text-[11px] font-medium text-muted-foreground mt-1.5 leading-tight">
                        {item.source}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Clean Hygiene & FSSAI Footer Strip */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-semibold text-muted-foreground border-t border-[#EDE4D3] pt-6">
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <CheckCircle2 className="size-4 text-emerald-600" />
              100% Pure Vegetarian Kitchen
            </span>
            <span className="hidden sm:inline text-muted-foreground/30">•</span>
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Multi-Stage RO Water
            </span>
            <span className="hidden sm:inline text-muted-foreground/30">•</span>
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Zero Baking Soda
            </span>
            <span className="hidden sm:inline text-muted-foreground/30">•</span>
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              FSSAI &amp; Hygiene Compliant
            </span>
          </div>
        </div>

      </div>
    </section>
  )
}
