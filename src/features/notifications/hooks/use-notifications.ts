import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { fetchMyNotifications, markNotificationRead } from '@/features/notifications/services/notifications-service'

const KEY = ['notifications', 'mine'] as const

export function useMyNotifications() {
  const user = useAuthStore((state) => state.user)
  return useQuery({
    queryKey: KEY,
    queryFn: fetchMyNotifications,
    enabled: Boolean(user),
    refetchInterval: 60_000,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}
