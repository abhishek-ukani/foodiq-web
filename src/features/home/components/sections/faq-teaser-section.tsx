import { Link } from 'react-router-dom'
import { HelpCircle } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useFaqs } from '@/features/static-pages/hooks/use-content-queries'
import { ROUTES } from '@/constants'

export function FaqTeaserSection() {
  const { data: faqs, isPending } = useFaqs()
  const preview = faqs?.slice(0, 5)

  // Supplementary section — an empty list or a fetch error look identical to
  // a visitor, and neither warrants an "Error" box on the homepage. Just hide it.
  if (!isPending && !preview?.length) return null

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-10 text-center">
        <p className="text-primary flex items-center justify-center gap-1.5 text-sm font-semibold tracking-wide uppercase">
          <HelpCircle className="size-4" aria-hidden />
          FAQs
        </p>
        <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">
          Common questions
        </h2>
      </div>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : (
        <Accordion type="single" collapsible>
          {preview?.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <div className="mt-8 text-center">
        <Button variant="outline" asChild>
          <Link to={ROUTES.faq}>View all FAQs</Link>
        </Button>
      </div>
    </section>
  )
}
