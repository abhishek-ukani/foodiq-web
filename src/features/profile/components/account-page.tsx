import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  const { user, profile } = useAuth()

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

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Personal Info</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          <PersonalInfoForm />
        </TabsContent>
        <TabsContent value="addresses" className="mt-6">
          <AddressesTab />
        </TabsContent>
        <TabsContent value="favorites" className="mt-6">
          <FavoritesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
