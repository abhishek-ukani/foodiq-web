import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database.types'

export async function fetchAddresses(): Promise<Tables<'addresses'>[]> {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createAddress(
  input: Omit<TablesInsert<'addresses'>, 'user_id'>,
): Promise<Tables<'addresses'>> {
  const { data: session } = await supabase.auth.getUser()
  if (!session.user) throw new Error('Please sign in to save an address.')

  const { data, error } = await supabase
    .from('addresses')
    .insert({ ...input, user_id: session.user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateAddress(id: string, input: TablesUpdate<'addresses'>): Promise<void> {
  const { error } = await supabase.from('addresses').update(input).eq('id', id)
  if (error) throw error
}

export async function deleteAddress(id: string): Promise<void> {
  const { error } = await supabase.from('addresses').delete().eq('id', id)
  if (error) throw error
}

/** Clears the previous default (if any) and marks this one — addresses have no partial-unique trick, so this is two writes. */
export async function setDefaultAddress(id: string): Promise<void> {
  const { data: session } = await supabase.auth.getUser()
  if (!session.user) throw new Error('Please sign in.')

  const { error: clearError } = await supabase
    .from('addresses')
    .update({ is_default: false })
    .eq('user_id', session.user.id)
  if (clearError) throw clearError

  const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', id)
  if (error) throw error
}
