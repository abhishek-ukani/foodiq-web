import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import {
  fetchFoodItemBySlug,
  fetchMenuForDate,
  fetchAlwaysAvailableItems,
  fetchDailyMenuSlots,
} from '@/features/menu/services/menu-service'
import type { MealType } from '@/types/database.types'

export function useMenuForDate(date: string, mealType?: MealType) {
  return useQuery({
    queryKey: QUERY_KEYS.dailyMenu(date, mealType),
    queryFn: () => fetchMenuForDate(date, mealType),
  })
}

export function useAlwaysAvailableItems() {
  return useQuery({
    queryKey: QUERY_KEYS.alwaysAvailableItems,
    queryFn: () => fetchAlwaysAvailableItems(),
  })
}

export function useDailyMenuSlots(date: string) {
  return useQuery({
    queryKey: ['daily-menu-slots', date],
    queryFn: () => fetchDailyMenuSlots(date),
  })
}

export function useFoodItemBySlug(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.foodItem(slug),
    queryFn: () => fetchFoodItemBySlug(slug),
  })
}
