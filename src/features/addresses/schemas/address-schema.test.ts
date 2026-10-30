import { describe, expect, it } from 'vitest'
import { addressSchema } from './address-schema'

const validCommercial = {
  label: 'work' as const,
  place_category: 'commercial' as const,
  contact_name: 'Viral Bhalani',
  contact_phone: '9876543210',
  company_name: 'DevX Tech',
  floor_no: '7th Floor',
  unit_no: 'Office 702',
  building_name: 'Mondeal Heights',
  sublocality: 'Bodakdev',
  pincode: '380015',
  meal_type_tag: 'both' as const,
}

const validResidential = {
  label: 'home' as const,
  place_category: 'residential' as const,
  contact_name: 'Viral Bhalani',
  contact_phone: '9876543210',
  tower_block: 'Block B',
  unit_no: 'Flat 402',
  building_name: 'Goyal Intercity',
  sublocality: 'Drive In Road',
  pincode: '380054',
  meal_type_tag: 'both' as const,
}

describe('addressSchema', () => {
  it('accepts a fully valid commercial office address', () => {
    expect(addressSchema.safeParse(validCommercial).success).toBe(true)
  })

  it('accepts a fully valid residential society address', () => {
    expect(addressSchema.safeParse(validResidential).success).toBe(true)
  })

  it('rejects a pincode that is not an Ahmedabad 380xxx pincode', () => {
    expect(addressSchema.safeParse({ ...validCommercial, pincode: '400001' }).success).toBe(false)
  })

  it('rejects a phone number not starting 6-9', () => {
    expect(addressSchema.safeParse({ ...validCommercial, contact_phone: '1234567890' }).success).toBe(false)
  })

  it('rejects an empty unit number', () => {
    expect(addressSchema.safeParse({ ...validCommercial, unit_no: '' }).success).toBe(false)
  })

  it('rejects an invalid label', () => {
    expect(addressSchema.safeParse({ ...validCommercial, label: 'invalid_label' as any }).success).toBe(false)
  })
})
