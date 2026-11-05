import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AlertCircle, CheckCircle2, Loader2, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { AuthLayout } from '@/layouts/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/common/password-input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { registerSchema, type RegisterInput } from '@/features/auth/schemas/auth-schemas'
import {
  signUpWithEmail,
  signInWithGoogle,
  checkCredentialAvailability,
  normalizePhone,
  toFriendlyAuthMessage,
} from '@/features/auth/services/auth-service'
import { ROUTES } from '@/constants'

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

export function RegisterPage() {
  const navigate = useNavigate()
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [checkingPhone, setCheckingPhone] = useState(false)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'available' | 'taken'>('idle')
  const [phoneStatus, setPhoneStatus] = useState<'idle' | 'available' | 'taken'>('idle')

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    mode: 'onTouched',
  })

  // Individual Email Verification on Blur
  const handleEmailBlur = async () => {
    const emailVal = form.getValues('email')?.trim()
    if (!emailVal || !emailVal.includes('@')) {
      setEmailStatus('idle')
      return
    }

    try {
      setCheckingEmail(true)
      const res = await checkCredentialAvailability({ email: emailVal })
      if (!res.emailAvailable) {
        setEmailStatus('taken')
        form.setError('email', {
          type: 'manual',
          message: 'An account with this email address already exists. Please sign in.',
        })
      } else if (res.isVerified) {
        setEmailStatus('available')
        form.clearErrors('email')
      } else {
        // Unverified fallback: when RPC is missing and RLS blocks anon, do NOT display false "Available"
        setEmailStatus('idle')
      }
    } catch {
      setEmailStatus('idle')
    } finally {
      setCheckingEmail(false)
    }
  }

  // Individual Mobile Number Verification on Blur
  const handlePhoneBlur = async () => {
    const rawPhone = form.getValues('phone')
    const cleanPhone = normalizePhone(rawPhone)
    if (!cleanPhone || cleanPhone.length !== 10) {
      setPhoneStatus('idle')
      return
    }

    try {
      setCheckingPhone(true)
      const res = await checkCredentialAvailability({ phone: cleanPhone })
      if (!res.phoneAvailable) {
        setPhoneStatus('taken')
        form.setError('phone', {
          type: 'manual',
          message: 'This mobile number is already registered to an account. Please sign in.',
        })
      } else if (res.isVerified) {
        setPhoneStatus('available')
        form.clearErrors('phone')
      } else {
        // Unverified fallback: when RPC is missing and RLS blocks anon, do NOT display false "Available"
        setPhoneStatus('idle')
      }
    } catch {
      setPhoneStatus('idle')
    } finally {
      setCheckingPhone(false)
    }
  }

  const onSubmit = async (values: RegisterInput) => {
    const cleanPhone = normalizePhone(values.phone)
    const cleanEmail = values.email.trim().toLowerCase()

    // 1. Strict pre-validation: check individual uniqueness for BOTH email and phone
    try {
      const availability = await checkCredentialAvailability({
        email: cleanEmail,
        phone: cleanPhone,
      })

      let hasConflict = false

      if (!availability.emailAvailable) {
        hasConflict = true
        setEmailStatus('taken')
        form.setError('email', {
          type: 'manual',
          message: 'An account with this email address already exists. Please sign in.',
        })
      }

      if (!availability.phoneAvailable) {
        hasConflict = true
        setPhoneStatus('taken')
        form.setError('phone', {
          type: 'manual',
          message: 'This mobile number is already registered to an account. Please sign in.',
        })
      }

      if (hasConflict) {
        toast.error('Account details already exist. Please sign in or use different details.')
        return
      }

      // 2. Perform Account Registration
      const result = await signUpWithEmail({
        fullName: values.fullName,
        email: cleanEmail,
        phone: cleanPhone,
        password: values.password,
      })

      // 3. Handle post-registration flow
      // If Supabase returned an active session, user is already confirmed and logged in
      if (result.session) {
        toast.success('Account created successfully! Welcome to FoodIQ.')
        navigate(ROUTES.home, { replace: true })
        return
      }

      // If no session returned, email confirmation is required by Supabase settings
      toast.success('Account registered! Please check your email inbox to verify.')
      navigate(ROUTES.verifyEmail, { state: { email: cleanEmail }, replace: true })
    } catch (error: any) {
      const msg = error?.message || 'Failed to create account.'
      const lower = msg.toLowerCase()

      if (lower.includes('email') && (lower.includes('already') || lower.includes('exists'))) {
        setEmailStatus('taken')
        form.setError('email', {
          type: 'manual',
          message: 'An account with this email address already exists. Please sign in.',
        })
        toast.error('An account with this email address already exists.')
      } else if (lower.includes('phone') || lower.includes('mobile')) {
        setPhoneStatus('taken')
        form.setError('phone', {
          type: 'manual',
          message: 'This mobile number is already registered to an account.',
        })
        toast.error('This mobile number is already registered to an account.')
      } else {
        toast.error(toFriendlyAuthMessage(error))
      }
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleSigningIn(true)
      await signInWithGoogle()
    } catch (error) {
      toast.error(toFriendlyAuthMessage(error))
      setIsGoogleSigningIn(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Order fresh, homemade tiffin in a couple of taps."
    >
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
          {isGoogleSigningIn ? 'Redirecting to Google…' : 'Sign up with Google'}
        </Button>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-muted w-full" />
          <span className="bg-background px-3 text-xs text-muted-foreground uppercase font-medium absolute">
            Or sign up with email
          </span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Full Name */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input autoComplete="name" placeholder="Your name" className="min-h-[44px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email with Individual Validation */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Email</FormLabel>
                  {checkingEmail ? (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Loader2 className="size-3 animate-spin" /> Checking...
                    </span>
                  ) : emailStatus === 'available' ? (
                    <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="size-3" /> Available
                    </span>
                  ) : emailStatus === 'taken' ? (
                    <span className="text-[11px] text-destructive flex items-center gap-1 font-medium">
                      <AlertCircle className="size-3" /> Already registered
                    </span>
                  ) : null}
                </div>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="min-h-[44px]"
                    {...field}
                    onBlur={() => {
                      field.onBlur()
                      handleEmailBlur()
                    }}
                    onChange={(e) => {
                      field.onChange(e)
                      if (emailStatus !== 'idle') setEmailStatus('idle')
                    }}
                  />
                </FormControl>
                <FormMessage />
                {emailStatus === 'taken' ? (
                  <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1 flex items-center justify-between">
                    <span>Already have an account?</span>
                    <Link to={ROUTES.login} className="font-semibold underline ml-1 text-primary">
                      Sign in here →
                    </Link>
                  </p>
                ) : null}
              </FormItem>
            )}
          />

          {/* Mobile Number with Individual Validation */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Mobile number (India)</FormLabel>
                  {checkingPhone ? (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Loader2 className="size-3 animate-spin" /> Checking...
                    </span>
                  ) : phoneStatus === 'available' ? (
                    <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="size-3" /> Available
                    </span>
                  ) : phoneStatus === 'taken' ? (
                    <span className="text-[11px] text-destructive flex items-center gap-1 font-medium">
                      <AlertCircle className="size-3" /> Mobile already registered
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center px-3 min-h-[44px] rounded-lg border border-border bg-neutral-100 text-sm font-semibold text-muted-foreground select-none">
                    +91
                  </span>
                  <FormControl>
                    <Input
                      type="tel"
                      autoComplete="tel"
                      placeholder="98765 43210"
                      className="min-h-[44px] flex-1"
                      {...field}
                      onBlur={() => {
                        field.onBlur()
                        handlePhoneBlur()
                      }}
                      onChange={(e) => {
                        field.onChange(e)
                        if (phoneStatus !== 'idle') setPhoneStatus('idle')
                      }}
                    />
                  </FormControl>
                </div>
                <FormMessage />
                {phoneStatus === 'taken' ? (
                  <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1 flex items-center justify-between">
                    <span>Mobile number is already registered.</span>
                    <Link to={ROUTES.login} className="font-semibold underline ml-1 text-primary">
                      Sign in instead →
                    </Link>
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    Must be a unique 10-digit mobile number for daily delivery updates.
                  </p>
                )}
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    autoComplete="new-password"
                    placeholder="At least 8 characters (with letter and number)"
                    className="min-h-[44px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <PasswordInput
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    className="min-h-[44px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Accept Terms */}
          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-2 pt-1">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-0.5 size-5"
                    />
                  </FormControl>
                  <FormLabel className="text-muted-foreground text-sm font-normal leading-snug">
                    I agree to the{' '}
                    <Link to={ROUTES.terms} className="text-primary hover:underline">
                      Terms & Conditions
                    </Link>{' '}
                    and{' '}
                    <Link to={ROUTES.privacy} className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full min-h-[48px] rounded-xl text-base font-bold shadow-md"
            size="lg"
            disabled={form.formState.isSubmitting || isGoogleSigningIn || checkingEmail || checkingPhone}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                <span>Creating account…</span>
              </>
            ) : (
              <>
                <UserPlus className="size-4 mr-2" aria-hidden />
                <span>Create account</span>
              </>
            )}
          </Button>
        </form>
      </Form>

      <p className="text-muted-foreground text-center text-sm pt-2">
        Already have an account?{' '}
        <Link to={ROUTES.login} className="text-primary font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
