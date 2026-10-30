import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  PartyPopper,
  Sparkles,
  Phone,
  MessageCircle,
  CheckCircle2,
  Briefcase,
  Heart,
  Luggage,
  Flame,
  Home,
  Gift,
  Sun,
  ChefHat,
  ShieldCheck,
  Users,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/common/reveal'
import { cn } from '@/lib/utils'
import { HeritageCorner } from '@/components/common/heritage-corner'

// 8 Minimalist Occasion Cards (No images, generous empty space, clean typography)
const OCCASIONS = [
  {
    id: 'family',
    title: 'Family Gatherings & Milestones',
    subtitle: 'Birthdays, wedding anniversaries, and reunions with pure homestyle warmth.',
    scale: '10 to 100+ Guests',
    tag: 'Celebration',
    icon: Heart,
  },
  {
    id: 'pooja',
    title: 'Pooja, Hawan & Sacred Rituals',
    subtitle: 'Satyanarayan katha, Navratri, and auspicious ceremonies cooked in pure cow ghee.',
    scale: '15 to 150+ Guests',
    tag: '100% Satvik',
    icon: Sparkles,
  },
  {
    id: 'corporate',
    title: 'Corporate & Team Lunches',
    subtitle: 'Hygienic, individual spill-proof bento meals for team meets and conferences.',
    scale: '10 to 99+ Guests',
    tag: 'Executive',
    icon: Briefcase,
  },
  {
    id: 'housewarming',
    title: 'Housewarming & Griha Pravesh',
    subtitle: 'Bless your new home with auspicious dining and warm Saurashtra hospitality.',
    scale: '20 to 120+ Guests',
    tag: 'New Home',
    icon: Home,
  },
  {
    id: 'wedding-events',
    title: 'Wedding Pre-Events & Mameru',
    subtitle: 'Haldi, Mehendi, Sangeet dinners, and Mameru feasts with royal Gujarati spreads.',
    scale: '25 to 150+ Guests',
    tag: 'Grand Royal',
    icon: Gift,
  },
  {
    id: 'travel',
    title: 'Travel & Tirth Yatra Bhathu',
    subtitle: 'Fresh, long-lasting travel packs with soft Methi Theplas and dry snacks.',
    scale: '5 to 60+ Packs',
    tag: 'Travel Safe',
    icon: Luggage,
  },
  {
    id: 'satsang',
    title: 'Satsang & Bhajan Mandal',
    subtitle: 'Pure satvik prasadam with vaghareli khichdi, kadhi, and traditional sweets.',
    scale: '25 to 130+ Guests',
    tag: 'Bhakti Prasad',
    icon: Sun,
  },
  {
    id: 'society',
    title: 'Community & Society Meets',
    subtitle: 'Festive community celebrations with live counters and grand buffet setups.',
    scale: '30 to 150+ Guests',
    tag: 'Community',
    icon: Users,
  },
]

