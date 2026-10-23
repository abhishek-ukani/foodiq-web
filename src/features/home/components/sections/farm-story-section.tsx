import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sprout,
  CheckCircle2,
  ShieldCheck,
  Award,
  ChevronRight,
  Droplets,
  Wheat,
} from 'lucide-react'
import { Reveal } from '@/components/common/reveal'
import { cn } from '@/lib/utils'

interface IngredientPillar {
  id: string
  icon: string
  title: string
  gujaratiTitle: string
  shortTag: string
  origin: string
  highlight: string
  benefits: string[]
  traditionalMethod: string
}

const INGREDIENTS: IngredientPillar[] = [
  {
    id: 'oil',
    icon: '🥜',
    title: 'Cold-Pressed Groundnut Oil',
    gujaratiTitle: 'કાચી ઘાણીનું સીંગતેલ',
    shortTag: 'Zero Palm Oil',
    origin: 'Native Gir Somnath Magfali Fields',
    highlight: 'Slow-pressed without high heat or chemical refining solvents.',
    benefits: [
      'Authentic nutty aroma and digestive lightness',
      'Naturally rich in monounsaturated good fats & Vitamin E',
      'Zero refined palm, cottonseed, or synthetic blends',
    ],
    traditionalMethod: 'Slow cold expeller press (Kachi Ghani)',
  },
  {
    id: 'ghee',
    icon: '🥛',
    title: 'Pure Dairy & Cow Ghee',
    gujaratiTitle: 'શુદ્ધ ગાયનું ઘી અને માખણ',
    shortTag: 'Zero Margarine',
    origin: 'Gir Gau Seva & Amul Fresh Dairy',
    highlight: 'Warm rotlis and clay-tava rotla are basted in genuine cow ghee.',
    benefits: [
      'Glazed on rotli and melted over jaggery rotlo',
      'Cultured buttermilk (chaas) fresh with mint & roasted jeera',
      'Zero artificial vanaspati or hydrogenated fats',
    ],
    traditionalMethod: 'Traditional bilona churning & gentle simmering',
  },
  {
    id: 'grains',
    icon: '🌾',
    title: 'Saurashtra Black Bajra',
    gujaratiTitle: 'દેશી કાળો બાજરો અને શરબતી ઘઉં',
    shortTag: 'Stone-Ground Daily',
    origin: 'Dry-land Saurashtra Agricultural Farms',
    highlight: 'Native black pearl millet stone-ground every morning for hot rotla.',
    benefits: [
      'High in dietary fiber, iron, and natural minerals',
      'Hand-patted on clay tavas without baking powder',
      'Warm Sharbati wheat for paper-thin soft phulkas',
    ],
    traditionalMethod: 'Slow stone-chakki grinding at cool temperatures',
  },
  {
    id: 'spices',
    icon: '🌶️',
    title: 'Sun-Dried Whole Spices',
    gujaratiTitle: 'હાથે ખાંડેલા મસાલા અને દેશી દાળ',
    shortTag: 'Zero Baking Soda',
    origin: 'Gondal Red Chillies & Unpolished Dals',
    highlight: 'Sun-cured Salem turmeric, cumin seeds, and unpolished lentils.',
    benefits: [
      'Zero artificial yellow food colors or MSG',
      'Naturally aromatic tadka that does not cause acidity',
      'Whole unpolished Tuver & Moong cooked on slow flame',
    ],
    traditionalMethod: 'Hand-pounded mortar & sun drying',
  },
]

