import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { AuthLayout } from '@/layouts/auth-layout'
import { Button } from '@/components/ui/button'
import { resendVerificationEmail, toFriendlyAuthMessage } from '@/features/auth/services/auth-service'
import { ROUTES } from '@/constants'

export function VerifyEmailPage() {
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email
  const [isResending, setIsResending] = useState(false)
  const [resent, setResent] = useState(false)

  const handleResend = async () => {
    if (!email) return
    setIsResending(true)
    try {
      await resendVerificationEmail(email)
      setResent(true)
      toast.success('Verification email sent again.')
    } catch (error) {
      toast.error(toFriendlyAuthMessage(error))
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthLayout title="Verify your email" description="One last step before you can sign in.">
      <div className="space-y-6 text-center">
        <div className="bg-primary/10 text-primary mx-auto flex size-16 items-center justify-center rounded-full">
          <MailCheck className="size-8" aria-hidden />
        </div>
        <p className="text-muted-foreground text-sm">
          {email ? (
            <>
              We've sent a confirmation link to{' '}
              <span className="text-foreground font-medium">{email}</span>. Open it to activate
              your account.
            </>
          ) : (
            'Check your inbox for a confirmation link to activate your account.'
          )}
        </p>

        {email ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={isResending || resent}
          >
            {resent ? 'Email sent' : isResending ? 'Sending…' : 'Resend email'}
          </Button>
        ) : null}

        <Button asChild className="w-full">
          <Link to={ROUTES.login}>Back to sign in</Link>
        </Button>
      </div>
    </AuthLayout>
  )
}
