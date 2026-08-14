import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  phone: z.string().trim().optional().or(z.literal('')),
  subject: z.string().trim().optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Tell us a little more (at least 10 characters)'),
})
export type ContactInput = z.infer<typeof contactSchema>