export function OccasionsSection() {
  // Center card default: middle card
  const [activeIndex, setActiveIndex] = useState(3)

  const activeOccasion = OCCASIONS[activeIndex]

  const generalCustomWhatsAppUrl = `https://wa.me/919999999999?text=${encodeURIComponent(
    `Hello FoodIQ! I am planning a catering order for ${activeOccasion.title} (~${activeOccasion.scale}).\n\n` +
    `I saw your bulk catering starting from ₹1,499 for 10 people. We would like to customize our menu with Kathiyawadi dishes, Punjabi sabjis, and Pav Bhaji / Pulao. Please share options and a direct quote!`,
  )}`

  return (
    <section
      id="occasions"
      className="relative overflow-hidden bg-[#FAF4E6] py-16 sm:py-24 lg:py-28 w-full"
    >
      {/* Decorative ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-0 size-[32rem] rounded-full bg-primary/5 blur-3xl"
      />
      {/* ── Asian / Kathiyawadi Paisley Ornamental Watermark in Corner (Reference Image 2) ── */}
      <HeritageCorner position="top-right" size={260} className="text-primary/18" />

      {/* Expansive Full-Width Container occupying full horizontal screen space */}
      <div className="relative mx-auto max-w-[1440px] w-full px-4 sm:px-6 lg:px-10 xl:px-12">

        {/* ── SECTION HEADER ── */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <PartyPopper className="size-3.5 shrink-0" aria-hidden="true" />
              <span>Bulk &amp; Event Catering</span>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight">
              Catering for Every Celebration &amp; Gathering
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-sm sm:text-base text-muted-foreground font-sans max-w-2xl mx-auto leading-relaxed">
              Pure homemade meals prepared fresh for 10 to 500+ guests. Hover over any card to open and explore.
            </p>
          </Reveal>
        </div>



        {/* ── 3D TILTING CARDS STAGE (Center card flat, flanking cards tilted 45° towards center, switches on mouse hover) ── */}
        <div className="mt-14 sm:mt-20">
          {/* 3D Perspective Stage Container */}
          <div
            className="relative w-full py-10 overflow-hidden [perspective:1400px] select-none"
            style={{ perspectiveOrigin: 'center center' }}
          >
            <div className="flex items-center justify-center min-h-[460px] sm:min-h-[500px] px-2 sm:px-6">
              {OCCASIONS.map((occ, i) => {
                const Icon = occ.icon
                const offset = i - activeIndex
                const isActive = offset === 0

                // 45° Tilt towards the center card:
                // Left cards tilt 45° (rotateY: 45)
                // Right cards tilt -45° (rotateY: -45)
                // Center active card is flat (rotateY: 0)
                let rotateY = 0
                if (offset < 0) rotateY = 45
                if (offset > 0) rotateY = -45

                // Smooth scale and depth calculation
                const scale = isActive ? 1.05 : 0.86
                const zIndex = 40 - Math.abs(offset) * 4
                const opacity = isActive
                  ? 1
                  : Math.max(0.35, 0.82 - Math.abs(offset) * 0.12)

                return (
                  <motion.div
                    key={occ.id}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => setActiveIndex(i)}
                    animate={{
                      rotateY: rotateY,
                      scale: scale,
                      opacity: opacity,
                      zIndex: zIndex,
                      y: isActive ? -12 : 8,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 26,
                    }}
                    style={{
                      transformStyle: 'preserve-3d',
                      transformOrigin: offset < 0 ? 'right center' : offset > 0 ? 'left center' : 'center center',
                    }}
                    className={cn(
                      'relative shrink-0 cursor-pointer transition-[margin] duration-300 ease-out',
                      // Negative margin when tilted so cards tuck behind each other; expands when active
                      isActive
                        ? 'mx-3 sm:mx-6 lg:mx-8'
                        : '-mx-10 sm:-mx-16 md:-mx-20 lg:-mx-24',
                    )}
                  >
                    {/* Animated Card Body - SpectrumHQ style with clean space & radiant border glow */}
                    <div
                      className={cn(
                        'relative rounded-3xl p-7 sm:p-9 flex flex-col justify-between transition-all duration-300',
                        isActive
                          ? 'w-[310px] sm:w-[360px] md:w-[390px] h-[420px] sm:h-[450px] bg-card border-2 border-primary shadow-2xl shadow-primary/15 ring-4 ring-primary/10'
                          : 'w-[260px] sm:w-[290px] md:w-[320px] h-[380px] sm:h-[410px] bg-card/85 backdrop-blur-md border border-border/80 hover:border-primary/50 shadow-md',
                      )}
                    >
                      {/* SpectrumHQ Radiant Glow Accent on Active Card */}
                      {isActive && (
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute -inset-1 rounded-[1.8rem] bg-gradient-to-br from-primary/30 via-secondary/20 to-primary/30 blur-md -z-10"
                        />
                      )}

                      {/* Top Bar: Icon in soft frame + Category Tag */}
                      <div className="flex items-center justify-between">
                        <div
                          className={cn(
                            'size-13 rounded-2xl flex items-center justify-center transition-all duration-300',
                            isActive
                              ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                              : 'bg-accent/80 text-primary',
                          )}
                        >
                          <Icon className="size-6 stroke-[1.8]" />
                        </div>

                        <span
                          className={cn(
                            'text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border transition-colors',
                            isActive
                              ? 'bg-primary/10 text-primary border-primary/30'
                              : 'bg-muted/70 text-muted-foreground border-border/60',
                          )}
                        >
                          {occ.tag}
                        </span>
                      </div>

                      {/* Middle: Generous Empty Space with Clean Editorial Typography */}
                      <div className="my-auto py-6 space-y-3.5">
                        <h4
                          className={cn(
                            'font-display font-bold tracking-tight transition-colors leading-snug',
                            isActive
                              ? 'text-2xl sm:text-3xl text-foreground'
                              : 'text-xl sm:text-2xl text-foreground/80',
                          )}
                        >
                          {occ.title}
                        </h4>

                        <p
                          className={cn(
                            'text-xs sm:text-sm font-sans leading-relaxed transition-colors',
                            isActive
                              ? 'text-muted-foreground'
                              : 'text-muted-foreground/80 line-clamp-2',
                          )}
                        >
                          {occ.subtitle}
                        </p>
                      </div>

                      {/* Bottom Bar: Clean Metadata with Spacious Layout (No bottom WhatsApp button inside card) */}
                      <div className="pt-4 border-t border-border/70 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          <Users className="size-3.5 text-primary" />
                          <span>{occ.scale}</span>
                        </div>

                        <span
                          className={cn(
                            'text-[11px] font-semibold transition-colors',
                            isActive ? 'text-primary' : 'text-muted-foreground',
                          )}
                        >
                          {isActive ? 'Active View' : 'Hover to Open'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Minimalist dot indicator track */}
          <div className="flex justify-center items-center gap-1.5 mt-4">
            {OCCASIONS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to occasion ${idx + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all cursor-pointer',
                  idx === activeIndex
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-border hover:bg-primary/40',
                )}
              />
            ))}
          </div>
        </div>

        {/* ── HIGH-IMPACT CUSTOMIZE & DIRECT QUOTES BANNER ── */}
        <div className="mt-16 sm:mt-24 rounded-3xl border border-primary/25 bg-gradient-to-br from-[#FFFDF9] via-[#FAF4E6] to-[#F5ECE0] p-6 sm:p-10 lg:p-12 shadow-sm relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-primary/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-secondary/15 blur-3xl"
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-8 lg:gap-12">
            {/* Left Content */}
            <div className="space-y-6 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                  <ChefHat className="size-3.5 shrink-0" />
                  <span>100% Customized Food &amp; Menus</span>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-600/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold tracking-wide text-amber-900">
                  <Sparkles className="size-3.5 text-amber-600 shrink-0" />
                  <span>Starting at ₹1,499 per 10 People</span>
                </div>
              </div>

              <div>
                <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight leading-snug">
                  Customized Menus &amp; Direct Chef Quotes
                </h3>
                <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed font-sans max-w-2xl">
                  Every celebration is unique. Apart from standard meals, we prepare and customize food entirely according to your family&apos;s preference, taste, and tradition.
                </p>
              </div>

              {/* Rich Menu Highlights Grid (Kathiyawadi, Punjabi, Pav Bhaji & Pulao, Live Rotla, Jain) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                {/* 1. Kathiyawadi Dishes */}
                <div className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xs p-4 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <Flame className="size-4 shrink-0 text-primary" />
                    <span>All Authentic Kathiyawadi Dishes</span>
                  </div>
                </div>

                {/* 2. Punjabi Sabjis */}
                <div className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xs p-4 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="size-4 shrink-0 text-amber-600" />
                    <span>Rich Punjabi Sabjis</span>
                  </div>
                </div>

                {/* 3. Pav Bhaji & Pulao */}
                <div className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xs p-4 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-orange-700 font-bold text-xs uppercase tracking-wider">
                    <PartyPopper className="size-4 shrink-0 text-orange-600" />
                    <span>Pav Bhaji &amp; Veg Pulao</span>
                  </div>
                </div>

                {/* 4. Live Clay-Tava Bajra Rotla Counter */}
                <div className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xs p-4 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <Flame className="size-4 shrink-0 text-primary" />
                    <span>Live Clay-Tava Rotla Counter</span>
                  </div>
                </div>

                {/* 5. 100% Jain & Swaminarayan Safe */}
                <div className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xs p-4 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
                    <span>100% Pure Jain &amp; Swaminarayan Safe</span>
                  </div>
                </div>

                {/* 6. Tailored to Your Preference */}
                <div className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xs p-4 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="size-4 shrink-0 text-primary" />
                    <span>Customized to Your Taste</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Action Box */}
            <div className="shrink-0 w-full lg:w-[360px] space-y-4 bg-card p-6 sm:p-7 rounded-3xl border border-border/80 shadow-md">
              {/* Highlight Bulk Price Box */}
              <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Bulk Catering Benchmark
                </span>
                <div className="flex items-baseline justify-center gap-1.5 mt-1">
                  <span className="text-3xl sm:text-4xl font-display font-bold text-primary">
                    ₹1,499
                  </span>
                  <span className="text-xs font-semibold text-foreground/85">/ for 10 people</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  No rigid tiers • Scalable to 15, 25, 50, 100+ guests with customized menus
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">
                  Get a Direct Custom Quote
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Selected Occasion: <strong className="text-foreground">{activeOccasion.title}</strong>
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <Button
                  size="lg"
                  className="w-full min-h-[48px] rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold shadow-md active:scale-[0.98] transition-all cursor-pointer"
                  asChild
                >
                  <a
                    href={generalCustomWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="size-4.5" />
                    <span>WhatsApp for Custom Quote</span>
                    <ArrowRight className="size-4" />
                  </a>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full min-h-[44px] rounded-full border-border text-foreground hover:bg-muted text-xs font-semibold cursor-pointer"
                  asChild
                >
                  <a href="tel:+919999999999" className="flex items-center justify-center gap-1.5">
                    <Phone className="size-3.5 text-primary" />
                    <span>Call Us Directly: +91 99999 99999</span>
                  </a>
                </Button>
              </div>

              <div className="pt-2 border-t border-border/60 text-center">
                <p className="text-[10px] text-muted-foreground">
                  ⚡ Direct Chef consultation · Quote in 15 mins · Pure homestyle cooking
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
