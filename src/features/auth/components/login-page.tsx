import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AlertCircle, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import { AuthLayout } from '@/layouts/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/common/password-input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { loginSchema, type LoginInput } from '@/features/auth/schemas/auth-schemas'
import {
  signInWithIdentifier,
  signInWithGoogle,
  toFriendlyAuthMessage,
} from '@/features/auth/services/auth-service'
import { CONTACT_INFO, ROUTES } from '@/constants'
import { env } from '@/lib/env'

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="18" height="18">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const searchParams = new URLSearchParams(location.search)
  const initialEmail = searchParams.get('email') || ''

  // Detect any expired token or error params in URL hash or search params
  useEffect(() => {
    const hash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : ''
    const hashParams = new URLSearchParams(hash)
    const errorDesc = hashParams.get('error_description') || searchParams.get('error_description')
    const errorCode = hashParams.get('error_code') || searchParams.get('error_code')

    if (errorDesc) {
      setAuthError(decodeURIComponent(errorDesc.replace(/\+/g, ' ')))
    } else if (errorCode === 'otp_expired') {
      setAuthError('Your verification link has expired. Please request a new verification link or code.')
    }
  }, [searchParams])

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: initialEmail, password: '' },
  })

  // Sync if URL query param changes
  useEffect(() => {
    if (initialEmail && !form.getValues('identifier')) {
      form.setValue('identifier', initialEmail)
    }
  }, [initialEmail, form])

  const onSubmit = async (values: LoginInput) => {
    try {
      await signInWithIdentifier({
        identifier: values.identifier || values.email || '',
        password: values.password,
      })
      toast.success('Welcome back!')
      const fromParam = searchParams.get('redirect') || searchParams.get('from')
      const fromState = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from
      const from = fromParam || (fromState ? `${fromState.pathname ?? ''}${fromState.search ?? ''}` : null)
      navigate(from ?? ROUTES.home, { replace: true })
    } catch (error: any) {
      toast.error(toFriendlyAuthMessage(error))
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleSigningIn(true)
      const fromParam = searchParams.get('redirect') || searchParams.get('from')
      const fromState = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from
      const target = fromParam || (fromState ? `${fromState.pathname ?? ''}${fromState.search ?? ''}` : ROUTES.home)
      const redirectTo = `${env.appUrl}/login?redirect=${encodeURIComponent(target)}`
      await signInWithGoogle(redirectTo)
    } catch (error) {
      toast.error(toFriendlyAuthMessage(error))
      setIsGoogleSigningIn(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" description="Sign in to order today's fresh tiffin.">
      {authError ? (
        <Alert className="mb-4 rounded-xl border-destructive/40 bg-destructive/10 text-destructive text-left p-3.5">
          <AlertCircle className="size-4 mt-0.5" />
          <AlertDescription className="text-xs space-y-1 ml-1.5">
            <p className="font-semibold">{authError}</p>
            <p className="text-[11px] text-muted-foreground">
              Need another verification code?{' '}
              <Link to={ROUTES.verifyEmail} className="text-primary font-bold underline">
                Verify or resend email →
              </Link>
            </p>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="w-full relative flex items-center justify-center gap-2 border-slate-300 hover:bg-slate-50 min-h-[44px]"
          size="lg"
          onClick={handleGoogleSignIn}
          disabled={isGoogleSigningIn || form.formState.isSubmitting}
        >
          <GoogleIcon className="size-5 shrink-0" />
          {isGoogleSigningIn ? 'Redirecting to Google…' : 'Continue with Google'}
        </Button>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-muted w-full" />
          <span className="bg-background px-3 text-xs text-muted-foreground uppercase font-medium absolute">
            Or sign in with mobile / email
          </span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile number or Email</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    autoComplete="username"
                    placeholder="98765 43210 or you@example.com"
                    className="min-h-[44px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    to={ROUTES.forgotPassword}
                    className="text-primary text-xs font-medium hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput autoComplete="current-password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full min-h-[44px]" size="lg" disabled={form.formState.isSubmitting || isGoogleSigningIn}>
            <LogIn className="size-4" aria-hidden />
            {form.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Form>

      <div className="mt-5 space-y-3 text-center">
        <a
          href={CONTACT_INFO.whatsappUrl('Hello FoodIQ, I need help signing in to my account.')}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-emerald-700 hover:underline inline-flex items-center justify-center gap-1.5 font-medium py-1"
        >
          Senior citizen / need assistance? Tap for WhatsApp Help →
        </a>

        <p className="text-muted-foreground text-sm">
          New to FoodIQ?{' '}
          <Link to={ROUTES.register} className="text-primary font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
