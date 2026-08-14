import { z } from 'zod'

export const addressSchema = z.object({
  label: z.enum(['home', 'work', 'other']),
  contact_name: z.string().trim().min(2, 'Enter a contact name'),
  contact_phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  address_line1: z.string().trim().min(5, 'Enter your address'),
  address_line2: z.string().trim().optional().or(z.literal('')),
  landmark: z.string().trim().optional().or(z.literal('')),
  city: z.string().trim().min(2, 'Enter a city'),
  state: z.string().trim().min(2, 'Enter a state'),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
})
export type AddressInput = z.infer<typeof addressSchema>
