import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ChefHat, ChevronLeft, Heart, LogOut, MapPin, Menu as MenuIcon, Package, ShoppingBag, User, Zap, CalendarCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
      <Link to={ROUTES.checkout} aria-label="Checkout">
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
  { to: ROUTES.plans, label: 'Meal Plans' },
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
  const location = useLocation()
  const isCheckout = location.pathname === ROUTES.checkout
  const { itemCount } = useCartSummary()
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

  if (isCheckout) {
    return (
      <header className="glass sticky top-0 z-50 border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-3 sm:px-4 py-3">
          {/* Left: Back to menu button + Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground h-9 px-2 sm:px-3 -ml-1 sm:ml-0 rounded-lg"
            >
              <Link to={ROUTES.menu}>
                <ChevronLeft className="size-4.5 sm:size-4" />
                <span className="hidden xs:inline sm:inline">Back to menu</span>
                <span className="inline xs:hidden sm:hidden">Menu</span>
              </Link>
            </Button>

            <div className="h-4 w-px bg-border hidden sm:block" />

            <Link to={ROUTES.home} className="hidden sm:flex items-center gap-2 opacity-85 hover:opacity-100 transition-opacity">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ChefHat className="size-3.5" aria-hidden />
              </div>
              <span className="font-display text-sm font-semibold">FoodIQ</span>
            </Link>
          </div>

          {/* Center: Checkout title and item count */}
          <div className="flex items-center gap-2">
            <h1 className="font-display text-base sm:text-lg font-semibold text-foreground">
              Checkout
            </h1>
            {itemCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>

          {/* Right: Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm">
                    <User className="size-4 sm:mr-1.5" aria-hidden />
                    <span className="hidden sm:inline">
                      {profile?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to={ROUTES.profile} className="cursor-pointer">
                      <User className="mr-2 size-4" />
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={ROUTES.orders} className="cursor-pointer">
                      <Package className="mr-2 size-4" />
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`${ROUTES.profile}?tab=addresses`} className="cursor-pointer">
                      <MapPin className="mr-2 size-4" />
                      Saved addresses
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>
      </header>
    )
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
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="size-4" aria-hidden />
                  {profile?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {profile?.is_subscription_eligible ? (
                  <DropdownMenuItem asChild>
                    <Link to={ROUTES.quickOrder} className="cursor-pointer font-semibold text-amber-600">
                      <Zap className="mr-2 size-4 fill-amber-500 text-amber-500" />
                      Daily Quick Order
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.mySubscription} className="cursor-pointer">
                    <CalendarCheck className="mr-2 size-4 text-primary" />
                    My Subscription
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.profile} className="cursor-pointer">
                    <User className="mr-2 size-4" />
                    My Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.orders} className="cursor-pointer">
                    <Package className="mr-2 size-4" />
                    Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`${ROUTES.profile}?tab=addresses`} className="cursor-pointer">
                    <MapPin className="mr-2 size-4" />
                    Saved addresses
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`${ROUTES.profile}?tab=favorites`} className="cursor-pointer">
                    <Heart className="mr-2 size-4" />
                    Favorites
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 size-4" />
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

                {isAuthenticated ? (
                  <div className="space-y-2 border-t pt-4">
                    {profile?.is_subscription_eligible ? (
                      <Button
                        variant="default"
                        className="w-full justify-start bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                        asChild
                      >
                        <Link to={ROUTES.quickOrder} onClick={() => setMobileOpen(false)}>
                          <Zap className="mr-2 size-4 fill-white" />
                          Daily Quick Order
                        </Link>
                      </Button>
                    ) : null}
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to={ROUTES.mySubscription} onClick={() => setMobileOpen(false)}>
                        <CalendarCheck className="mr-2 size-4 text-primary" />
                        My Subscription
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to={ROUTES.profile} onClick={() => setMobileOpen(false)}>
                        <User className="mr-2 size-4" />
                        My Account
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to={ROUTES.orders} onClick={() => setMobileOpen(false)}>
                        <Package className="mr-2 size-4" />
                        Orders
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to={`${ROUTES.profile}?tab=addresses`} onClick={() => setMobileOpen(false)}>
                        <MapPin className="mr-2 size-4" />
                        Saved addresses
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to={`${ROUTES.profile}?tab=favorites`} onClick={() => setMobileOpen(false)}>
                        <Heart className="mr-2 size-4 text-rose-500" />
                        Favorites
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-destructive" onClick={handleLogout}>
                      <LogOut className="mr-2 size-4" />
                      Sign out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 border-t pt-4">
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
