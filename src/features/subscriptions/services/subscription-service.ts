import { supabase } from '@/lib/supabase'
import type {
  SubscriptionPlanRow,
  SubscriptionSettingsRow,
  SubscriptionRow,
  SubscriptionDayRow,
} from '@/types/database.types'

export type { SubscriptionPlanRow }
export type PlanVariantRow = SubscriptionPlanRow

export type SubscriptionQuote = {
  plan_id: string
  plan_name: string
  /** @deprecated Backward-compatible alias for plan_id */
  variant_id?: string
  /** @deprecated Backward-compatible alias for plan_name */
  variant_name?: string
  meal_slot: 'lunch' | 'dinner' | 'both'
  meal_thali_id?: string
  meal_thali_name?: string
  duration_meal_days: number
  base_mrp: number
  base_thali_price: number
  base_selling_price: number
  per_day_price: number
  original_price: number
  discount_percentage: number
  discount_amount: number
  final_price: number
  skip_limit: number
  has_weekly_sweet: boolean
  renewal_reminder_threshold: number
}

export type ThaliMealOption = {
  id: string
  name: string
  description: string | null
  price: number
  compare_price: number | null
  image_url: string | null
  display_order: number
}

export type CustomerSubscriptionWithDetails = SubscriptionRow & {
  subscription_plans: Pick<
    SubscriptionPlanRow,
    'name' | 'slug' | 'badge_text' | 'short_description' | 'who_it_is_for'
  > | null
  /** Backward-compatible alias for subscription_plans */
  plan_variants?: Pick<
    SubscriptionPlanRow,
    'name' | 'slug' | 'badge_text' | 'short_description' | 'who_it_is_for'
  > | null
  meal_thalis?: {
    id: string
    name: string
    description: string | null
    image_url: string | null
    price: number
  } | null
  addresses: {
    address_line1: string
    address_line2: string | null
    landmark: string | null
    city: string
    pincode: string
    contact_name: string
    contact_phone: string
  } | null
  delivery_slots?: {
    label: string
    start_time: string
    end_time: string
  } | null
}

export type CustomerSubscriptionLedgerItem = SubscriptionDayRow & {
  sweet_food_item?: {
    name: string
    image_url: string | null
  } | null
  meal_thali?: {
    id: string
    name: string
  } | null
}

export type CreateSubscriptionInput = {
  planId: string
  /** @deprecated Backward-compatible alias for planId */
  variantId?: string
  mealSlot: 'lunch' | 'dinner' | 'both'
  mealThaliId?: string | null
  startDate: string
  addressId: string
  deliverySlotId?: string | null
  paymentMethod?: string
}

export type CreateSubscriptionResult = {
  subscription_id: string
  subscription_number: string
  status: string
  total_meal_days: number
  start_date: string
  end_date: string
  final_price: number
}

// ---------------------------------------------------------------------------
// 1. Fetch Active Subscription Plans (Standard Catalog)
// ---------------------------------------------------------------------------
export async function fetchActiveSubscriptionPlans(): Promise<SubscriptionPlanRow[]> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) throw error
  return (data || []) as SubscriptionPlanRow[]
}

/** Backward-compatible alias */
export const fetchActivePlanVariants = fetchActiveSubscriptionPlans

// ---------------------------------------------------------------------------
// 2. Fetch Global Subscription Settings (Cutoffs, Lead Times, WhatsApp)
// ---------------------------------------------------------------------------
export async function fetchSubscriptionSettings(): Promise<SubscriptionSettingsRow> {
  const { data, error } = await supabase
    .from('subscription_settings')
    .select('*')
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (!data) {
    return {
      id: '00000000-0000-0000-0000-000000000001',
      lunch_skip_cutoff_time: '10:00:00',
      dinner_skip_cutoff_time: '19:00:00',
      min_lead_days: 1,
      max_start_lead_days: 30,
      allow_undo_skip: true,
      allow_skip_on_last_day: false,
      default_meal_thali_id: null,
      sweet_food_item_id: null,
      sweet_weekday_rule: 'first_delivery_of_week',
      contact_whatsapp_number: '+91 98765 43210',
      updated_at: new Date().toISOString(),
      updated_by: null,
    }
  }
  return data as SubscriptionSettingsRow
}

// ---------------------------------------------------------------------------
// 3. Fetch Kitchen Closed Dates (Disables start dates & calendar bookings)
// ---------------------------------------------------------------------------
export async function fetchKitchenClosedDates(): Promise<string[]> {
  const { data, error } = await supabase
    .from('kitchen_closed_dates')
    .select('closed_date')

  if (error) throw error
  return (data || []).map((row: any) => row.closed_date as string)
}

