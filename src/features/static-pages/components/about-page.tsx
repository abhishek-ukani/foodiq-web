import { Link } from 'react-router-dom'
import {
  ChefHat,
  Sparkles,
  Heart,
  ShieldCheck,
  Flame,
  Leaf,
  UtensilsCrossed,
  ArrowRight,
  MessageCircle,
  MapPin,
  Clock,
  Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/common/reveal'
import { SectionDivider } from '@/components/common/section-divider'
import { FarmStorySection } from '@/features/home/components/sections/farm-story-section'
import { ROUTES, CONTACT_INFO } from '@/constants'

const IMPACT_STATS = [
  {
    number: '1200+',
    label: 'Homemade Tiffins Served',
    gujarati: 'પ્રેમથી પીરસાયેલું જમણ',
    icon: UtensilsCrossed,
  },
  {
    number: '100%',
    label: 'Double Filtered Groundnut Oil',
    gujarati: 'ગુલાબ ડબલ ફિલ્ટર્ડ સીંગતેલ • No Palm Oil',
    icon: Leaf,
  },
  {
    number: 'Fresh Daily',
    label: 'Cooked Morning & Evening',
    gujarati: 'સવાર-સાંજ તાજી રસોઈ • Never Reheated',
    icon: Clock,
  },
  {
    number: '0%',
    label: 'Soda, MSG or Food Colors',
    gujarati: '૧૦૦% શુદ્ધ અને સાત્ત્વિક',
    icon: ShieldCheck,
  },
]

const KITCHEN_COMMITMENTS = [
  {
    icon: ChefHat,
    title: 'The Owners Are The Chefs',
    gujaratiTitle: 'માલિક પોતે જ શેફ • પોતાના હાથે બનેલું ભોજન',
    description:
      'No outside commercial workers or outsourced cooks. We cook every meal with our own hands — what we cook for our own family is exactly what we serve to our customers.',
  },
  {
    icon: Flame,
    title: 'Daily Fresh Small Batch Cooking',
    gujaratiTitle: 'સવાર અને સાંજ તાજી રસોઈ',
    description:
      'We cook lunch fresh in the morning and dinner fresh in the evening. No morning sabji or dal is ever reheated or reused for dinner meals.',
  },
  {
    icon: ShieldCheck,
    title: 'Strict Pure Veg & Dedicated Jain Rasoi',
    gujaratiTitle: 'શુદ્ધ શાકાહારી અને જૈન ભોજન',
    description:
      'We prepare authentic Jain thalis in separate dedicated vessels and utensils with zero onion, garlic, or root vegetables.',
  },
  {
    icon: Heart,
    title: 'Hand-Patted Rotla & Ghee Phulka',
    gujaratiTitle: 'માટીના તવાનો બાજરો અને ઘી વાળી રોટલી',
    description:
      'Thick black millet rotlas slow-roasted on clay tavas with white butter, and soft Sharbati wheat rotlis basted in pure cow ghee.',
  },
]

export function AboutPage() {
  const whatsappUrl = CONTACT_INFO.whatsappUrl(
    'Hello FoodIQ! I would like to learn more about your monthly tiffin plans and homemade food options.'
  )

  return (
    <div className="flex flex-col min-h-screen overflow-x-clip bg-background">
      {/* ── 1. ABOUT HERO HEADER ── */}
      <section className="relative mx-auto max-w-4xl px-4 pt-16 pb-12 sm:pt-20 sm:pb-16 text-center">
        <Reveal>
          <div className="bg-primary/10 text-primary mx-auto flex size-14 items-center justify-center rounded-2xl border border-primary/20 shadow-xs mb-6">
            <ChefHat className="size-7" aria-hidden />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
            <Sparkles className="size-3.5" aria-hidden />
            <span>અમારી વાર્તા • The FoodIQ Story</span>
          </div>

          <h1 className="font-display text-4xl font-bold sm:text-5xl lg:text-6xl text-foreground tracking-tight leading-tight">
            Home Cooking,{' '}
            <span className="font-serif italic font-normal text-primary">
              Made with Real Care
            </span>
          </h1>

          <p className="font-gujarati text-lg sm:text-xl font-semibold text-primary/90 mt-3">
            {CONTACT_INFO.taglineGujarati}
          </p>

          <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-base sm:text-lg leading-relaxed font-sans">
            FoodIQ is founded and operated by passionate home cooks where the owners themselves are the chefs. Every meal is cooked with our own hands — what we cook for our own family is exactly what we serve to our customers.
          </p>
        </Reveal>
      </section>

      {/* ── 2. IMPACT & TRUST STAT STRIP ── */}
      <section className="border-y border-border/80 bg-muted/40 py-8 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {IMPACT_STATS.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <Reveal key={idx} delay={idx * 0.05}>
                  <div className="text-center space-y-1.5">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                      <Icon className="size-5" />
                    </div>
                    <p className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                      {stat.number}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-foreground/90">
                      {stat.label}
                    </p>
                    <p className="font-gujarati text-[11px] text-muted-foreground">
                      {stat.gujarati}
                    </p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 3. OUR ORIGIN STORY ── */}
      <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left: Emotional narrative */}
          <div className="lg:col-span-7 space-y-6">
            <Reveal>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Our Origin Story
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight pt-1 leading-tight">
                Good Food Should Feel Right, Not Just Taste Good.
              </h2>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed font-sans">
                <p>
                  Living away from home in Ahmedabad taught us how difficult it can be to find everyday food that feels right. Eating out often meant meals with overpowering masalas, concerns about kitchen hygiene, and flavours that didn&apos;t always feel natural.
                </p>
                <p>
                  That inspired FoodIQ — a simple idea to bring everyday food back to its roots: natural flavours, thoughtful cooking, and the comfort of a meal made at home.
                </p>
              </div>
            </Reveal>

            {/* What We Believe In */}
            <Reveal delay={0.08}>
              <div className="space-y-3 pt-1">
                <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
                  What We Believe In
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 rounded-2xl bg-muted/40 p-3.5 border border-border/60">
                    <div className="size-2 rounded-full bg-primary mt-2 shrink-0" />
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans">
                      <strong className="font-bold text-foreground">Let Ingredients Speak</strong> — We believe food should taste like its ingredients, not just the masalas added to it.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-muted/40 p-3.5 border border-border/60">
                    <div className="size-2 rounded-full bg-primary mt-2 shrink-0" />
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans">
                      <strong className="font-bold text-foreground">Cook with Care</strong> — Our family prepares every meal ourselves, with personal attention to the food we serve.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-muted/40 p-3.5 border border-border/60">
                    <div className="size-2 rounded-full bg-primary mt-2 shrink-0" />
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans">
                      <strong className="font-bold text-foreground">Keep It Simple</strong> — We prefer balanced flavours and a lighter hand with strong masalas, onion, and garlic.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-sans pt-1">
                FoodIQ is not just about serving meals. It&apos;s about bringing back the feeling of eating food you can feel good about, made by people who care about what reaches your plate.
              </p>
            </Reveal>
          </div>

          {/* Right: One Family, One Kitchen Card */}
          <div className="lg:col-span-5">
            <Reveal delay={0.1}>
              <div className="relative rounded-3xl bg-gradient-to-br from-primary/10 via-amber-500/10 to-primary/5 p-8 border border-primary/20 shadow-md space-y-6">
                <div className="size-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                  <Heart className="size-6" />
                </div>

                <div className="space-y-3">
                  <p className="font-serif italic text-lg sm:text-xl text-foreground font-medium leading-snug">
                    &ldquo;One family. One kitchen in Bodakdev. One promise: food made with the same care we value at home.&rdquo;
                  </p>
                  <p className="font-gujarati text-xs sm:text-sm text-primary font-semibold">
                    &ldquo;અમારા માટે રસોઈ માત્ર ભોજન નથી, પ્રેમ અને શુદ્ધ ભાવનાથી તૈયાર કરેલો પ્રસાદ છે.&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-border/60 text-xs space-y-2 text-muted-foreground">
                  <p className="font-semibold text-foreground uppercase tracking-wider text-[11px]">The FoodIQ Promise</p>
                  <p className="flex items-center gap-2 text-foreground/80">
                    <span>👨‍🍳</span>
                    <span>Cooked by our family • Zero outside workers</span>
                  </p>
                  <p className="flex items-center gap-2 text-foreground/80">
                    <span>🌱</span>
                    <span>100% Pure Vegetarian &amp; Dedicated Jain options</span>
                  </p>
                  <p className="flex items-center gap-2 text-foreground/80">
                    <span>📍</span>
                    <span>One kitchen in Bodakdev • No branches</span>
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 4. OUR DAILY KITCHEN RITUALS (4 PILLARS) ── */}
      <section className="py-16 sm:py-20 bg-muted/30 border-t border-border/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-12 sm:mb-16">
            <Reveal>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Our Cooking Standards
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                How We Cook Everyday
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Four steadfast commitments behind every thali and tiffin box we deliver.
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {KITCHEN_COMMITMENTS.map((item, idx) => {
              const Icon = item.icon
              return (
                <Reveal key={idx} delay={idx * 0.05}>
                  <div className="h-full rounded-2xl bg-card border border-border/80 p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-3">
                    <div className="space-y-3">
                      <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="size-5.5" />
                      </div>
                      <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
                        {item.title}
                      </h3>
                      <p className="font-gujarati text-xs font-semibold text-primary">
                        {item.gujaratiTitle}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Transition to Deep Clay Farm Roots */}
      <SectionDivider
        variant="mandala"
        fromColor="text-muted/30"
        toColor="bg-[#221610]"
      />

      {/* ── 5. FARM ROOTS & INGREDIENT INSPECTOR (Interactive Deep-Dive) ── */}
      <FarmStorySection bgClassName="bg-[#221610]" />

      {/* Transition from Farm Roots back to Warm Background */}
      <SectionDivider
        variant="straight"
        fromColor="text-[#221610]"
        toColor="bg-background"
      />

      {/* ── 6. COMMUNITY & ANNADAAN SERVICE ── */}
      <section className="py-14 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-8 sm:p-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8 text-center md:text-left">
            <div className="size-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm">
              <Award className="size-8" />
            </div>
            <div className="space-y-2 flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                અન્નદાન સેવા • Giving Back
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                Food is a Blessing to be Shared
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                Every week, FoodIQ prepares and serves nutritious community meals for underprivileged families across Ahmedabad through our Annadaan initiative. When you order your daily meal with us, you help support our mission of feeding those in need.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── 7. WARM BRAND INVITATION CTA (No E-Commerce 4-Step Clutter) ── */}
      <section className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 mb-12">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#8a2e0a] via-[#702406] to-[#3d1404] p-8 sm:p-12 text-white shadow-xl text-center space-y-6">
            <div className="max-w-2xl mx-auto space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold uppercase tracking-wider text-amber-200">
                <Sparkles className="size-3.5 text-amber-300" />
                <span>Taste True Home Cooking</span>
              </span>

              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                Ready for Wholesome Daily Meals?
              </h2>

              <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-sans max-w-xl mx-auto">
                Explore our rotating daily lunch and dinner menus, or talk to our kitchen team about setting up a monthly tiffin subscription.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Button
                size="lg"
                className="min-h-[48px] w-full sm:w-auto rounded-full bg-white text-primary hover:bg-[#FAF6EE] px-8 text-sm font-bold shadow-md transition-all cursor-pointer"
                asChild
              >
                <Link
                  to={ROUTES.menu}
                  onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
                  className="flex items-center gap-2 justify-center"
                >
                  <span>Explore Today&apos;s Menu</span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="min-h-[48px] w-full sm:w-auto rounded-full border-white/35 bg-white/10 hover:bg-white/20 text-white hover:text-white px-8 text-sm font-bold backdrop-blur-md transition-all cursor-pointer"
                asChild
              >
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 justify-center"
                >
                  <MessageCircle className="size-4 text-emerald-400" />
                  <span>Inquire on WhatsApp</span>
                </a>
              </Button>

              <Button
                size="lg"
                variant="ghost"
                className="min-h-[48px] w-full sm:w-auto rounded-full text-white/80 hover:text-white hover:bg-white/10 px-6 text-sm font-medium transition-all cursor-pointer"
                asChild
              >
                <Link
                  to={ROUTES.contact}
                  onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
                  className="flex items-center gap-1.5 justify-center"
                >
                  <MapPin className="size-4" />
                  <span>Contact &amp; Location</span>
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
