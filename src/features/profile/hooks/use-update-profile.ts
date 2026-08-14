import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { updateMyProfile } from '@/features/profile/services/profile-service'
import { useAuthStore } from '@/features/auth/store/auth-store'
import type { TablesUpdate } from '@/types/database.types'

export function useUpdateProfile() {
  return useMutation({
    mutationFn: async (input: TablesUpdate<'profiles'>) => {
      await updateMyProfile(input)

      // The account page and navbar greeting both read `profile` from the
      // Zustand auth store (populated once at sign-in), not React Query — so
      // a successful write needs to refresh that store directly, or the UI
      // would keep showing the pre-edit values until the next page load.
      const { data: session } = await supabase.auth.getUser()
      if (session.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (profile) useAuthStore.getState().setProfile(profile)
      }
    },
    onSuccess: () => toast.success('Profile updated'),
    onError: (error) => toast.error(error.message),
  })
}
