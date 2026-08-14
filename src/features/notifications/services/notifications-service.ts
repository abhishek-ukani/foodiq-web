import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database.types'

/** Everything RLS lets the signed-in customer see: their own inbox plus active broadcasts. */
export async function fetchMyNotifications(): Promise<Tables<'notifications'>[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30)
  if (error) throw error
  return data
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase.rpc('mark_notifications_read', { p_ids: [id] })
  if (error) throw error
}
