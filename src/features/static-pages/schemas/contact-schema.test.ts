import { describe, expect, it } from 'vitest'
import { contactSchema } from './contact-schema'

describe('contactSchema', () => {
  it('accepts a minimal valid message', () => {
    const result = contactSchema.safeParse({
      name: 'Viral',
      email: 'viral@example.com',
      message: 'How do I change my delivery address?',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a message shorter than 10 characters', () => {
    const result = contactSchema.safeParse({
      name: 'Viral',
      email: 'viral@example.com',
      message: 'too short',
    })
    expect(result.success).toBe(false)
  })

  it('allows phone and subject to be omitted', () => {
    const result = contactSchema.safeParse({
      name: 'Viral',
      email: 'viral@example.com',
      message: 'A message long enough to pass validation.',
      phone: '',
      subject: '',
    })
    expect(result.success).toBe(true)
  })
})
