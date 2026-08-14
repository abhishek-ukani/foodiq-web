import { supabase } from '@/lib/supabase'
import type { TablesUpdate } from '@/types/database.types'

export async function updateMyProfile(input: TablesUpdate<'profiles'>): Promise<void> {
  const { data: session } = await supabase.auth.getUser()
  if (!session.user) throw new Error('Please sign in.')

  const { error } = await supabase.from('profiles').update(input).eq('id', session.user.id)
  if (error) throw error
}
