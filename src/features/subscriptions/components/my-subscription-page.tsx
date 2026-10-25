import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import {
  CalendarDays,
  Sparkles,
  MapPin,
  RotateCcw,
  SkipForward,
  Sun,
  Moon,
  UtensilsCrossed,
  ChefHat,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import {
  useMySubscriptions,
  useMySubscriptionLedger,
  useSubscriptionSettings,
  useSkipDeliveryDay,
  useUndoSkipDeliveryDay,
} from '../hooks/use-subscriptions'
import { ROUTES } from '@/constants'
import type { CustomerSubscriptionLedgerItem } from '../services/subscription-service'

dayjs.extend(isSameOrAfter)

export function MySubscriptionPage() {
  const { data: subscriptions, isLoading: subsLoading } = useMySubscriptions()
  const { data: settings } = useSubscriptionSettings()

  const [selectedSubId, setSelectedSubId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'delivered' | 'skipped'>('upcoming')

  // Target item for skip action
  const [skipTarget, setSkipTarget] = useState<CustomerSubscriptionLedgerItem | null>(null)
  const [undoTarget, setUndoTarget] = useState<CustomerSubscriptionLedgerItem | null>(null)

  // Current active or selected subscription
  const currentSub = useMemo(() => {
    if (!subscriptions?.length) return null
    if (selectedSubId) {
      const match = subscriptions.find((s) => s.id === selectedSubId)
      if (match) return match
    }
    // Prefer active or pending_payment, fallback to first
    return subscriptions.find((s) => s.status === 'active') || subscriptions[0]
  }, [subscriptions, selectedSubId])

  // Meal ledger query
  const { data: ledger, isLoading: ledgerLoading } = useMySubscriptionLedger(currentSub?.id)

  const skipMutation = useSkipDeliveryDay(currentSub?.id || '')
  const undoMutation = useUndoSkipDeliveryDay(currentSub?.id || '')

  const todayStr = dayjs().format('YYYY-MM-DD')
  const currentTimeStr = dayjs().format('HH:mm:ss')

  const lunchCutoff = settings?.lunch_skip_cutoff_time || '10:00:00'
  const dinnerCutoff = settings?.dinner_skip_cutoff_time || '19:00:00'

  // Progress metrics calculation
  const metrics = useMemo(() => {
    if (!ledger?.length) {
      return {
        totalMeals: 0,
        deliveredCount: 0,
        scheduledCount: 0,
        skippedCount: 0,
        progressPercent: 0,
        lastScheduledDate: null as string | null,
      }
    }

    const totalMeals = ledger.length
    const deliveredCount = ledger.filter((d) => d.status === 'delivered').length
    const scheduledCount = ledger.filter((d) => d.status === 'scheduled').length
    const skippedCount = ledger.filter((d) => d.status === 'skipped').length
    const progressPercent = Math.min(Math.round((deliveredCount / totalMeals) * 100), 100)

    const scheduledDays = ledger
      .filter((d) => d.status === 'scheduled')
      .map((d) => d.delivery_date)
      .sort()

    const lastScheduledDate = scheduledDays.length
      ? scheduledDays[scheduledDays.length - 1]
      : null

    return {
      totalMeals,
      deliveredCount,
      scheduledCount,
      skippedCount,
      progressPercent,
      lastScheduledDate,
    }
  }, [ledger])

  // Filtered deliveries list
  const filteredLedger = useMemo(() => {
    if (!ledger?.length) return []
    if (filterStatus === 'all') return ledger
    if (filterStatus === 'upcoming') {
      return ledger.filter(
        (d) =>
          d.status === 'scheduled' &&
          (d.delivery_date > todayStr || d.delivery_date === todayStr),
      )
    }
    if (filterStatus === 'delivered') {
      return ledger.filter((d) => d.status === 'delivered')
    }
    if (filterStatus === 'skipped') {
      return ledger.filter((d) => d.status === 'skipped')
    }
    return ledger
  }, [ledger, filterStatus, todayStr])

  // Helper to check if a delivery can be skipped
  const canSkip = (item: CustomerSubscriptionLedgerItem) => {
    if (item.status !== 'scheduled') return false
    if (metrics.skippedCount >= (currentSub?.skip_limit ?? 0)) return false

    // Past date
    if (item.delivery_date < todayStr) return false

    // Future date: always allowed
    if (item.delivery_date > todayStr) return true

    // Today's delivery: check slot cutoff
    if (item.meal_slot === 'lunch') {
      return currentTimeStr < lunchCutoff
    }
    if (item.meal_slot === 'dinner') {
      return currentTimeStr < dinnerCutoff
    }
    return currentTimeStr < lunchCutoff
  }

  // Helper to check if a skip can be undone
  const canUndo = (item: CustomerSubscriptionLedgerItem) => {
    if (item.status !== 'skipped') return false
    if (!settings?.allow_undo_skip) return false

    if (item.delivery_date < todayStr) return false
    if (item.delivery_date > todayStr) return true

    if (item.meal_slot === 'lunch') return currentTimeStr < lunchCutoff
    if (item.meal_slot === 'dinner') return currentTimeStr < dinnerCutoff
    return currentTimeStr < lunchCutoff
  }

  const handleConfirmSkip = async () => {
    if (!skipTarget) return
    await skipMutation.mutateAsync({ dayId: skipTarget.id })
    setSkipTarget(null)
  }

  const handleConfirmUndo = async () => {
    if (!undoTarget) return
    await undoMutation.mutateAsync(undoTarget.id)
    setUndoTarget(null)
  }

  if (subsLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  // Empty state: no subscriptions
  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <EmptyState
          icon={ChefHat}
          title="No Active Tiffin Plan"
          description="Enjoy fresh homemade Kathiyawadi lunch and dinner delivered daily with free delivery and flexible meal skips."
          action={
            <Button asChild size="lg" className="gap-2 bg-primary text-primary-foreground min-h-[44px]">
              <Link to={ROUTES.plans}>
                <span>Explore Meal Plans</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  const isRenewalDue =
    metrics.scheduledCount > 0 &&
    metrics.scheduledCount <= (currentSub?.renewal_reminder_threshold ?? 3)

  return (
    <div className="min-h-screen bg-background pb-16 pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Page Title & Plan Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
              My Tiffin Subscription
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Live delivery progress, skip management, and plan schedule.
            </p>
          </div>

          {subscriptions.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Select Plan:</span>
              <select
                value={currentSub?.id}
                onChange={(e) => setSelectedSubId(e.target.value)}
                className="text-xs bg-muted/60 border rounded-lg px-2.5 py-1.5 font-medium"
              >
                {subscriptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.plan_variants?.name || 'Tiffin Plan'} ({s.status})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ── 1. ACTIVE SUBSCRIPTION OVERVIEW CARD ── */}
        {currentSub && (
          <Card className="border-2 border-primary/20 bg-card shadow-sm overflow-hidden">
            <CardHeader className="p-5 pb-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="font-display text-xl sm:text-2xl font-bold text-foreground">
                      {currentSub.meal_thalis?.name || (currentSub.thali_snapshot as any)?.name || 'Regular Thali'}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs font-semibold bg-primary/10 text-primary border-primary/30">
                      {currentSub.plan_variants?.name || 'Standard Plan'}
                    </Badge>
                    <Badge
                      variant={
                        currentSub.status === 'active'
                          ? 'default'
                          : currentSub.status === 'pending_payment'
                            ? 'outline'
                            : 'secondary'
                      }
                      className={`text-xs font-semibold capitalize ${
                        currentSub.status === 'active'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : currentSub.status === 'pending_payment'
                            ? 'border-amber-400 bg-amber-50 text-amber-800'
                            : ''
                      }`}
                    >
                      {currentSub.status === 'pending_payment'
                        ? 'Pending Payment Verification'
                        : currentSub.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Subscription ID:{' '}
                    <span className="font-mono font-medium">{currentSub.subscription_number}</span>
                    {currentSub.meal_thalis?.price ? ` • ₹${currentSub.meal_thalis.price}/thali standard` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-semibold gap-1 py-1 px-2.5">
                    {currentSub.meal_slot === 'lunch' ? (
                      <>
                        <Sun className="size-3.5 text-amber-500" />
                        <span>Lunch Only</span>
                      </>
                    ) : currentSub.meal_slot === 'dinner' ? (
                      <>
                        <Moon className="size-3.5 text-indigo-500" />
                        <span>Dinner Only</span>
                      </>
                    ) : (
                      <>
                        <UtensilsCrossed className="size-3.5 text-primary" />
                        <span>Both (Lunch + Dinner)</span>
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 pt-3 space-y-4">
              {/* Progress Bar & Meal Counts */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Meal Delivery Progress</span>
                  <span className="font-bold text-foreground">
                    {metrics.deliveredCount} of {metrics.totalMeals} meals delivered ({metrics.progressPercent}%)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500 rounded-full"
                    style={{ width: `${metrics.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Stat Highlights Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-muted/50 border text-center">
                  <p className="text-[11px] text-muted-foreground">Remaining Meals</p>
                  <p className="text-lg font-bold text-foreground mt-0.5">
                    {metrics.scheduledCount}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/50 border text-center">
                  <p className="text-[11px] text-muted-foreground">Skips Remaining</p>
                  <p className="text-lg font-bold text-foreground mt-0.5">
                    {Math.max(0, currentSub.skip_limit - metrics.skippedCount)} / {currentSub.skip_limit}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/50 border text-center">
                  <p className="text-[11px] text-muted-foreground">Plan Started</p>
                  <p className="text-sm font-semibold text-foreground mt-1">
                    {dayjs(currentSub.start_date).format('MMM D, YYYY')}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/50 border text-center">
                  <p className="text-[11px] text-muted-foreground">Estimated End Date</p>
                  <p className="text-sm font-semibold text-primary mt-1">
                    {metrics.lastScheduledDate
                      ? dayjs(metrics.lastScheduledDate).format('MMM D, YYYY')
                      : 'Completed'}
                  </p>
                </div>
              </div>

              {/* Delivery Address & Contact */}
              {currentSub.addresses && (
                <div className="flex items-start gap-2 pt-2 border-t text-xs text-muted-foreground">
                  <MapPin className="size-4 shrink-0 text-primary mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">Delivering to: </span>
                    {currentSub.addresses.address_line1}
                    {currentSub.addresses.address_line2 ? `, ${currentSub.addresses.address_line2}` : ''}
                    {currentSub.addresses.landmark ? ` (Near ${currentSub.addresses.landmark})` : ''},{' '}
                    {currentSub.addresses.city} {currentSub.addresses.pincode}
                  </div>
                </div>
              )}

              {/* Complimentary Add-ons Note */}
              <div className="flex items-center gap-2 pt-2 border-t text-xs text-emerald-700 dark:text-emerald-300">
                <Sparkles className="size-3.5 shrink-0 text-emerald-600" />
                <span>
                  <strong>Complimentary Add-ons Included:</strong> Fresh salad, authentic Gujarati pickle, and chutney are delivered with every meal.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── 2. RENEWAL BANNER (Triggered when remaining meals <= threshold) ── */}
        {isRenewalDue && (
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/80 dark:bg-amber-950/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-full bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
                <Sparkles className="size-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-amber-950 dark:text-amber-200">
                  Your Plan is Ending Soon ({metrics.scheduledCount} meals left)
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  Renew now to ensure your home meals continue smoothly without missing a single day.
                </p>
              </div>
            </div>
            <Button
              asChild
              size="sm"
              className="shrink-0 bg-primary text-primary-foreground font-semibold text-xs min-h-[40px]"
            >
              <Link to={ROUTES.plans}>Renew Subscription &rarr;</Link>
            </Button>
          </div>
        )}

        {/* ── 3. INTERACTIVE MEAL LEDGER & CALENDAR ── */}
        <Card>
          <CardHeader className="p-5 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="font-display text-lg font-bold flex items-center gap-2">
                  <CalendarDays className="size-4.5 text-primary" />
                  Your Delivery Schedule
                </CardTitle>
                <CardDescription className="text-xs">
                  Review daily status, skip meals with one tap, or view past deliveries.
                </CardDescription>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border text-xs">
                {(['upcoming', 'all', 'delivered', 'skipped'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setFilterStatus(tab)}
                    className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                      filterStatus === tab
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-1">
            {ledgerLoading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : filteredLedger.length > 0 ? (
              <div className="divide-y divide-border/60">
                {filteredLedger.map((item) => {
                  const isToday = item.delivery_date === todayStr
                  const skipAllowed = canSkip(item)
                  const undoAllowed = canUndo(item)

                  return (
                    <div
                      key={item.id}
                      className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        isToday ? 'bg-primary/5 -mx-5 px-5 rounded-lg' : ''
                      }`}
                    >
                      {/* Left: Date, Slot & Status */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`size-11 rounded-xl flex flex-col items-center justify-center shrink-0 border text-center ${
                            isToday
                              ? 'border-primary bg-primary text-primary-foreground font-bold'
                              : 'border-border/80 bg-muted/40 text-foreground'
                          }`}
                        >
                          <span className="text-[10px] uppercase font-bold leading-none">
                            {dayjs(item.delivery_date).format('ddd')}
                          </span>
                          <span className="text-base font-extrabold leading-none mt-1">
                            {dayjs(item.delivery_date).format('D')}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-xs sm:text-sm text-foreground">
                              {dayjs(item.delivery_date).format('dddd, MMMM D, YYYY')}
                            </span>
                            {isToday && (
                              <Badge variant="default" className="text-[10px] py-0 px-2 font-bold">
                                Today
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            <Badge variant="outline" className="text-[10px] py-0 px-2 font-semibold bg-muted/40 text-foreground">
                              {item.meal_thali?.name || (currentSub?.thali_snapshot as any)?.name || 'Regular Thali'}
                            </Badge>

                            <span className="text-muted-foreground flex items-center gap-1">
                              {item.meal_slot === 'lunch' ? (
                                <>
                                  <Sun className="size-3.5 text-amber-500" />
                                  <span>Lunch</span>
                                </>
                              ) : item.meal_slot === 'dinner' ? (
                                <>
                                  <Moon className="size-3.5 text-indigo-500" />
                                  <span>Dinner</span>
                                </>
                              ) : (
                                <span>{item.meal_slot}</span>
                              )}
                            </span>

                            {/* Status Pill */}
                            <Badge
                              variant="outline"
                              className={`text-[10px] py-0 px-2 font-semibold capitalize ${
                                item.status === 'delivered'
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                  : item.status === 'scheduled'
                                    ? 'border-amber-300 bg-amber-50 text-amber-800'
                                    : item.status === 'skipped'
                                      ? 'border-slate-300 bg-slate-100 text-slate-700 line-through'
                                      : 'border-red-300 bg-red-50 text-red-800'
                              }`}
                            >
                              {item.status === 'kitchen_cancelled'
                                ? 'Kitchen Closure (Shifted)'
                                : item.status}
                            </Badge>

                            {/* Weekly sweet indicator */}
                            {item.includes_sweet && (
                              <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-1 bg-amber-100/60 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                                <span>🍬</span>
                                <span>Complimentary Sweet Day</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions (Skip / Undo Skip) */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {item.status === 'scheduled' && (
                          <>
                            {skipAllowed ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSkipTarget(item)}
                                className="h-8 text-xs font-semibold border-amber-300 text-amber-900 hover:bg-amber-50"
                              >
                                <SkipForward className="size-3.5 mr-1" />
                                Skip Meal
                              </Button>
                            ) : isToday ? (
                              <span className="text-[11px] text-muted-foreground italic">
                                Cutoff passed (Cooking in progress)
                              </span>
                            ) : null}
                          </>
                        )}

                        {item.status === 'skipped' && undoAllowed && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUndoTarget(item)}
                            className="h-8 text-xs font-semibold border-emerald-400 text-emerald-800 hover:bg-emerald-50"
                          >
                            <RotateCcw className="size-3.5 mr-1" />
                            Undo Skip
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No deliveries match the selected filter.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirm Skip Dialog */}
      <ConfirmDialog
        open={Boolean(skipTarget)}
        onOpenChange={(open) => !open && setSkipTarget(null)}
        title={`Skip ${skipTarget?.meal_slot === 'lunch' ? 'Lunch' : skipTarget?.meal_slot === 'dinner' ? 'Dinner' : 'Meal'} on ${dayjs(skipTarget?.delivery_date).format('dddd, MMM D')}?`}
        description="Your meal will not be wasted. We will automatically append a replacement delivery date to the end of your plan, pushing your completion date forward."
        confirmLabel="Confirm Skip"
        destructive={false}
        onConfirm={handleConfirmSkip}
      />

      {/* Confirm Undo Skip Dialog */}
      <ConfirmDialog
        open={Boolean(undoTarget)}
        onOpenChange={(open) => !open && setUndoTarget(null)}
        title={`Restore Delivery on ${dayjs(undoTarget?.delivery_date).format('dddd, MMM D')}?`}
        description="Your delivery will be restored for this date and the trailing replacement meal will be removed."
        confirmLabel="Restore Delivery"
        destructive={false}
        onConfirm={handleConfirmUndo}
      />
    </div>
  )
}
