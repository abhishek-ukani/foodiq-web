import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
  normalizePhone,
  toFriendlyAuthMessage,
  checkCredentialAvailability,
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
