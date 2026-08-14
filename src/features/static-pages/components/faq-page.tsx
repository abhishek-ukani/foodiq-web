import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { HelpCircle, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { EmptyState } from '@/components/common/empty-state'
import { useFaqs } from '@/features/static-pages/hooks/use-content-queries'
import { ROUTES } from '@/constants'

export function FaqPage() {
  const { data: faqs, isPending } = useFaqs()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!faqs) return []
    const query = search.trim().toLowerCase()
    if (!query) return faqs
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query),
    )
  }, [faqs, search])

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-10 text-center">
        <div className="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-xl">
          <HelpCircle className="size-6" aria-hidden />
        </div>
        <h1 className="font-display mt-4 text-4xl font-semibold">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mt-3">
          Can&apos;t find what you&apos;re looking for?{' '}
          <Link to={ROUTES.contact} className="text-primary hover:underline">
            Contact us
          </Link>
          .
        </p>
      </div>

      <div className="relative mb-8">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" aria-hidden />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions…"
          className="pl-9"
        />
      </div>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : !filtered.length ? (
        <EmptyState
          icon={HelpCircle}
          title={search ? 'No matching questions' : 'No FAQs published yet'}
          description={search ? 'Try a different search term.' : 'Check back soon.'}
        />
      ) : (
        <Accordion type="single" collapsible>
          {filtered.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}
