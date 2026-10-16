import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import {
  fetchDeliveryAreas,
  fetchDeliveryFeeRules,
  fetchKitchenLocation,
} from '@/features/addresses/services/delivery-zone-service'

export function useDeliveryAreas() {
  return useQuery({
    queryKey: QUERY_KEYS.deliveryAreas,
    queryFn: fetchDeliveryAreas,
    staleTime: 5 * 60 * 1000,
  })
}

export function useDeliveryFeeRules() {
  return useQuery({
    queryKey: QUERY_KEYS.deliveryFeeRules,
    queryFn: fetchDeliveryFeeRules,
    staleTime: 5 * 60 * 1000,
  })
}

export function useKitchenLocation() {
  return useQuery({
    queryKey: QUERY_KEYS.kitchenLocation,
    queryFn: fetchKitchenLocation,
    staleTime: 10 * 60 * 1000,
  })
}
