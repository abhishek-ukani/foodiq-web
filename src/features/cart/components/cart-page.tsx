import { Navigate } from 'react-router-dom'
import { ROUTES } from '@/constants'

export function CartPage() {
  return <Navigate to={ROUTES.checkout} replace />
}
