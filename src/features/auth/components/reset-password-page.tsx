import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { KeyRound, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import { AuthLayout } from '@/layouts/auth-layout'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/common/password-input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { resetPasswordSchema, type ResetPasswordInput } from '@/features/auth/schemas/auth-schemas'
import { updatePassword, toFriendlyAuthMessage } from '@/features/auth/services/auth-service'
import { supabase } from '@/lib/supabase'
import { ROUTES } from '@/constants'
import { PageLoader } from '@/components/common/page-loader'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [hasRecoverySession, setHasRecoverySession] = useState<boolean | null>(null)
  const [urlError, setUrlError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    // 1. Check for explicit error parameters in the URL hash or query string
    const hash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : ''
    const hashParams = new URLSearchParams(hash)
    const searchParams = new URLSearchParams(window.location.search)

    const errorDesc =
      hashParams.get('error_description') ||
      searchParams.get('error_description') ||
      hashParams.get('error') ||
      searchParams.get('error')

    if (errorDesc) {
      setUrlError(decodeURIComponent(errorDesc.replace(/\+/g, ' ')))
      setHasRecoverySession(false)
      return
    }

    // 2. Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return
      if (session) {
        setHasRecoverySession(true)
      }
    })

    // 3. Listen for PASSWORD_RECOVERY or session arrival as Supabase parses URL hash/tokens
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return
      if (event === 'PASSWORD_RECOVERY' || (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION'))) {
        setHasRecoverySession(true)
      }
    })

    // 4. Grace period timer: Give Supabase up to 1.5s to finish async token exchange
    // before declaring the link expired
    const timer = setTimeout(() => {
      if (isMounted) {
        setHasRecoverySession((prev) => (prev !== null ? prev : false))
      }
    }, 1500)

    return () => {
      isMounted = false
      clearTimeout(timer)
      authListener.subscription.unsubscribe()
    }
  }, [])

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = async (values: ResetPasswordInput) => {
    try {
      await updatePassword(values.password)
      toast.success('Password updated. Please sign in again.')
      await supabase.auth.signOut()
      navigate(ROUTES.login, { replace: true })
    } catch (error) {
      toast.error(toFriendlyAuthMessage(error))
    }
  }

  if (hasRecoverySession === null) {
    return <PageLoader />
  }

  if (!hasRecoverySession) {
    return (
      <AuthLayout title="Link expired or invalid" description="This password reset link is no longer valid.">
        <div className="space-y-6 text-center">
          <div className="bg-destructive/10 text-destructive mx-auto flex size-16 items-center justify-center rounded-full">
            <ShieldAlert className="size-8" aria-hidden />
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              {urlError || 'Reset links expire after a short time or can only be used once. Please request a new link to continue.'}
            </p>
          </div>
          <Button asChild className="w-full min-h-[44px] rounded-xl font-semibold">
            <Link to={ROUTES.forgotPassword}>Request a new reset link</Link>
          </Button>
          <div className="pt-2">
            <Link to={ROUTES.login} className="text-xs text-primary font-medium hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Set a new password" description="Choose a strong password for your account.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <PasswordInput
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm new password</FormLabel>
                <FormControl>
                  <PasswordInput
                    autoComplete="new-password"
                    placeholder="Re-enter your new password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full min-h-[44px] rounded-xl font-semibold" size="lg" disabled={form.formState.isSubmitting}>
            <KeyRound className="size-4" aria-hidden />
            {form.formState.isSubmitting ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  )
}
