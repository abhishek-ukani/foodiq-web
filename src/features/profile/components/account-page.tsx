import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { LogOut, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { PersonalInfoForm } from '@/features/profile/components/personal-info-form'
import { AddressesTab } from '@/features/profile/components/addresses-tab'
import { FavoritesTab } from '@/features/favorites/components/favorites-tab'
import { useAuth } from '@/hooks/use-auth'
import { signOut, toFriendlyAuthMessage } from '@/features/auth/services/auth-service'
import { ROUTES } from '@/constants'

function initialsOf(name: string | null | undefined, email: string | null | undefined) {
  if (name?.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')
  }
  return email?.[0]?.toUpperCase() ?? '?'
}

export function AccountPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, profile } = useAuth()

  const activeTab = searchParams.get('tab') || 'profile'

  const handleLogout = async () => {
    try {
      await signOut()
      navigate(ROUTES.login, { replace: true })
    } catch (error) {
      toast.error(toFriendlyAuthMessage(error))
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {initialsOf(profile?.full_name, user?.email)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-display text-2xl font-semibold">{profile?.full_name ?? 'Your account'}</h1>
            <p className="text-muted-foreground text-sm">
              {profile?.total_orders ?? 0} order{profile?.total_orders === 1 ? '' : 's'} placed
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="size-4" aria-hidden />
          Sign out
        </Button>
      </div>

      {profile?.is_subscription_eligible ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-foreground">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
              <Zap className="size-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <p className="font-bold text-sm">Daily Quick Order Unlocked</p>
              <p className="text-xs text-muted-foreground">Order today's meal in 1 tap with your Sabji & Bread preferences.</p>
            </div>
          </div>
          <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shrink-0">
            <Link to={ROUTES.quickOrder}>Order Daily Meal</Link>
          </Button>
        </div>
      ) : null}
      {activeTab === 'addresses' ? (
        <AddressesTab />
      ) : activeTab === 'favorites' ? (
        <FavoritesTab />
      ) : (
        <PersonalInfoForm />
      )}
    </div>
  )
}
