import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import {
  AlertCircle,
  Bike,
  Clock,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  MessageCircleCheck,
  Phone,
  RotateCcw,
  Send,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react'
import toast from 'react-hot-toast'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { contactSchema, type ContactInput } from '@/features/static-pages/schemas/contact-schema'
import { submitContactMessage } from '@/features/static-pages/services/content-service'
import { useAuth } from '@/hooks/use-auth'
import { CONTACT_INFO } from '@/constants'
import { Reveal } from '@/components/common/reveal'

const INQUIRY_CATEGORIES = [
  'Monthly Tiffin Subscription',
  "Today's Order or Delivery Status",
  'Bulk or Corporate Catering',
  'Jain Food or Dietary Query',
  'Feedback or General Inquiry',
] as const

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const { user, profile } = useAuth()

  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: profile?.full_name || (user?.user_metadata?.full_name as string) || '',
      email: profile?.email || user?.email || '',
      phone: profile?.phone || '',
      subject: INQUIRY_CATEGORIES[0],
      message: '',
    },
  })

  // Prefill user details when profile / user finishes loading
  useEffect(() => {
    if (user || profile) {
      const currentValues = form.getValues()
      form.reset({
        name: currentValues.name || profile?.full_name || (user?.user_metadata?.full_name as string) || '',
        email: currentValues.email || profile?.email || user?.email || '',
        phone: currentValues.phone || profile?.phone || '',
        subject: currentValues.subject || INQUIRY_CATEGORIES[0],
        message: currentValues.message || '',
      })
    }
  }, [user, profile, form])

  const mutation = useMutation({
    mutationFn: (values: ContactInput) =>
      submitContactMessage({
        ...values,
        user_id: user?.id ?? null,
      }),
    onSuccess: () => {
      setSubmitted(true)
      toast.success('Thanks for reaching out! Your message has been sent.')
      form.reset({
        name: profile?.full_name || (user?.user_metadata?.full_name as string) || '',
        email: profile?.email || user?.email || '',
        phone: profile?.phone || '',
        subject: INQUIRY_CATEGORIES[0],
        message: '',
      })
    },
    onError: (error: any) => {
      const msg = error?.message || 'Failed to send message'
      if (msg.includes('row-level security') || error?.code === '42501') {
        toast.error(
          'Unable to submit message: Database RLS policy missing. Please run fix_contact_messages_rls.sql in Supabase SQL editor.'
        )
      } else {
        toast.error(msg)
      }
    },
  })

  const onSubmit = (values: ContactInput) => {
    mutation.mutate(values)
  }

  const onInvalid = (errors: any) => {
    const firstKey = Object.keys(errors)[0]
    if (firstKey && errors[firstKey]?.message) {
      toast.error(errors[firstKey].message)
    } else {
      toast.error('Please fill in the required fields correctly.')
    }
  }

  const whatsappDirectUrl = CONTACT_INFO.whatsappUrl(
    'Hello FoodIQ! I have a question regarding daily tiffins, today’s menu, or delivery in Ahmedabad.'
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      {/* ── 1. HEADER SECTION ── */}
      <div className="mb-10 sm:mb-12 text-center max-w-3xl mx-auto space-y-3">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="size-3.5" aria-hidden />
            <span>સંપર્ક કરો • Get in Touch</span>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl tracking-tight text-foreground">
            We&apos;re Here to Help
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Questions about monthly tiffin subscriptions, daily menus, delivery areas in Ahmedabad, or special Jain preparations? Reach out to our Bodakdev kitchen team.
          </p>
        </Reveal>
      </div>

      {/* ── 2. QUICK DIRECT CONTACT ACTION STRIP (Mobile Friendly) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 sm:mb-12">
        {/* WhatsApp Direct */}
        <a
          href={whatsappDirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center gap-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/25 p-4 sm:p-5 transition-all shadow-xs min-h-[64px]"
        >
          <div className="size-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <MessageCircle className="size-5.5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Fastest Response
            </p>
            <p className="font-display text-base font-bold text-foreground truncate">
              Chat on WhatsApp
            </p>
            <p className="text-xs text-muted-foreground">Tap to start chat</p>
          </div>
        </a>

        {/* Direct Phone Dial */}
        <a
          href={`tel:${CONTACT_INFO.phoneRaw}`}
          className="group relative flex items-center gap-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25 p-4 sm:p-5 transition-all shadow-xs min-h-[64px]"
        >
          <div className="size-11 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Phone className="size-5.5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Direct Kitchen Line
            </p>
            <p className="font-display text-base font-bold text-foreground truncate">
              {CONTACT_INFO.phone}
            </p>
            <p className="text-xs text-muted-foreground">7:30 AM – 9:30 PM</p>
          </div>
        </a>

        {/* Official Email */}
        <a
          href={`mailto:${CONTACT_INFO.email}`}
          className="group relative flex items-center gap-3.5 rounded-2xl bg-primary/10 hover:bg-primary/15 border border-primary/25 p-4 sm:p-5 transition-all shadow-xs min-h-[64px]"
        >
          <div className="size-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Mail className="size-5.5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Official Email
            </p>
            <p className="font-display text-base font-bold text-foreground truncate">
              {CONTACT_INFO.email}
            </p>
            <p className="text-xs text-muted-foreground">Replies within hours</p>
          </div>
        </a>
      </div>

      {/* ── 3. MAIN CONTENT: 2 COLUMNS (INFO + FORM) ── */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* ── LEFT COLUMN: Comprehensive Kitchen Info (5 Cols) ── */}
        <div className="space-y-5 lg:col-span-5">
          {/* Card: Kitchen Address & Takeaway Counter */}
          <Card className="border-border/80 shadow-xs">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="size-4.5" aria-hidden />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-bold text-foreground">
                      Bodakdev Kitchen &amp; Counter
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-500/25">
                      Only 1 Location • No Branches
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-0.5">
                    <p className="font-medium text-foreground">{CONTACT_INFO.address.line1},</p>
                    <p>{CONTACT_INFO.address.line2},</p>
                    <p>{CONTACT_INFO.address.area}, {CONTACT_INFO.address.city} – {CONTACT_INFO.address.pincode}</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground pt-1">
                    All meals are prepared exclusively at this single home kitchen under direct personal family supervision. We do not have any other branches.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-800 dark:text-amber-300">
                  <UtensilsCrossed className="size-3.5" />
                  <span>Delivery &amp; Takeaway Kitchen</span>
                </span>

                <a
                  href={CONTACT_INFO.address.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-primary hover:underline underline-offset-4"
                >
                  <span>View on Google Maps</span>
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </CardContent>
          </Card>



          {/* Card: Order Cutoff Reminders */}
          <Card className="border-border/80 bg-primary/5 shadow-xs">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  <span>Daily Order Cutoff Times</span>
                </span>
                <span className="text-[11px] text-muted-foreground">Fresh batches only</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-background border border-primary/20 p-2.5 space-y-1">
                  <span className="font-semibold text-primary block">Lunch Cutoff</span>
                  <p className="text-sm font-bold text-foreground">{CONTACT_INFO.cutoffs.lunchTime}</p>
                  <p className="text-[11px] text-muted-foreground">Delivered {CONTACT_INFO.cutoffs.lunchDelivery}</p>
                </div>
                <div className="rounded-xl bg-background border border-primary/20 p-2.5 space-y-1">
                  <span className="font-semibold text-primary block">Dinner Cutoff</span>
                  <p className="text-sm font-bold text-foreground">{CONTACT_INFO.cutoffs.dinnerTime}</p>
                  <p className="text-[11px] text-muted-foreground">Delivered {CONTACT_INFO.cutoffs.dinnerDelivery}</p>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                Please place orders before cutoff so our kitchen can cook and pack your hot tiffin without delays.
              </p>
            </CardContent>
          </Card>

          {/* Card: Serviceable Delivery Areas */}
          <Card className="border-border/80 shadow-xs">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-2">
                <Bike className="size-4 text-primary" />
                <h3 className="font-display text-sm font-bold text-foreground">
                  Delivering Across West Ahmedabad
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Free delivery within 3 km of Bodakdev. We also serve:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {CONTACT_INFO.deliveryAreas.map((area) => (
                  <span
                    key={area}
                    className="rounded-lg bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground/80"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT COLUMN: Send Message Form (7 Cols) ── */}
        <div className="lg:col-span-7">
          <Card className="border-border/80 shadow-md">
            <CardContent className="pt-6 sm:p-8">
              {submitted ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <div className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-2xl">
                    <MessageCircleCheck className="size-8" aria-hidden />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground">Message Sent Successfully!</h3>
                  <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
                    Thank you for reaching out to FoodIQ. Our kitchen team will review your message and reply via email or phone shortly.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubmitted(false)
                      mutation.reset()
                    }}
                    className="mt-4 min-h-[44px] cursor-pointer"
                  >
                    <RotateCcw className="mr-2 size-4" aria-hidden />
                    Send another message
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                      Send Us a Message
                    </h2>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                      Fill out the form below and we will get back to you promptly.
                    </p>
                  </div>

                  {/* Urgent Order Notice Callout */}
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 sm:p-3.5 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                    <Phone className="size-4 shrink-0 text-amber-600 mt-0.5" />
                    <span>
                      <strong>Have an active order today or urgent request?</strong> Call or WhatsApp us directly at{' '}
                      <a href={`tel:${CONTACT_INFO.phoneRaw}`} className="underline font-bold hover:text-amber-950">
                        {CONTACT_INFO.phone}
                      </a>{' '}
                      for fastest response before cutoff.
                    </span>
                  </div>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit, onInvalid)}
                      className="space-y-4 sm:space-y-5"
                      noValidate
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Name */}
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="contact-name-input">
                                Your Name <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  id="contact-name-input"
                                  placeholder="e.g. Ramesh Patel"
                                  className="min-h-[44px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Email */}
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="contact-email-input">
                                Email Address <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  id="contact-email-input"
                                  type="email"
                                  placeholder="you@example.com"
                                  className="min-h-[44px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Phone */}
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="contact-phone-input">Phone Number (optional)</FormLabel>
                              <FormControl>
                                <Input
                                  id="contact-phone-input"
                                  type="tel"
                                  placeholder="10-digit mobile number"
                                  className="min-h-[44px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Inquiry Category (Subject) */}
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="contact-subject-select">
                                What is your inquiry about?
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value || INQUIRY_CATEGORIES[0]}
                              >
                                <FormControl>
                                  <SelectTrigger id="contact-subject-select" className="min-h-[44px] w-full">
                                    <SelectValue placeholder="Select a topic" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {INQUIRY_CATEGORIES.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Message */}
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="contact-message-input">
                              Message Details <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                id="contact-message-input"
                                placeholder="Tell us how we can help you with your order, dietary preference, or tiffin subscription... (at least 10 characters)"
                                rows={5}
                                className="resize-y"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Error Banner */}
                      {mutation.isError && (
                        <div
                          role="alert"
                          className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-3 rounded-lg border p-3.5 text-sm"
                        >
                          <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
                          <div className="space-y-1">
                            <p className="font-semibold">Unable to send message</p>
                            <p className="text-destructive/90 text-xs leading-relaxed">
                              {(mutation.error as any)?.code === '42501' ||
                                mutation.error?.message?.includes('row-level security')
                                ? 'Database security policy restriction: public submissions on contact_messages are blocked by Row-Level Security. Please run fix_contact_messages_rls.sql in the Supabase SQL editor.'
                                : mutation.error?.message ||
                                'Something went wrong while sending your message. Please try again.'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Submit Button */}
                      <Button
                        id="contact-submit-btn"
                        type="submit"
                        className="min-h-[48px] w-full text-base font-semibold shadow-sm transition-all cursor-pointer"
                        disabled={mutation.isPending}
                      >
                        {mutation.isPending ? (
                          <>
                            <Loader2 className="size-4 animate-spin" aria-hidden />
                            <span>Sending message…</span>
                          </>
                        ) : (
                          <>
                            <Send className="size-4" aria-hidden />
                            <span>Send Message</span>
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
