import { useEffect, useRef, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/store/auth-store'
import type { Tables } from '@/types/database.types'

async function loadOrCreateProfile(user: User): Promise<Tables<'profiles'> | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (data) return data

  // Attempt to bootstrap a profile record (e.g. for initial Google OAuth sign-in)
  try {
    const meta = user.user_metadata || {}
    const fullName = meta.full_name || meta.name || user.email?.split('@')[0] || 'Customer'
    const avatarUrl = meta.avatar_url || meta.picture || null
    const phone = meta.phone || null

    const { data: created, error: insertErr } = await (supabase.from('profiles') as any)
      .insert({
        id: user.id,
        email: user.email?.toLowerCase() ?? null,
        full_name: fullName,
        avatar_url: avatarUrl,
        phone,
        role: 'customer',
        is_active: true,
        is_verified: false,
        marketing_opt_in: true,
      })
      .select('*')
      .maybeSingle()

    if (!insertErr && created) return created
  } catch (err) {
    console.debug('Profile fallback creation info:', err)
  }

  if (error) {
    console.error('Failed to load profile', error)
  }
  return null
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
  const lastSyncedUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const syncSession = async (user: User | null) => {
      if (!isMounted) return
      if (!user) {
        lastSyncedUserIdRef.current = null
        clear()
        return
      }

      setSession(user)

      // Deduplicate profile loading if user ID has already loaded on startup
      if (lastSyncedUserIdRef.current === user.id) return
      lastSyncedUserIdRef.current = user.id

      const profile = await loadOrCreateProfile(user)
      if (isMounted) {
        setProfile(profile)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      syncSession(session?.user ?? null)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      syncSession(session?.user ?? null)
    })

    return () => {
      isMounted = false
      subscription.subscription.unsubscribe()
    }
  }, [setSession, setProfile, clear])

  return children
}
