import { useEffect, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/store/auth-store'
import type { Tables } from '@/types/database.types'

async function loadProfile(userId: string): Promise<Tables<'profiles'> | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) {
    console.error('Failed to load profile', error)
    return null
  }
  return data
}

/**
 * Bootstraps the session once at app start and keeps it in sync thereafter.
 * Runs above the router so route guards can read auth state synchronously
 * instead of each one re-fetching it.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession)
  const setProfile = useAuthStore((s) => s.setProfile)
  const clear = useAuthStore((s) => s.clear)

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return
      setSession(session?.user ?? null)
      if (session?.user) {
        setProfile(await loadProfile(session.user.id))
      }
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return
      if (!session?.user) {
        clear()
        return
      }
      setSession(session.user)
      setProfile(await loadProfile(session.user.id))
    })

    return () => {
      isMounted = false
      subscription.subscription.unsubscribe()
    }
  }, [setSession, setProfile, clear])

  return children
}
