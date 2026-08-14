import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database.types'

export type OrderWithItems = Tables<'orders'> & {
  order_items: Tables<'order_items'>[]
}

export type OrderWithHistory = OrderWithItems & {
  order_status_history: Tables<'order_status_history'>[]
}

export async function fetchMyOrders(): Promise<OrderWithItems[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('placed_at', { ascending: false })
  if (error) throw error
  return data as unknown as OrderWithItems[]
}

export async function fetchOrderById(id: string): Promise<OrderWithHistory> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), order_status_history(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as unknown as OrderWithHistory
}
