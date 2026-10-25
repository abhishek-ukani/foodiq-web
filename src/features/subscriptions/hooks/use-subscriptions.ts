import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import * as subService from '../services/subscription-service'

export const CUSTOMER_SUB_KEYS = {
  variants: ['customer-plan-variants'] as const,
  settings: ['customer-subscription-settings'] as const,
  closedDates: ['customer-kitchen-closed-dates'] as const,
  mealOptions: ['customer-thali-options'] as const,
  quote: (variantId: string, mealSlot: string, mealThaliId?: string | null) =>
    ['customer-sub-quote', variantId, mealSlot, mealThaliId || 'default'] as const,
  mySubscriptions: ['my-subscriptions'] as const,
  ledger: (subId: string) => ['my-subscription-ledger', subId] as const,
}

// ---------------------------------------------------------------------------
// 1. Plan Variants Query
// ---------------------------------------------------------------------------
export function useActivePlanVariants() {
  return useQuery({
    queryKey: CUSTOMER_SUB_KEYS.variants,
    queryFn: subService.fetchActivePlanVariants,
    staleTime: 60_000,
  })
}

// ---------------------------------------------------------------------------
// 2. Active Thali Meal Options Query (Regular, Classic, Deluxe, etc.)
// ---------------------------------------------------------------------------
export function useActiveMealOptions() {
  return useQuery({
    queryKey: CUSTOMER_SUB_KEYS.mealOptions,
    queryFn: subService.fetchActiveMealOptions,
    staleTime: 60_000,
  })
}

// ---------------------------------------------------------------------------
// 3. Global Subscription Settings Query
// ---------------------------------------------------------------------------
export function useSubscriptionSettings() {
  return useQuery({
    queryKey: CUSTOMER_SUB_KEYS.settings,
    queryFn: subService.fetchSubscriptionSettings,
    staleTime: 60_000,
  })
}

// ---------------------------------------------------------------------------
// 4. Kitchen Closed Dates Query
// ---------------------------------------------------------------------------
export function useKitchenClosedDates() {
  return useQuery({
    queryKey: CUSTOMER_SUB_KEYS.closedDates,
    queryFn: subService.fetchKitchenClosedDates,
    staleTime: 60_000,
  })
}

// ---------------------------------------------------------------------------
// 5. Live Server Quote Query
// ---------------------------------------------------------------------------
export function useSubscriptionQuote(
  variantId?: string | null,
  mealSlot?: 'lunch' | 'dinner' | 'both' | null,
  mealThaliId?: string | null,
) {
  return useQuery({
    queryKey: CUSTOMER_SUB_KEYS.quote(variantId || '', mealSlot || 'lunch', mealThaliId),
    queryFn: () => subService.getSubscriptionQuote(variantId!, mealSlot || 'lunch', mealThaliId),
    enabled: Boolean(variantId && mealSlot),
    staleTime: 30_000,
  })
}

// ---------------------------------------------------------------------------
// 5. Create Subscription Mutation
// ---------------------------------------------------------------------------
export function useCreateSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: subService.CreateSubscriptionInput) =>
      subService.createSubscription(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_SUB_KEYS.mySubscriptions })
      toast.success('Your subscription has been created! Welcome to FoodIQ Tiffin.')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create subscription. Please try again.')
    },
  })
}

// ---------------------------------------------------------------------------
// 6. My Subscriptions Query
// ---------------------------------------------------------------------------
export function useMySubscriptions() {
  return useQuery({
    queryKey: CUSTOMER_SUB_KEYS.mySubscriptions,
    queryFn: subService.fetchMySubscriptions,
  })
}

// ---------------------------------------------------------------------------
// 7. My Subscription Ledger Query
// ---------------------------------------------------------------------------
export function useMySubscriptionLedger(subscriptionId?: string | null) {
  return useQuery({
    queryKey: CUSTOMER_SUB_KEYS.ledger(subscriptionId || ''),
    queryFn: () => subService.fetchMySubscriptionLedger(subscriptionId!),
    enabled: Boolean(subscriptionId),
  })
}

// ---------------------------------------------------------------------------
// 8. Skip Delivery Day Mutation
// ---------------------------------------------------------------------------
export function useSkipDeliveryDay(subscriptionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ dayId, reason }: { dayId: string; reason?: string | null }) =>
      subService.skipDeliveryDay(dayId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_SUB_KEYS.ledger(subscriptionId) })
      queryClient.invalidateQueries({ queryKey: CUSTOMER_SUB_KEYS.mySubscriptions })
      toast.success(
        `Meal skipped. Your subscription has been extended to ${data.new_end_date}. (${data.skips_used}/${data.skip_limit} skips used)`,
      )
    },
    onError: (err: any) => {
      toast.error(err.message || 'Unable to skip meal')
    },
  })
}

// ---------------------------------------------------------------------------
// 9. Undo Skip Delivery Day Mutation
// ---------------------------------------------------------------------------
export function useUndoSkipDeliveryDay(subscriptionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dayId: string) => subService.undoSkipDeliveryDay(dayId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_SUB_KEYS.ledger(subscriptionId) })
      queryClient.invalidateQueries({ queryKey: CUSTOMER_SUB_KEYS.mySubscriptions })
      toast.success(`Delivery restored for ${data.restored_date}!`)
    },
    onError: (err: any) => {
      toast.error(err.message || 'Unable to restore meal')
    },
  })
}

// ---------------------------------------------------------------------------
// 10. Plan Enquiry Mutation
// ---------------------------------------------------------------------------
export function useSubmitPlanEnquiry() {
  return useMutation({
    mutationFn: subService.submitPlanEnquiry,
    onSuccess: () => {
      toast.success('Your enquiry has been received! Our kitchen team will contact you shortly.')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to submit enquiry')
    },
  })
}
