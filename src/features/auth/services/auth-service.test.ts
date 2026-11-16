import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
  normalizePhone,
  toFriendlyAuthMessage,
  checkCredentialAvailability,
  signInWithGoogle,
  signInWithIdentifier,
  signUpWithEmail,
  resendVerificationEmail,
} from './auth-service'
import { supabase } from '@/lib/supabase'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(),
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      resend: vi.fn(),
    },
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('normalizePhone', () => {
  it('returns empty string on empty input', () => {
    expect(normalizePhone('')).toBe('')
  })

  it('strips non-digit characters and retains 10 digits', () => {
    expect(normalizePhone('+91 98765-43210')).toBe('9876543210')
    expect(normalizePhone('09876543210')).toBe('9876543210')
    expect(normalizePhone('9876543210')).toBe('9876543210')
  })
})

describe('toFriendlyAuthMessage', () => {
  it('maps invalid login credentials', () => {
    expect(toFriendlyAuthMessage(new Error('Invalid login credentials'))).toContain(
      'Incorrect email or password',
    )
  })

  it('maps unconfirmed email', () => {
    expect(toFriendlyAuthMessage(new Error('Email not confirmed'))).toContain(
      'verify your email',
    )
  })

  it('maps already registered / duplicate email', () => {
    expect(toFriendlyAuthMessage(new Error('User already registered'))).toContain(
      'already exists',
    )
  })

  it('maps duplicate phone', () => {
    expect(toFriendlyAuthMessage(new Error('phone already exists'))).toContain(
      'mobile number is already registered',
    )
  })

  it('maps email rate limit error', () => {
    expect(toFriendlyAuthMessage(new Error('over_email_send_rate_limit'))).toContain(
      'rate limit',
    )
  })
})

describe('checkCredentialAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns taken status when RPC reports email is not available', async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: { emailAvailable: false, phoneAvailable: true },
      error: null,
    } as any)

    const result = await checkCredentialAvailability({ email: 'abhishekukani9@gmail.com' })

    expect(result.emailAvailable).toBe(false)
    expect(result.phoneAvailable).toBe(true)
    expect(result.isVerified).toBe(true)
    expect(result.emailError).toContain('already exists')
  })

  it('returns taken status when RPC reports phone is not available', async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: { emailAvailable: true, phoneAvailable: false },
      error: null,
    } as any)

    const result = await checkCredentialAvailability({ phone: '9999886666' })

    expect(result.emailAvailable).toBe(true)
    expect(result.phoneAvailable).toBe(false)
    expect(result.isVerified).toBe(true)
    expect(result.phoneError).toContain('already registered')
  })

  it('marks isVerified as false when RPC fails and direct table query returns empty (RLS protection)', async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: null,
      error: { message: 'function check_credential_availability does not exist' },
    } as any)

    const mockSelect = vi.fn().mockReturnThis()
    const mockIlike = vi.fn().mockReturnThis()
    const mockLimit = vi.fn().mockResolvedValueOnce({ data: [], error: null })

    vi.mocked(supabase.from).mockReturnValueOnce({
      select: mockSelect,
      ilike: mockIlike,
      limit: mockLimit,
    } as any)

    const result = await checkCredentialAvailability({ email: 'abhishekukani9@gmail.com' })

    // When RPC is missing and direct table returns 0 rows due to RLS,
    // isVerified must be false so the UI avoids showing a false positive "Available"
    expect(result.isVerified).toBe(false)
    expect(result.emailAvailable).toBe(true)
  })

  it('detects taken email when direct table query successfully returns a row', async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: null,
      error: { message: 'function check_credential_availability does not exist' },
    } as any)

    const mockSelect = vi.fn().mockReturnThis()
    const mockIlike = vi.fn().mockReturnThis()
    const mockLimit = vi.fn().mockResolvedValueOnce({
      data: [{ id: '84ef3d3f', email: 'abhishekukani9@gmail.com' }],
      error: null,
    })

    vi.mocked(supabase.from).mockReturnValueOnce({
      select: mockSelect,
      ilike: mockIlike,
      limit: mockLimit,
    } as any)

    const result = await checkCredentialAvailability({ email: 'abhishekukani9@gmail.com' })

    expect(result.emailAvailable).toBe(false)
    expect(result.isVerified).toBe(true)
    expect(result.emailError).toContain('already exists')
  })
})

