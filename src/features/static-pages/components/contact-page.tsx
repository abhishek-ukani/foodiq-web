import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { Mail, MapPin, MessageCircleCheck, Phone, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { contactSchema, type ContactInput } from '@/features/static-pages/schemas/contact-schema'
import { submitContactMessage } from '@/features/static-pages/services/content-service'

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', subject: '', message: '' },
  })

  const mutation = useMutation({
    mutationFn: submitContactMessage,
    onSuccess: () => setSubmitted(true),
  })

  const onSubmit = (values: ContactInput) => mutation.mutate(values)

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">Get in touch</h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-lg text-lg">
          Questions about an order, delivery areas, or just want to say hello — we&apos;d love to
          hear from you.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="space-y-5 pt-6">
              <div className="flex items-start gap-3">
                <MapPin className="text-primary mt-0.5 size-5 shrink-0" aria-hidden />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-muted-foreground text-sm">Ahmedabad, Gujarat</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="text-primary mt-0.5 size-5 shrink-0" aria-hidden />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-muted-foreground text-sm">+91 99999 99999</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="text-primary mt-0.5 size-5 shrink-0" aria-hidden />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-muted-foreground text-sm">hello@thakarrasoi.com</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardContent className="pt-6">
              {submitted ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-full">
                    <MessageCircleCheck className="size-7" aria-hidden />
                  </div>
                  <p className="font-medium">Message sent</p>
                  <p className="text-muted-foreground text-sm">
                    Thanks for reaching out — we&apos;ll get back to you shortly.
                  </p>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (optional)</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="98765 43210" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Order query" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="How can we help?"
                              rows={5}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={mutation.isPending}>
                      <Send className="size-4" aria-hidden />
                      {mutation.isPending ? 'Sending…' : 'Send message'}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
