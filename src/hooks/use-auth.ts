import { useAuthStore } from '@/features/auth/store/auth-store'

export function useAuth() {
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)

  return {
    status,
    user,
    profile,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isAdmin: profile?.role === 'admin',
    isDeliveryBoy: profile?.role === 'delivery_boy',
    isCustomer: profile?.role === 'customer',
  }
}
