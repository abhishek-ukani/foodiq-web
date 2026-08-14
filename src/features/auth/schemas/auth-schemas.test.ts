import { describe, expect, it } from 'vitest'
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from './auth-schemas'

describe('loginSchema', () => {
  it('accepts a valid email and non-empty password', () => {
    const result = loginSchema.safeParse({ email: 'a@example.com', password: 'anything' })
    expect(result.success).toBe(true)
  })

  it('rejects an empty email with a specific message', () => {
    const result = loginSchema.safeParse({ email: '', password: 'x' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('Email is required')
  })

  it('rejects a malformed email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'x' })
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  const valid = {
    fullName: 'Viral Bhalani',
    email: 'viral@example.com',
    phone: '9876543210',
    password: 'abc12345',
    confirmPassword: 'abc12345',
    acceptTerms: true,
  }

  it('accepts a fully valid payload', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects mismatched passwords, attributed to confirmPassword', () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: 'different' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(['confirmPassword'])
  })

  it('rejects a password with no digit', () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: 'abcdefgh',
      confirmPassword: 'abcdefgh',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a phone number not starting 6-9', () => {
    const result = registerSchema.safeParse({ ...valid, phone: '1234567890' })
    expect(result.success).toBe(false)
  })

  it('rejects when terms are not accepted', () => {
    const result = registerSchema.safeParse({ ...valid, acceptTerms: false })
    expect(result.success).toBe(false)
  })
})

describe('forgotPasswordSchema', () => {
  it('requires a valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'a@b.com' }).success).toBe(true)
    expect(forgotPasswordSchema.safeParse({ email: '' }).success).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  it('accepts matching strong passwords', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'abc12345',
      confirmPassword: 'abc12345',
    })
    expect(result.success).toBe(true)
  })

  it('rejects mismatched passwords', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'abc12345',
      confirmPassword: 'xyz98765',
    })
    expect(result.success).toBe(false)
  })
})
