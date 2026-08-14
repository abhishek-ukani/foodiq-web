import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { ROUTES } from '@/constants'
import { PageLoader } from '@/components/common/page-loader'

/** Keeps signed-in users off auth pages (login/register) — bounces them home. */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: Location } | null)?.from

  if (isLoading) return <PageLoader />

  if (isAuthenticated) {
    return <Navigate to={from?.pathname ?? ROUTES.home} replace />
  }

  return children
}
