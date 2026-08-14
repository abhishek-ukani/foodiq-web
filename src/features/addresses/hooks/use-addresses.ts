import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { QUERY_KEYS } from '@/constants'
import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  setDefaultAddress,
  updateAddress,
} from '@/features/addresses/services/addresses-service'
import type { TablesInsert, TablesUpdate } from '@/types/database.types'

export function useAddresses() {
  return useQuery({ queryKey: QUERY_KEYS.addresses, queryFn: fetchAddresses })
}

export function useCreateAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Omit<TablesInsert<'addresses'>, 'user_id'>) => createAddress(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.addresses }),
    onError: (error) => toast.error(error.message),
  })
}

export function useUpdateAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TablesUpdate<'addresses'> }) =>
      updateAddress(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.addresses })
      toast.success('Address updated')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useDeleteAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.addresses })
      toast.success('Address removed')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.addresses })
      toast.success('Default address updated')
    },
    onError: (error) => toast.error(error.message),
  })
}
