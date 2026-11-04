import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import {
  fetchKitchenLocation,
  fetchDeliverySettings,
} from '@/features/addresses/services/delivery-zone-service'

export function useKitchenLocation() {
  return useQuery({
    queryKey: QUERY_KEYS.kitchenLocation,
    queryFn: fetchKitchenLocation,
    staleTime: 10 * 60 * 1000,
  })
}

export function useDeliverySettings() {
  return useQuery({
    queryKey: QUERY_KEYS.deliverySettings,
    queryFn: fetchDeliverySettings,
    staleTime: 3 * 60 * 1000,
  })
}

