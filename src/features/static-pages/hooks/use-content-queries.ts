import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { fetchFaqs, fetchPolicy } from '@/features/static-pages/services/content-service'
import type { PolicySlug } from '@/types/database.types'

export function useFaqs() {
  return useQuery({ queryKey: QUERY_KEYS.faqs, queryFn: fetchFaqs })
}

export function usePolicy(slug: PolicySlug) {
  return useQuery({ queryKey: QUERY_KEYS.policy(slug), queryFn: () => fetchPolicy(slug) })
}