export function FarmStorySection() {
  const [activeIngredientId, setActiveIngredientId] = useState(INGREDIENTS[0].id)
  const activeIngredient = INGREDIENTS.find((i) => i.id === activeIngredientId) || INGREDIENTS[0]

  return (
    <section id="farm-roots" className="relative overflow-hidden bg-[#221610] text-[#FAF6EE] py-16 sm:py-24">
      {/* ── Ambient Background Accents ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-0 size-96 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(229,138,19,0.12)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 left-10 size-80 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(196,85,37,0.12)_0%,transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #E58A13 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-12">

        {/* ── SECTION HEADER (High Contrast & Editorial) ── */}
        <div className="mx-auto max-w-3xl text-center space-y-2.5">
          <Reveal>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Sprout className="size-3.5 shrink-0" aria-hidden="true" />
              <span>ખેડૂત વારસો • Soil To Soul</span>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              We Come from the Soil of{' '}
              <span className="font-serif italic text-amber-400 font-normal">Gir Somnath</span>
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-sm sm:text-base text-amber-100/75 font-sans max-w-xl mx-auto leading-relaxed">
              Our kitchen was founded by a farming family. We don&apos;t buy commercial commodity oils or
              refined blends — we source honest, native ingredients directly from Saurashtra fields.
            </p>
          </Reveal>
        </div>

        {/* ── INTERACTIVE 4-PILLAR INGREDIENT INSPECTOR ── */}
        <div className="mt-12 sm:mt-16 grid gap-6 lg:grid-cols-12 lg:items-stretch">

          {/* Left: Interactive Tab Buttons (Mobile Friendly Cards) */}
          <div className="lg:col-span-5 flex flex-col gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-200/60 px-1 mb-1">
              Select an Ingredient to Inspect Purity:
            </span>

            {INGREDIENTS.map((item) => {
              const isSelected = item.id === activeIngredientId

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIngredientId(item.id)}
                  className={cn(
                    'group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer min-h-[58px]',
                    isSelected
                      ? 'border-amber-400/80 bg-[#352219] shadow-[0_0_24px_rgba(229,138,19,0.18)] ring-1 ring-amber-400/40 text-white'
                      : 'border-amber-950/60 bg-[#2A1B14]/80 text-amber-100/90 hover:bg-[#322017] hover:border-amber-800/60',
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-2xl select-none" role="img" aria-label={item.title}>
                      {item.icon}
                    </span>
                    <div>
                      <h3 className="font-display text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-tight">
                        {item.title}
                      </h3>
                      <p className="font-gujarati text-xs text-amber-400/90 font-medium leading-none mt-0.5">
                        {item.gujaratiTitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-block text-[11px] font-semibold text-amber-300 bg-amber-950/90 border border-amber-900/60 px-2.5 py-0.5 rounded-full">
                      {item.shortTag}
                    </span>
                    <ChevronRight
                      className={cn(
                        'size-4 transition-transform',
                        isSelected ? 'text-amber-400 translate-x-1' : 'text-amber-600/70',
                      )}
                    />
                  </div>
                </button>
              )
            })}
          </div>

          {/* Right: Detailed Dynamic Inspection Inspector Card */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIngredient.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="h-full rounded-3xl border border-amber-500/30 bg-[#2A1B14] p-6 sm:p-8 shadow-2xl shadow-black/40 flex flex-col justify-between space-y-6 text-amber-50"
              >
                {/* Header with Origin & Tag */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-900/50 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl select-none">{activeIngredient.icon}</span>
                      <div>
                        <h4 className="font-display text-xl sm:text-2xl font-bold text-white leading-tight">
                          {activeIngredient.title}
                        </h4>
                        <p className="font-gujarati text-sm text-amber-400 font-semibold">
                          {activeIngredient.gujaratiTitle}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-amber-500/20 text-amber-300 px-3 py-1 text-xs font-bold border border-amber-500/40">
                      {activeIngredient.shortTag}
                    </span>
                  </div>

                  {/* Sourcing Origin */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-200/80">
                    <Sprout className="size-4 text-amber-400" />
                    <span>Origin: <strong className="text-white">{activeIngredient.origin}</strong></span>
                  </div>

                  {/* Highlight */}
                  <p className="text-sm sm:text-base leading-relaxed text-amber-100 font-medium pt-1">
                    {activeIngredient.highlight}
                  </p>
                </div>

                {/* 3 Concrete Benefits */}
                <div className="space-y-2.5 bg-[#1A100B] rounded-2xl p-4 sm:p-5 border border-amber-950/80">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400/90">
                    Why It Matters For Your Health:
                  </span>
                  <ul className="space-y-2 text-xs sm:text-sm text-amber-100/90 font-sans">
                    {activeIngredient.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2.5">
                        <CheckCircle2 className="size-4 text-amber-400 mt-0.5 shrink-0 stroke-[2.2]" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Craftsmanship Stamp */}
                <div className="flex items-center justify-between text-xs text-amber-200/70 pt-2 border-t border-amber-900/50">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Award className="size-4 text-amber-400" />
                    Craft Technique: <span className="text-white font-semibold">{activeIngredient.traditionalMethod}</span>
                  </span>
                  <span className="text-emerald-400 font-bold">100% Tested Pure</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* ── CLEAN PURITY BANNER ── */}
        <div className="mt-12 rounded-2xl border border-amber-900/50 bg-[#2A1B14] p-4 sm:p-5 flex flex-wrap items-center justify-around gap-4 text-xs font-semibold text-amber-200/80">
          <div className="flex items-center gap-2 text-white">
            <ShieldCheck className="size-4.5 text-amber-400" />
            <span>100% Pure Vegetarian Kitchen</span>
          </div>
          <span className="hidden sm:inline text-amber-800">·</span>
          <div className="flex items-center gap-2 text-white">
            <Droplets className="size-4.5 text-blue-400" />
            <span>Multi-Stage RO Purified Water</span>
          </div>
          <span className="hidden sm:inline text-amber-800">·</span>
          <div className="flex items-center gap-2 text-white">
            <Wheat className="size-4.5 text-amber-400" />
            <span>Zero Baking Soda &amp; Artificial Colors</span>
          </div>
        </div>

      </div>
    </section>
  )
}