describe('signInWithGoogle', () => {
  it('forwards custom redirectTo URL to Supabase OAuth', async () => {
    vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValueOnce({
      data: { provider: 'google', url: 'https://accounts.google.com/o/oauth2' },
      error: null,
    } as any)

    const customRedirect = 'https://foodiq.com/login?redirect=%2Fcheckout'
    await signInWithGoogle(customRedirect)

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: customRedirect,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
  })
})

describe('signUpWithEmail', () => {
  it('skips availability check when skipAvailabilityCheck is true', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      data: { user: { id: 'user-123', identities: [{ id: 'id-1' }] } as any, session: null },
      error: null,
    })

    const mockUpsert = vi.fn().mockResolvedValueOnce({ error: null })
    vi.mocked(supabase.from).mockReturnValueOnce({
      upsert: mockUpsert,
    } as any)

    await signUpWithEmail({
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '9876543210',
      password: 'password123',
      skipAvailabilityCheck: true,
    })

    // supabase.rpc should not be called since checkCredentialAvailability was skipped
    expect(supabase.rpc).not.toHaveBeenCalled()
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: {
          full_name: 'Test User',
          phone: '9876543210',
        },
        emailRedirectTo: expect.stringContaining('/verify-email'),
      },
    })
  })
})

describe('resendVerificationEmail', () => {
  it('calls resend with verify-email redirect destination', async () => {
    vi.mocked(supabase.auth.resend).mockResolvedValueOnce({
      data: {} as any,
      error: null,
    })

    await resendVerificationEmail('customer@example.com')

    expect(supabase.auth.resend).toHaveBeenCalledWith({
      type: 'signup',
      email: 'customer@example.com',
      options: {
        emailRedirectTo: expect.stringContaining('/verify-email'),
      },
    })
  })
})

describe('signInWithIdentifier', () => {
  it('authenticates directly with email when input contains @', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: { id: 'u1' } as any, session: {} as any },
      error: null,
    })

    await signInWithIdentifier({ identifier: 'kaka@example.com', password: 'secretpassword' })

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'kaka@example.com',
      password: 'secretpassword',
    })
  })

  it('looks up registered email from profiles table when 10-digit phone is entered', async () => {
    const mockSelect = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockReturnThis()
    const mockLimit = vi.fn().mockReturnThis()
    const mockMaybeSingle = vi.fn().mockResolvedValueOnce({
      data: { email: 'elderly_customer@foodiq.in' },
      error: null,
    })

    vi.mocked(supabase.from).mockReturnValueOnce({
      select: mockSelect,
      eq: mockEq,
      limit: mockLimit,
      maybeSingle: mockMaybeSingle,
    } as any)

    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: { id: 'u2' } as any, session: {} as any },
      error: null,
    })

    await signInWithIdentifier({ identifier: '+91 98765-43210', password: 'secretpassword' })

    expect(supabase.from).toHaveBeenCalledWith('profiles')
    expect(mockEq).toHaveBeenCalledWith('phone', '9876543210')
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'elderly_customer@foodiq.in',
      password: 'secretpassword',
    })
  })

  it('throws friendly error when phone number is not found in profiles', async () => {
    const mockSelect = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockReturnThis()
    const mockLimit = vi.fn().mockReturnThis()
    const mockMaybeSingle = vi.fn().mockResolvedValueOnce({
      data: null,
      error: null,
    })

    vi.mocked(supabase.from).mockReturnValueOnce({
      select: mockSelect,
      eq: mockEq,
      limit: mockLimit,
      maybeSingle: mockMaybeSingle,
    } as any)

    await expect(
      signInWithIdentifier({ identifier: '9876543210', password: 'secretpassword' }),
    ).rejects.toThrow('No account found for this mobile number')
  })
})
