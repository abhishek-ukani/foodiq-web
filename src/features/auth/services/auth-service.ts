import type { AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { env } from '@/lib/env'

/**
 * Normalizes phone numbers to standard 10-digit Indian mobile format
 * (strips non-digits, country code +91 or leading 0).
 */
export function normalizePhone(rawPhone: string): string {
  if (!rawPhone) return ''
  const digits = rawPhone.replace(/\D/g, '')
  return digits.length > 10 ? digits.slice(-10) : digits
}

/**
 * Supabase's raw error messages are written for developers, not customers.
 * Map the ones users actually hit to something they can act on.
 */
export function toFriendlyAuthMessage(error: AuthError | Error | unknown): string {
  const message = error instanceof Error ? error.message : String(error)

  if (/Invalid login credentials/i.test(message)) {
    return 'Incorrect email or password. Please check your credentials and try again.'
  }
  if (/Email not confirmed/i.test(message)) {
    return 'Please verify your email before signing in — check your inbox or spam folder for the confirmation link.'
  }
  if (/already registered|user already exists|email.*exists/i.test(message)) {
    return 'An account with this email address already exists. Try signing in instead.'
  }
  if (/phone.*already|phone.*exists/i.test(message)) {
    return 'This mobile number is already registered to an account. Please use a different number or sign in.'
  }
  if (/over_email_send_rate_limit|email rate limit/i.test(message)) {
    return 'Email service rate limit reached by mail provider. Please wait a few minutes before requesting another verification email.'
  }
  if (/rate limit/i.test(message)) {
    return 'Too many attempts. Please wait a minute and try again.'
  }
  if (/network/i.test(message)) {
    return 'Network error. Check your internet connection and try again.'
  }
  return message || 'Something went wrong. Please try again.'
}

export interface CredentialAvailabilityResult {
  emailAvailable: boolean
  phoneAvailable: boolean
  emailError?: string
  phoneError?: string
  isVerified: boolean
}

/**
 * Checks whether an email address or mobile number is already registered
 * in the database. Performs independent validation on each value.
 *
 * If the database RPC is not configured and direct queries are shielded by RLS,
 * `isVerified` will be false to prevent misleading UI false positives ("✓ Available").
 */
export async function checkCredentialAvailability(input: {
  email?: string
  phone?: string
}): Promise<CredentialAvailabilityResult> {
  const cleanEmail = input.email ? input.email.trim().toLowerCase() : ''
  const cleanPhone = input.phone ? normalizePhone(input.phone) : ''

  let emailAvailable = true
  let phoneAvailable = true
  let emailError: string | undefined
  let phoneError: string | undefined
  let isVerified = false

  // 1. Try server-side RPC (SECURITY DEFINER runs as owner and inspects both auth.users & public.profiles)
  try {
    const { data: rpcData, error: rpcError } = await (supabase.rpc as any)(
      'check_credential_availability',
      {
        p_email: cleanEmail || null,
        p_phone: cleanPhone || null,
      },
    )

    if (!rpcError && rpcData && typeof rpcData === 'object') {
      isVerified = true
      if (rpcData.emailAvailable === false) {
        emailAvailable = false
        emailError = 'An account with this email address already exists.'
      }
      if (rpcData.phoneAvailable === false) {
        phoneAvailable = false
        phoneError = 'This mobile number is already registered to another account.'
      }
      return { emailAvailable, phoneAvailable, emailError, phoneError, isVerified }
    }
  } catch (err) {
    console.debug('check_credential_availability RPC not available, testing direct table queries:', err)
  }

  // 2. Direct profiles table query fallback (works if SELECT policy is enabled for anon/public)
  try {
    if (cleanEmail) {
      const { data: emailRows, error: emailErr } = await supabase
        .from('profiles')
        .select('id, email')
        .ilike('email', cleanEmail)
        .limit(1)

      if (!emailErr && emailRows && emailRows.length > 0) {
        emailAvailable = false
        emailError = 'An account with this email address already exists.'
        isVerified = true
      }
    }

    if (cleanPhone && cleanPhone.length === 10) {
      const { data: phoneRows, error: phoneErr } = await supabase
        .from('profiles')
        .select('id, phone')
        .eq('phone', cleanPhone)
        .limit(1)

      if (!phoneErr && phoneRows && phoneRows.length > 0) {
        phoneAvailable = false
        phoneError = 'This mobile number is already registered to another account.'
        isVerified = true
      }
    }
  } catch (err) {
    console.debug('Direct profiles check error:', err)
  }

  return { emailAvailable, phoneAvailable, emailError, phoneError, isVerified }
}

export async function signUpWithEmail(input: {
  fullName: string
  email: string
  phone: string
  password: string
}) {
  const cleanEmail = input.email.trim().toLowerCase()
  const cleanPhone = normalizePhone(input.phone)

  // 1. Pre-signup check: Validate individual credential uniqueness
  const availability = await checkCredentialAvailability({
    email: cleanEmail,
    phone: cleanPhone,
  })

  if (!availability.emailAvailable) {
    throw new Error('An account with this email address already exists. Try signing in instead.')
  }

  if (!availability.phoneAvailable) {
    throw new Error(
      'This mobile number is already registered to an account. Please use a different number or sign in.',
    )
  }

  // 2. Perform Supabase Auth SignUp
  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName.trim(),
        phone: cleanPhone,
      },
      emailRedirectTo: `${env.appUrl}/login`,
    },
  })

  if (error) {
    const errorMsg = error.message.toLowerCase()
    if (
      errorMsg.includes('already registered') ||
      errorMsg.includes('user already exists') ||
      errorMsg.includes('email exists') ||
      (errorMsg.includes('email') && (errorMsg.includes('already') || errorMsg.includes('registered')))
    ) {
      throw new Error('An account with this email address already exists. Try signing in instead.')
    }
    if (
      errorMsg.includes('phone') &&
      (errorMsg.includes('exists') || errorMsg.includes('already') || errorMsg.includes('unique'))
    ) {
      throw new Error('This mobile number is already registered to an account. Please use a different number.')
    }
    if (errorMsg.includes('over_email_send_rate_limit') || errorMsg.includes('email rate limit')) {
      throw new Error(
        'Email delivery rate limit reached. If testing locally, please disable "Confirm email" in Supabase Auth or wait a few minutes.',
      )
    }
    throw error
  }

  // 3. Detect duplicate email via empty identities array (Supabase security feature)
  // When an email already exists in Supabase and email confirmation is on, signUp returns data.user with identities: []
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new Error('An account with this email address already exists. Try signing in instead.')
  }

  // 4. Ensure profile record is inserted/synced with full_name and phone
  if (data.user) {
    try {
      const { error: upsertErr } = await (supabase.from('profiles') as any).upsert(
        {
          id: data.user.id,
          email: cleanEmail,
          phone: cleanPhone,
          full_name: input.fullName.trim(),
          role: 'customer',
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )

      if (upsertErr) {
        const uMsg = (upsertErr.message || '').toLowerCase()
        if (uMsg.includes('phone') && (uMsg.includes('unique') || uMsg.includes('duplicate'))) {
          throw new Error('This mobile number is already registered to another account. Please use a different number or sign in.')
        }
        console.warn('Profile sync warning:', upsertErr)
      }
    } catch (profileErr: any) {
      if (profileErr.message?.includes('mobile number is already registered')) {
        throw profileErr
      }
      console.warn('Profile sync fallback:', profileErr)
    }
  }

  return data
}

export async function signInWithEmail(input: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email.trim().toLowerCase(),
    password: input.password,
  })
  if (error) throw error
  return data
}

export async function signInWithGoogle(redirectTo?: string) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo || `${env.appUrl}/login`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function sendPasswordResetEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${env.appUrl}/reset-password`,
  })
  if (error) throw error
}

/** Called on the reset-password page, after Supabase establishes a recovery session from the email link. */
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function resendVerificationEmail(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim().toLowerCase(),
    options: { emailRedirectTo: `${env.appUrl}/login` },
  })
  if (error) throw error
}

/**
 * Verifies user email using the 6-digit confirmation token/OTP provided in the email.
 * This logs the user in immediately without requiring link redirect.
 */
export async function verifyEmailOtp(email: string, token: string) {
  const cleanEmail = email.trim().toLowerCase()
  const cleanToken = token.trim()
  const { data, error } = await supabase.auth.verifyOtp({
    email: cleanEmail,
    token: cleanToken,
    type: 'signup',
  })
  if (error) throw error
  return data
}
