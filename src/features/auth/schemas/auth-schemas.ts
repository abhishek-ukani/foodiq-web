import { z } from 'zod'

const email = z.string().trim().min(1, 'Email is required').email('Enter a valid email address')

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-zA-Z]/, 'Password must include at least one letter')
  .regex(/[0-9]/, 'Password must include at least one number')

const phone = z
  .string()
  .trim()
  .transform((val) => val.replace(/\D/g, '').slice(-10))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9'))

export const loginSchema = z
  .object({
    identifier: z.string().trim().optional(),
    email: z.string().trim().optional(),
    password: z.string().min(1, 'Password is required'),
  })
  .superRefine((data, ctx) => {
    const raw = (data.identifier ?? data.email ?? '').trim()
    if (!raw) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          data.email !== undefined && data.identifier === undefined
            ? 'Email is required'
            : 'Mobile number or email is required',
        path: [data.identifier !== undefined ? 'identifier' : 'email'],
      })
      return
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)
    const cleanPhone = raw.replace(/\D/g, '').slice(-10)
    const isPhone = /^[6-9]\d{9}$/.test(cleanPhone)
    if (!isEmail && !isPhone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a valid 10-digit mobile number or email address',
        path: [data.identifier !== undefined ? 'identifier' : 'email'],
      })
    }
  })
  .transform((data) => ({
    identifier: (data.identifier || data.email)!.trim(),
    email: (data.email || data.identifier)!.trim(),
    password: data.password,
  }))
export type LoginInput = z.input<typeof loginSchema>
export type LoginOutput = z.output<typeof loginSchema>

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter your full name'),
    email,
    phone,
    password,
    confirmPassword: z.string().min(1, 'Confirm your password'),
    acceptTerms: z
      .boolean()
      .refine((value) => value === true, 'You must accept the Terms & Conditions to continue'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
export type RegisterInput = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({ email })
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
