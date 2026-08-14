import { z } from 'zod'

export const personalInfoSchema = z.object({
  full_name: z.string().trim().min(2, 'Enter your full name'),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  marketing_opt_in: z.boolean(),
})
export type PersonalInfoInput = z.infer<typeof personalInfoSchema>
