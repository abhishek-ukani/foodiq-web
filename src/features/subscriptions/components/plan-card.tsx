import { Link } from 'react-router-dom'
import { Check, Sparkles, Calendar, ShieldCheck, ArrowRight, Utensils } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSubscriptionQuote } from '../hooks/use-subscriptions'
import { CURRENCY_SYMBOL, ROUTES } from '@/constants'
import type { PlanVariantRow } from '@/types/database.types'

type PlanCardProps = {
  variant: PlanVariantRow
  selectedSlot: 'lunch' | 'dinner' | 'both'
  selectedThaliId?: string | null
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function PlanCard({ variant, selectedSlot, selectedThaliId }: PlanCardProps) {
  const { data: quote, isLoading: quoteLoading } = useSubscriptionQuote(
    variant.id,
    selectedSlot,
    selectedThaliId,
  )

  const isSlotAllowed = (variant.meal_slots_allowed || ['lunch', 'dinner', 'both']).includes(
    selectedSlot,
  )

  const activeDaysStr =
    variant.schedule_type === 'every_other_day'
      ? 'Alternate Days (Every 2nd day)'
      : (variant.delivery_days || [1, 2, 3, 4, 5])
          .map((d) => DAY_NAMES[d - 1])
          .filter(Boolean)
          .join(', ')

  const totalMeals =
    selectedSlot === 'both' ? variant.duration_meal_days * 2 : variant.duration_meal_days

  const checkoutUrl = `${ROUTES.checkoutSubscription}?variant=${variant.slug}&slot=${selectedSlot}${
    selectedThaliId ? `&thali=${selectedThaliId}` : ''
  }`

  return (
    <Card
      className={`relative flex flex-col justify-between overflow-hidden border-2 transition-all duration-300 hover:shadow-md ${
        variant.badge_text
          ? 'border-primary/40 bg-gradient-to-b from-primary/5 via-card to-card'
          : 'border-border/80 bg-card'
      }`}
    >
      {/* Top Banner Badge */}
      {variant.badge_text && (
        <div className="absolute top-0 right-0">
          <span className="inline-block rounded-bl-xl bg-primary px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-xs">
            {variant.badge_text}
          </span>
        </div>
      )}

      <div>
        <CardHeader className="pt-6 pb-3">
          <div className="space-y-1">
            <CardTitle className="font-display text-2xl font-bold text-foreground">
              {variant.name}
            </CardTitle>
            {variant.who_it_is_for && (
              <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <span>🎯</span>
                <span>{variant.who_it_is_for}</span>
              </p>
            )}
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
            {variant.short_description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          {/* Price & Duration Hero Box */}
          <div className="rounded-xl bg-muted/50 p-4 border border-border/50">
            {quoteLoading ? (
              <div className="space-y-2 py-1">
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-4 w-40" />
              </div>
            ) : quote ? (
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-3xl font-extrabold text-foreground">
                        {CURRENCY_SYMBOL}
                        {Math.round(quote.final_price).toLocaleString('en-IN')}
                      </span>
                      {quote.original_price > quote.final_price && (
                        <span className="text-xs font-semibold text-muted-foreground line-through">
                          {CURRENCY_SYMBOL}
                          {Math.round(quote.original_price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    {quote.discount_amount > 0 && (
                      <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        Save {CURRENCY_SYMBOL}{Math.round(quote.discount_amount).toLocaleString('en-IN')} ({quote.discount_percentage}% OFF)
                      </p>
                    )}
                  </div>

                  {quote.discount_percentage > 0 && (
                    <Badge
                      variant="default"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-2.5 py-0.5 shrink-0"
                    >
                      {quote.discount_percentage}% OFF
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground mt-2.5 pt-2 border-t border-border/40">
                  <span>
                    {quote.duration_meal_days} meal-days ({totalMeals} meals)
                  </span>
                  <span className="font-medium text-foreground">
                    {CURRENCY_SYMBOL}
                    {Math.round(quote.final_price / totalMeals)}
                    <span className="text-[10px] text-muted-foreground font-normal"> / meal</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground py-2">
                Select your preferred timing slot
              </div>
            )}
          </div>

          {/* Core Plan Features Checklist */}
          <ul className="space-y-2.5 text-xs text-foreground/90">
            <li className="flex items-start gap-2.5">
              <Calendar className="size-4 shrink-0 text-primary mt-0.5" />
              <div>
                <strong className="text-foreground">Schedule:</strong> {activeDaysStr}
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <Utensils className="size-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong className="text-foreground">Meal Slot:</strong>{' '}
                {selectedSlot === 'lunch'
                  ? 'Midday Lunch Delivery'
                  : selectedSlot === 'dinner'
                    ? 'Evening Dinner Delivery'
                    : 'Both Lunch & Dinner (2 meals/day)'}
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <Check className="size-4 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                Up to <strong>{variant.skip_limit} delivery skips</strong> allowed (extends your
                plan automatically)
              </div>
            </li>

            {/* Complimentary Add-ons in EVERY subscription plan */}
            <li className="flex items-start gap-2.5 text-emerald-900 dark:text-emerald-200 font-medium bg-emerald-50/70 dark:bg-emerald-950/25 p-2 rounded-lg border border-emerald-200/60">
              <Sparkles className="size-4 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <span>Complimentary add-ons included in every meal (Fresh Salad, Gujarati Achar &amp; Chutney) ✨</span>
              </div>
            </li>

            {variant.has_weekly_sweet ? (
              <li className="flex items-start gap-2.5 text-amber-900 dark:text-amber-300 font-medium bg-amber-50/60 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200/50">
                <Sparkles className="size-4 shrink-0 text-amber-600 mt-0.5" />
                <span>Weekly complimentary homemade Kathiyawadi sweet included 🍬</span>
              </li>
            ) : null}

            <li className="flex items-start gap-2.5 text-muted-foreground">
              <ShieldCheck className="size-4 shrink-0 text-primary mt-0.5" />
              <span>Zero delivery fee for subscribers in Ahmedabad zones</span>
            </li>
          </ul>
        </CardContent>
      </div>

      <CardFooter className="pt-2 pb-5">
        {isSlotAllowed ? (
          <Button
            asChild
            size="lg"
            className="w-full gap-2 font-semibold text-sm bg-primary text-primary-foreground shadow-xs hover:bg-primary/95 min-h-[44px]"
          >
            <Link to={checkoutUrl}>
              <span>Subscribe Now</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        ) : (
          <Button disabled size="lg" className="w-full text-xs min-h-[44px]">
            Slot Not Available for this Plan
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
