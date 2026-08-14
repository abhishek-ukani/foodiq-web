import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/features/auth/store/auth-store'
import {
  addFavorite,
  fetchMyFavoriteIds,
  fetchMyFavorites,
  removeFavorite,
} from '@/features/favorites/services/favorites-service'

const LIST_KEY = ['favorites', 'mine'] as const
const IDS_KEY = ['favorites', 'ids'] as const

export function useMyFavorites() {
  const user = useAuthStore((state) => state.user)
  return useQuery({
    queryKey: LIST_KEY,
    queryFn: fetchMyFavorites,
    enabled: Boolean(user),
  })
}

export function useMyFavoriteIds() {
  const user = useAuthStore((state) => state.user)
  return useQuery({
    queryKey: IDS_KEY,
    queryFn: fetchMyFavoriteIds,
    enabled: Boolean(user),
    staleTime: 30_000,
  })
}

export function useToggleFavorite() {
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ foodItemId, isFavorited }: { foodItemId: string; isFavorited: boolean }) => {
      if (!user) throw new Error('Sign in to save favorites')
      if (isFavorited) {
        await removeFavorite(foodItemId)
      } else {
        await addFavorite(user.id, foodItemId)
      }
    },
    onMutate: async ({ foodItemId, isFavorited }) => {
      await queryClient.cancelQueries({ queryKey: IDS_KEY })
      const previous = queryClient.getQueryData<string[]>(IDS_KEY)
      queryClient.setQueryData<string[]>(IDS_KEY, (ids = []) =>
        isFavorited ? ids.filter((id) => id !== foodItemId) : [...ids, foodItemId],
      )
      return { previous }
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(IDS_KEY, context.previous)
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: IDS_KEY })
      queryClient.invalidateQueries({ queryKey: LIST_KEY })
    },
  })
}