// ---------------------------------------------------------------------------
// 4. Fetch Active Meal / Thali Options (Regular, Classic, Deluxe, etc.)
// ---------------------------------------------------------------------------
export async function fetchActiveMealOptions(): Promise<ThaliMealOption[]> {
  const { data, error } = await supabase
    .from('food_items')
    .select('id, name, description, price, compare_price, image_url, display_order')
    .eq('kind', 'thali')
    .eq('is_available', true)
    .order('display_order', { ascending: true })

  if (error) throw error
  return (data || []) as ThaliMealOption[]
}

// ---------------------------------------------------------------------------
// 5. Server-Authoritative Quote Calculation
// ---------------------------------------------------------------------------
export async function getSubscriptionQuote(
  planId: string,
  mealSlot: 'lunch' | 'dinner' | 'both',
  mealThaliId?: string | null,
): Promise<SubscriptionQuote> {
  const { data, error } = await supabase.rpc('get_subscription_quote', {
    p_plan_id: planId,
    p_meal_slot: mealSlot,
    p_meal_thali_id: mealThaliId ?? null,
  })
  if (error) throw error
  return data as SubscriptionQuote
}

// ---------------------------------------------------------------------------
// 6. Create Subscription (Atomic server-side creation & meal ledger builder)
// ---------------------------------------------------------------------------
export async function createSubscription(
  input: CreateSubscriptionInput,
): Promise<CreateSubscriptionResult> {
  const effectivePlanId = input.planId || input.variantId
  if (!effectivePlanId) {
    throw new Error('Subscription planId is required')
  }

  const { data, error } = await supabase.rpc('create_subscription', {
    p_plan_id: effectivePlanId,
    p_meal_slot: input.mealSlot,
    p_start_date: input.startDate,
    p_address_id: input.addressId,
    p_delivery_slot_id: input.deliverySlotId ?? null,
    p_payment_method: input.paymentMethod || 'upi',
    p_meal_thali_id: input.mealThaliId ?? null,
  })
  if (error) throw error
  return data as CreateSubscriptionResult
}

// ---------------------------------------------------------------------------
// 7. Fetch User Subscriptions (Active & Past)
// ---------------------------------------------------------------------------
export async function fetchMySubscriptions(): Promise<CustomerSubscriptionWithDetails[]> {
  const { data: session } = await supabase.auth.getUser()
  if (!session.user) return []

  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      subscription_plans:plan_id(name, slug, badge_text, short_description, who_it_is_for),
      meal_thalis:meal_thali_id(id, name, description, image_url, price),
      addresses:address_id(address_line1, address_line2, landmark, city, pincode, contact_name, contact_phone)
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) throw error

  // Ensure backward compatibility for any views looking at plan_variants
  const enriched = (data || []).map((row: any) => ({
    ...row,
    plan_variants: row.subscription_plans || row.plan_variants || null,
  }))

  return enriched as unknown as CustomerSubscriptionWithDetails[]
}

// ---------------------------------------------------------------------------
// 8. Fetch Meal Ledger for a Specific Subscription
// ---------------------------------------------------------------------------
export async function fetchMySubscriptionLedger(
  subscriptionId: string,
): Promise<CustomerSubscriptionLedgerItem[]> {
  const { data, error } = await supabase
    .from('subscription_days')
    .select(`
      *,
      sweet_food_item:sweet_food_item_id(name, image_url),
      meal_thali:meal_thali_id(id, name)
    `)
    .eq('subscription_id', subscriptionId)
    .order('delivery_date', { ascending: true })
    .order('sequence_number', { ascending: true })

  if (error) throw error
  return (data || []) as CustomerSubscriptionLedgerItem[]
}

// ---------------------------------------------------------------------------
// 9. Skip Delivery Day
// ---------------------------------------------------------------------------
export async function skipDeliveryDay(
  dayId: string,
  reason?: string | null,
): Promise<{
  success: boolean
  skipped_day_id: string
  skipped_date: string
  skips_used: number
  skip_limit: number
  appended_date: string
  new_end_date: string
}> {
  const { data, error } = await supabase.rpc('skip_day', {
    p_subscription_day_id: dayId,
    p_reason: reason ?? null,
  })
  if (error) throw error
  return data as any
}

// ---------------------------------------------------------------------------
// 10. Undo Skip Delivery Day
// ---------------------------------------------------------------------------
export async function undoSkipDeliveryDay(
  dayId: string,
): Promise<{
  success: boolean
  restored_date: string
  removed_date: string
}> {
  const { data, error } = await supabase.rpc('undo_skip', {
    p_subscription_day_id: dayId,
  })
  if (error) throw error
  return data as any
}
