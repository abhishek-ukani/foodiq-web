import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Info, KeyRound, Loader2, MailCheck, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { AuthLayout } from '@/layouts/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { resendVerificationEmail, verifyEmailOtp, toFriendlyAuthMessage } from '@/features/auth/services/auth-service'
import { useAuth } from '@/hooks/use-auth'
import { ROUTES } from '@/constants'

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const searchParams = new URLSearchParams(location.search)
  const initialEmail = (location.state as { email?: string } | null)?.email || searchParams.get('email') || ''

  const [email, setEmail] = useState(initialEmail)
  const [isEditingEmail, setIsEditingEmail] = useState(!initialEmail)
  const [otp, setOtp] = useState('')
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [urlError, setUrlError] = useState<string | null>(null)

  // Detect any expired token or hash errors in the URL
  useEffect(() => {
    const hash = window.location.hash.substring(1)
    const hashParams = new URLSearchParams(hash)
    const errorDesc = hashParams.get('error_description') || searchParams.get('error_description')
    if (errorDesc) {
      setUrlError(decodeURIComponent(errorDesc.replace(/\+/g, ' ')))
    }
  }, [searchParams])

  // If user is already authenticated (e.g., clicked confirmation link or confirmed), bounce them home
  useEffect(() => {
    if (isAuthenticated) {
      toast.success('Your account is verified! Welcome to FoodIQ.')
      navigate(ROUTES.home, { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Cooldown timer to prevent hitting mail server rate limits
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanToken = otp.trim()
    const targetEmail = email.trim().toLowerCase()

    if (!targetEmail || !targetEmail.includes('@')) {
      toast.error('Please enter a valid email address.')
      setIsEditingEmail(true)
      return
    }

    if (!cleanToken || cleanToken.length < 6) {
      toast.error('Please enter the 6-digit confirmation code from your email.')
      return
    }

    setIsVerifyingOtp(true)
    try {
      await verifyEmailOtp(targetEmail, cleanToken)
      toast.success('Email verified successfully! Welcome to FoodIQ.')
      navigate(ROUTES.home, { replace: true })
    } catch (error) {
      toast.error(toFriendlyAuthMessage(error))
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  const handleResend = async () => {
    const targetEmail = email.trim().toLowerCase()
    if (!targetEmail || !targetEmail.includes('@')) {
      toast.error('Please enter a valid email address.')
      return
    }

    setIsResending(true)
    try {
      await resendVerificationEmail(targetEmail)
      setCooldown(60) // 60s cooldown to protect against rate limits
      setUrlError(null)
      toast.success('New verification link & code dispatched! Please check your inbox.')
    } catch (error) {
      toast.error(toFriendlyAuthMessage(error))
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthLayout
      title="Verify your email"
      description="One last step before you can enjoy fresh daily tiffins."
    >
      <div className="space-y-5 text-center">
        <div className="bg-primary/10 text-primary mx-auto flex size-16 items-center justify-center rounded-2xl shadow-inner">
          <MailCheck className="size-8" aria-hidden />
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-bold text-foreground">
            Confirmation email dispatched
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We sent a verification link &amp; code to{' '}
            <strong className="text-foreground font-semibold">{email || 'your email'}</strong>.
          </p>
        </div>

        {urlError ? (
          <Alert className="rounded-xl border-destructive/50 bg-destructive/10 text-destructive text-left p-3.5">
            <Info className="size-4 mt-0.5" />
            <AlertDescription className="text-xs space-y-1 ml-1">
              <p className="font-semibold">Verification link issue:</p>
              <p>{urlError}</p>
              <p className="text-[11px] text-muted-foreground">
                You can enter the 6-digit code from the email below, or click &quot;Resend verification email&quot; for a fresh link.
              </p>
            </AlertDescription>
          </Alert>
        ) : null}

        {/* 6-Digit OTP Form */}
        <div className="bg-neutral-50 border border-border rounded-2xl p-4 text-left space-y-3">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="size-3.5 text-primary" />
                <span>Enter 6-digit confirmation code</span>
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">From email</span>
            </h3>
            <p className="text-[11px] text-muted-foreground">
              If the link in your email is not clickable, enter the 6-digit code shown in the message:
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                maxLength={8}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, ''))}
                className="text-center font-mono text-base font-bold tracking-widest min-h-[44px] bg-white"
              />
              <Button
                type="submit"
                disabled={isVerifyingOtp || otp.trim().length < 6 || !email}
                className="min-h-[44px] px-4 font-bold text-xs shrink-0 rounded-xl"
              >
                {isVerifyingOtp ? (
                  <>
                    <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                    <span>Verifying…</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5 mr-1.5" />
                    <span>Verify Code</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          {/* 1. Try Signing In directly */}
          <Button
            asChild
            className="w-full min-h-[44px] font-bold text-sm rounded-xl shadow-xs"
            size="lg"
          >
            <Link to={`${ROUTES.login}?email=${encodeURIComponent(email)}`}>
              <span>I've verified via email link — Sign In</span>
              <ArrowRight className="size-4 ml-1.5" />
            </Link>
          </Button>

          {/* 2. Resend Email Button with Cooldown */}
          <Button
            type="button"
            variant="outline"
            className="w-full min-h-[44px] rounded-xl text-xs font-semibold"
            onClick={handleResend}
            disabled={isResending || cooldown > 0 || !email}
          >
            {isResending ? (
              <>
                <Loader2 className="size-3.5 mr-2 animate-spin" />
                <span>Sending verification link…</span>
              </>
            ) : cooldown > 0 ? (
              <span>Resend available in {cooldown}s</span>
            ) : (
              <>
                <RefreshCw className="size-3.5 mr-1.5" />
                <span>Resend verification email</span>
              </>
            )}
          </Button>
        </div>

        {/* Change / Re-enter email toggle */}
        <div className="pt-1">
          {!isEditingEmail ? (
            <button
              type="button"
              onClick={() => setIsEditingEmail(true)}
              className="text-xs text-primary hover:underline font-medium"
            >
              Entered the wrong email? Change address
            </button>
          ) : (
            <div className="flex items-center gap-2 max-w-sm mx-auto p-2 bg-neutral-50 rounded-xl border border-border">
              <Input
                type="email"
                placeholder="Correct email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 text-xs"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => setIsEditingEmail(false)}
                className="h-9 px-3 text-xs"
              >
                Save
              </Button>
            </div>
          )}
        </div>

        {/* Helpful Delivery & Testing Guidance */}
        <Alert className="rounded-xl border-amber-300 bg-amber-50/70 text-left p-3.5 text-amber-900">
          <Info className="size-4 text-amber-600 mt-0.5" />
          <AlertDescription className="text-xs space-y-1.5 ml-1">
            <p className="font-semibold text-amber-950">Didn&apos;t receive the email?</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px] leading-relaxed">
              <li>Check your <strong>Spam</strong>, <strong>Junk</strong>, or <strong>Promotions</strong> folder.</li>
              <li>Wait 1–2 minutes; mail servers can occasionally be delayed.</li>
              <li>
                <strong>Testing Note:</strong> In development, mail provider rate limits may delay test emails.
                If you are testing locally, you can disable <em>&quot;Confirm email&quot;</em> in your Supabase Auth dashboard for instant login without verification.
              </li>
            </ul>
          </AlertDescription>
        </Alert>

        <p className="text-muted-foreground text-center text-xs pt-1">
          Need help?{' '}
          <Link to={ROUTES.contact} className="text-primary font-medium hover:underline">
            Contact Support
          </Link>{' '}
          or{' '}
          <Link to={ROUTES.register} className="text-primary font-medium hover:underline">
            Register with another account
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
