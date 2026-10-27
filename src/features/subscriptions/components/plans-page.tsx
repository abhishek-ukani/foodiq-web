import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Sun,
  Moon,
  UtensilsCrossed,
  ChefHat,
  Sparkles,
  CalendarCheck2,
  Truck,
  HelpCircle,
  Building2,
  CalendarDays,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  useActivePlanVariants,
  useActiveMealOptions,
  useSubscriptionSettings,
} from '../hooks/use-subscriptions'
import { PlanCard } from './plan-card'
import { PlanEnquiryDialog } from './plan-enquiry-dialog'
import { ROUTES } from '@/constants'

export function PlansPage() {
  const [selectedSlot, setSelectedSlot] = useState<'lunch' | 'dinner' | 'both'>('lunch')
  const [selectedThaliId, setSelectedThaliId] = useState<string | null>(null)
  const [enquiryOpen, setEnquiryOpen] = useState(false)

  const { data: variants, isLoading: variantsLoading } = useActivePlanVariants()
  const { data: mealOptions, isLoading: thalisLoading } = useActiveMealOptions()
  const { data: settings } = useSubscriptionSettings()

  // Default to first active thali if none chosen
  const activeThali = useMemo(() => {
    if (!mealOptions?.length) return null
    if (selectedThaliId) {
      const match = mealOptions.find((t) => t.id === selectedThaliId)
      if (match) return match
    }
    return mealOptions[0]
  }, [mealOptions, selectedThaliId])

  const effectiveThaliId = activeThali?.id || null

  return (
    <div className="min-h-screen bg-background">
      {/* ── 1. HERO HEADER ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pt-10 pb-8 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Badge
            variant="outline"
            className="border-primary/40 bg-primary/10 text-primary font-semibold text-xs px-3 py-1 gap-1.5"
          >
            <ChefHat className="size-3.5" />
            Homemade Kathiyawadi Tiffin Plans • Ahmedabad
          </Badge>

          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            Pure Home Taste, Delivered Every Day
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Nutritious, authentic Kathiyawadi thalis cooked fresh with pure ingredients. Enjoy
            hassle-free daily delivery, flexible meal skips that extend your plan, complimentary
            snacks with every meal, and weekly sweet treats.
          </p>

          {/* Quick Nav to My Subscriptions if existing subscriber */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10 min-h-[40px]"
            >
              <Link to={ROUTES.mySubscription}>
                <CalendarDays className="size-3.5" />
                Manage Active Subscription
              </Link>
            </Button>
          </div>
        </div>

        {/* ── 2. MEAL / THALI OPTION SELECTOR ── */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="text-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Step 1: Choose Your Preferred Kathiyawadi Thali
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select which thali meal you want delivered on your subscription. Plan prices adapt automatically.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {thalisLoading
              ? [1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 rounded-2xl bg-muted/60 animate-pulse border" />
                ))
              : mealOptions?.map((thali) => {
                  const isSelected = effectiveThaliId === thali.id
                  return (
                    <button
                      key={thali.id}
                      type="button"
                      onClick={() => setSelectedThaliId(thali.id)}
                      className={`text-left p-3.5 rounded-2xl border-2 transition-all relative flex flex-col justify-between min-h-[88px] ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40'
                          : 'border-border/70 bg-card hover:border-primary/40 hover:bg-muted/40'
                      }`}
                    >
                      <div className="w-full">
                        <div className="flex items-start justify-between gap-1.5 w-full">
                          <span className="font-display font-bold text-sm text-foreground">
                            {thali.name}
                          </span>
                          {isSelected ? (
                            <span className="size-2.5 rounded-full bg-primary shrink-0 mt-1 shadow-xs ring-2 ring-primary/20" />
                          ) : (
                            <span className="size-2.5 rounded-full border border-border/80 shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1.5 leading-snug">
                          {thali.description || 'Authentic Kathiyawadi home-cooked meal'}
                        </p>
                      </div>
                    </button>
                  )
                })}
          </div>
        </div>

        {/* ── 3. MEAL TIMING SELECTOR PILL ── */}
        <div className="max-w-md mx-auto mt-6">
          <div className="text-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Step 2: Choose Delivery Window
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1 p-1 bg-muted/80 rounded-2xl border border-border shadow-xs">
            <button
              type="button"
              onClick={() => setSelectedSlot('lunch')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${
                selectedSlot === 'lunch'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sun className="size-3.5 text-amber-500" />
              <span>Lunch Only</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSlot('dinner')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${
                selectedSlot === 'dinner'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Moon className="size-3.5 text-indigo-500" />
              <span>Dinner Only</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSlot('both')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${
                selectedSlot === 'both'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <UtensilsCrossed className="size-3.5 text-primary" />
              <span>Both Meals</span>
            </button>
          </div>

          <p className="text-[11px] text-center text-muted-foreground mt-2">
            {selectedSlot === 'lunch'
              ? 'Midday hot lunch delivery between 12:00 PM – 01:30 PM'
              : selectedSlot === 'dinner'
                ? 'Evening fresh dinner delivery between 07:00 PM – 08:30 PM'
                : 'Complete daily home meals: hot lunch at noon and fresh dinner in the evening (2 meals/day)'}
          </p>
        </div>
      </section>

      {/* ── 4. PLAN CARDS SHOWCASE ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-8 space-y-1">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Select Your Standard Plan {activeThali ? `for ${activeThali.name}` : ''}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            All plans include generous discounts, complimentary snack with every meal, automated skip extensions, and zero delivery charges.
          </p>
        </div>

        {variantsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-muted/40 animate-pulse border" />
            ))}
          </div>
        ) : variants && variants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {variants.map((variant) => (
              <PlanCard
                key={variant.id}
                variant={variant}
                selectedSlot={selectedSlot}
                selectedThaliId={effectiveThaliId}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-sm text-muted-foreground">
            No active plan variants found. Please check back shortly.
          </div>
        )}
      </section>

      {/* ── 4. WHY CHOOSE FOODIQ TIFFIN ── */}
      <section className="bg-muted/40 border-y border-border/40 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-1 mb-8">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
              Why Ahmedabad Loves FoodIQ Tiffins
            </h3>
            <p className="text-xs text-muted-foreground">
              Cooked with love just like Mom’s kitchen — authentic, fresh, and consistent.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            <div className="p-4 rounded-xl bg-card border text-center space-y-2">
              <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <ChefHat className="size-5" />
              </div>
              <h4 className="font-bold text-sm text-foreground">100% Kathiyawadi</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Authentic Gujarati &amp; Kathiyawadi recipes using fresh daily vegetables and pure spices.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card border text-center space-y-2">
              <div className="size-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <Sparkles className="size-5" />
              </div>
              <h4 className="font-bold text-sm text-foreground">Complimentary Snack 🥟</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Every thali includes a complimentary daily snack (farsan / crisp fryums) at zero extra cost.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card border text-center space-y-2">
              <div className="size-10 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center mx-auto">
                <CalendarCheck2 className="size-5" />
              </div>
              <h4 className="font-bold text-sm text-foreground">Flexible Skips</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Traveling or dining out? Skip with one tap. Your plan automatically extends without losing meals.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card border text-center space-y-2">
              <div className="size-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                <Sparkles className="size-5" />
              </div>
              <h4 className="font-bold text-sm text-foreground">Weekly Sweets 🍬</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Subscribers receive complimentary homemade sweets (Laddoo, Sukhdi, Halwa) every week.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card border text-center space-y-2 col-span-2 lg:col-span-1">
              <div className="size-10 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center mx-auto">
                <Truck className="size-5" />
              </div>
              <h4 className="font-bold text-sm text-foreground">Free Timely Delivery</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Dedicated delivery riders deliver hot tiffins to your doorstep in insulated thermal bags.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. CORPORATE / GROUP PLANS CARD ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-r from-primary/10 via-card to-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Building2 className="size-5 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Office &amp; Bulk Ordering
              </span>
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">
              Corporate &amp; Group Tiffin Plans
            </h3>
            <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
              Managing lunch for your startup, corporate office, or residential hostel? We offer
              custom billing, dedicated bulk packaging, and customized menus.
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => setEnquiryOpen(true)}
            className="shrink-0 font-semibold text-xs bg-primary text-primary-foreground min-h-[44px]"
          >
            Enquire for Group Plan
          </Button>
        </div>
      </section>

      {/* ── 6. FREQUENTLY ASKED QUESTIONS ── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center space-y-1 mb-6">
          <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            <HelpCircle className="size-5 text-primary" />
            Frequently Asked Questions
          </h3>
          <p className="text-xs text-muted-foreground">
            Everything you need to know about how your subscription operates.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-2">
          <AccordionItem value="faq-0" className="border rounded-xl px-4 bg-card">
            <AccordionTrigger className="text-xs sm:text-sm font-semibold hover:no-underline py-3">
              What items are included in each subscription thali?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-3">
              Every subscription thali comes with your choice of hot breads (Phulka Roti or Bhakhari),
              freshly cooked daily sabjis, authentic Kathiyawadi dal or kadhi, and steamed rice. Additionally,
              <strong> a complimentary daily snack (farsan / crisp fryums)</strong> is included free in every single meal!
              Fresh salad, pickle, and weekly sweets (for eligible plans) complete your hearty home-style dining experience.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-1" className="border rounded-xl px-4 bg-card">
            <AccordionTrigger className="text-xs sm:text-sm font-semibold hover:no-underline py-3">
              How do meal skips work if I am traveling or not hungry?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-3">
              You can tap "Skip Meal" on your My Subscription dashboard for any future delivery date
              anytime. On the day of delivery, you can skip up until our morning cooking cutoff (10:00 AM for
              Lunch, 07:00 PM for Dinner). When you skip, your meal is not wasted—we automatically append a
              replacement meal delivery to the end of your plan, pushing your end date forward!
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-2" className="border rounded-xl px-4 bg-card">
            <AccordionTrigger className="text-xs sm:text-sm font-semibold hover:no-underline py-3">
              Can I choose different delivery addresses for Lunch and Dinner?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-3">
              Yes! If you select the "Both (Lunch &amp; Dinner)" plan, you can set your Lunch to be delivered
              to your workplace or office, and your Dinner delivered to your home in Ahmedabad.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-3" className="border rounded-xl px-4 bg-card">
            <AccordionTrigger className="text-xs sm:text-sm font-semibold hover:no-underline py-3">
              What happens on kitchen holidays or festival closures like Diwali?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-3">
              Whenever the kitchen is closed for a festival, vacation, or maintenance, your scheduled
              deliveries are paused automatically. A replacement delivery is added to the end of your
              plan, and this does <strong>never count</strong> against your personal skip limit.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-4" className="border rounded-xl px-4 bg-card">
            <AccordionTrigger className="text-xs sm:text-sm font-semibold hover:no-underline py-3">
              What payment methods are accepted for subscriptions?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-3">
              We accept instant UPI payments (Google Pay, PhonePe, Paytm), Net Banking, and Cash on First
              Delivery. Once your payment is verified, your daily meal ledger is activated.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Enquiry Modal */}
      <PlanEnquiryDialog
        open={enquiryOpen}
        onOpenChange={setEnquiryOpen}
        whatsappNumber={settings?.contact_whatsapp_number}
      />
    </div>
  )
}
