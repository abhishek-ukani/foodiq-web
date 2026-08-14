import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { fetchFoodItemBySlug, fetchMenuForDate } from '@/features/menu/services/menu-service'

export function useMenuForDate(date: string) {
  return useQuery({
    queryKey: QUERY_KEYS.dailyMenu(date),
    queryFn: () => fetchMenuForDate(date),
  })
}

export function useFoodItemBySlug(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.foodItem(slug),
    queryFn: () => fetchFoodItemBySlug(slug),
  })
}
