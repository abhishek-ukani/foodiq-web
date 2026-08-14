import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import {
  fetchAllActiveItems,
  fetchBanners,
  fetchCategories,
  fetchDeliveryAreas,
  fetchPopularItems,
  fetchTestimonials,
  fetchTodaysSpecial,
} from '@/features/home/services/home-service'

export function useBanners(placement: 'hero' | 'promo_strip' | 'menu_top' | 'popup') {
  return useQuery({
    queryKey: QUERY_KEYS.banners(placement),
    queryFn: () => fetchBanners(placement),
  })
}

export function useTestimonials() {
  return useQuery({ queryKey: QUERY_KEYS.testimonials, queryFn: fetchTestimonials })
}

export function useCategories() {
  return useQuery({ queryKey: QUERY_KEYS.categories, queryFn: fetchCategories })
}

export function useTodaysSpecial() {
  return useQuery({ queryKey: QUERY_KEYS.todaysSpecial, queryFn: fetchTodaysSpecial })
}

export function useAllActiveItems() {
  return useQuery({ queryKey: QUERY_KEYS.allActiveItems, queryFn: fetchAllActiveItems })
}

export function usePopularItems(limit = 6) {
  return useQuery({
    queryKey: QUERY_KEYS.popularItems(limit),
    queryFn: () => fetchPopularItems(limit),
  })
}

export function useDeliveryAreas() {
  return useQuery({ queryKey: QUERY_KEYS.deliveryAreas, queryFn: fetchDeliveryAreas })
}
