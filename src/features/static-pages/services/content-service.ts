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
  phone?: string | null
  subject?: string | null
  message: string
  user_id?: string | null
}

export async function submitContactMessage(input: ContactMessageInput): Promise<void> {
  const payload: {
    name: string
    email: string
    message: string
    phone: string | null
    subject: string | null
    user_id?: string | null
  } = {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    message: input.message.trim(),
    phone: input.phone?.trim() ? input.phone.trim() : null,
    subject: input.subject?.trim() ? input.subject.trim() : null,
  }

  if (input.user_id) {
    payload.user_id = input.user_id
  }

  const { error } = await supabase.from('contact_messages').insert(payload)
  if (error) throw error
}
