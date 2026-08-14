import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ChefHat, LogOut, Menu as MenuIcon, ShoppingBag, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { useAuth } from '@/hooks/use-auth'
import { useCartSummary } from '@/features/cart/hooks/use-cart'
import { NotificationBell } from '@/features/notifications/components/notification-bell'
import { signOut, toFriendlyAuthMessage } from '@/features/auth/services/auth-service'
import { ROUTES } from '@/constants'
import { cn } from '@/lib/utils'

function CartLink({ onNavigate }: { onNavigate?: () => void }) {
  const { itemCount } = useCartSummary()
  return (
    <Button variant="ghost" size="icon" className="relative" asChild onClick={onNavigate}>
      <Link to={ROUTES.cart} aria-label="Cart">
        <ShoppingBag className="size-5" aria-hidden />
        {itemCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            {itemCount > 9 ? '9+' : itemCount}
          </span>
        ) : null}
      </Link>
    </Button>
  )
}

const NAV_LINKS = [
  { to: ROUTES.home, label: 'Home' },
  { to: ROUTES.menu, label: 'Menu' },
  { to: ROUTES.about, label: 'About' },
  { to: ROUTES.contact, label: 'Contact' },
]

function NavLinks({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
  return (
    <>
      {NAV_LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === ROUTES.home}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'text-sm font-medium transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              className,
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </>
  )
}

export function Navbar() {
  const navigate = useNavigate()
  const { isAuthenticated, profile, user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      setMobileOpen(false)
      navigate(ROUTES.home)
    } catch (error) {
      toast.error(toFriendlyAuthMessage(error))
    }
  }

  return (
    <header className="glass sticky top-0 z-50 border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to={ROUTES.home} className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ChefHat className="size-4.5" aria-hidden />
          </div>
          <span className="font-display text-lg font-semibold">FoodIQ</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLinks />
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? <NotificationBell /> : null}
          <CartLink />
          <ThemeToggle />
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="size-4" aria-hidden />
                  {profile?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.profile}>My Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.orders}>My Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="size-4" aria-hidden />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to={ROUTES.login}>Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to={ROUTES.register}>Get started</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          {isAuthenticated ? <NotificationBell /> : null}
          <CartLink />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <MenuIcon className="size-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="mt-10 flex flex-col gap-6 px-4">
                <NavLinks onNavigate={() => setMobileOpen(false)} className="text-base" />
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={ROUTES.profile} onClick={() => setMobileOpen(false)}>
                        My Account
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={ROUTES.orders} onClick={() => setMobileOpen(false)}>
                        My Orders
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={handleLogout}>
                      <LogOut className="size-4" aria-hidden />
                      Sign out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button className="w-full" asChild>
                      <Link to={ROUTES.register} onClick={() => setMobileOpen(false)}>
                        Get started
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={ROUTES.login} onClick={() => setMobileOpen(false)}>
                        Sign in
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
