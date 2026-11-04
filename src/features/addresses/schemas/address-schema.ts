import { z } from 'zod'

export const addressSchema = z.object({
  label: z.enum(['home', 'work', 'other']),
  custom_label: z.string().trim().optional().or(z.literal('')),
  contact_name: z.string().trim().min(2, 'Enter a contact name'),
  contact_phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  place_category: z.enum(['commercial', 'residential', 'general']),
  company_name: z.string().trim().optional().or(z.literal('')),
  floor_no: z.string().trim().optional().or(z.literal('')),
  tower_block: z.string().trim().optional().or(z.literal('')),
  unit_no: z.string().trim().min(1, 'Enter office, flat, or unit number'),
  building_name: z.string().trim().min(2, 'Enter Building, Company, or Society name'),
  road_name: z.string().trim().optional().or(z.literal('')),
  landmark: z.string().trim().optional().or(z.literal('')),
  pincode: z.string().trim().regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit pincode'),
  latitude: z.number().nullable().refine((val) => val !== null && !isNaN(val) && val !== 0, {
    message: 'Please select your location via search or choose on map',
  }),
  longitude: z.number().nullable().refine((val) => val !== null && !isNaN(val) && val !== 0, {
    message: 'Please select your location via search or choose on map',
  }),
  sublocality: z.string().trim().min(2, 'Enter Area / Locality'),
  delivery_instructions: z.string().trim().optional().or(z.literal('')),
  meal_type_tag: z.enum(['lunch', 'dinner', 'both']),
  preferred_time: z.string().trim().optional().or(z.literal('')),
})

export type AddressInput = z.infer<typeof addressSchema>
