import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { ROUTES } from '@/constants'
import { PageLoader } from '@/components/common/page-loader'

/** Keeps signed-in users off auth pages (login/register) — bounces them to destination or home. */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const redirectQuery = searchParams.get('redirect') || searchParams.get('from')
  const fromState = (location.state as { from?: Location } | null)?.from
  const target =
    redirectQuery ||
    (fromState ? `${fromState.pathname}${fromState.search || ''}` : ROUTES.home)

  if (isLoading) return <PageLoader />

  if (isAuthenticated) {
    return <Navigate to={target} replace />
  }

  return children
}
