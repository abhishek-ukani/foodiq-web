import { supabase } from '@/lib/supabase'
import type { PolicySlug, Tables } from '@/types/database.types'

export async function fetchFaqs(): Promise<Tables<'faqs'>[]> {
  const { data, error } = await supabase.from('faqs').select('*').order('display_order')
  if (error) throw error
  return data
}

export async function fetchPolicy(slug: PolicySlug): Promise<Tables<'policies'> | null> {
  const { data, error } = await supabase.from('policies').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  return data
}

export interface ContactMessageInput {
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
}

export async function submitContactMessage(input: ContactMessageInput): Promise<void> {
  const { error } = await supabase.from('contact_messages').insert(input)
  if (error) throw error
}
