import { describe, expect, it } from 'vitest'
import { addressSchema } from './address-schema'

const valid = {
  label: 'home' as const,
  contact_name: 'Viral Bhalani',
  contact_phone: '9876543210',
  address_line1: '42 Test Lane, Satellite',
  address_line2: '',
  landmark: '',
  city: 'Ahmedabad',
  state: 'Gujarat',
  pincode: '380015',
}

describe('addressSchema', () => {
  it('accepts a fully valid address', () => {
    expect(addressSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a pincode that is not 6 digits', () => {
    expect(addressSchema.safeParse({ ...valid, pincode: '3800' }).success).toBe(false)
  })

  it('rejects a phone number not starting 6-9', () => {
    expect(addressSchema.safeParse({ ...valid, contact_phone: '1234567890' }).success).toBe(false)
  })

  it('rejects a too-short address line', () => {
    expect(addressSchema.safeParse({ ...valid, address_line1: 'Hi' }).success).toBe(false)
  })

  it('rejects an invalid label', () => {
    expect(addressSchema.safeParse({ ...valid, label: 'office' }).success).toBe(false)
  })
})
