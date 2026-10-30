import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { POLICIES_DATA_MAP, type PolicySection } from '@/features/static-pages/data/policies-data'
import type { PolicySlug } from '@/types/database.types'
import { ROUTES, CONTACT_INFO } from '@/constants'
import { cn } from '@/lib/utils'

interface PolicyPageProps {
  slug: PolicySlug
  fallbackTitle: string
}

export function PolicyPage({ slug, fallbackTitle }: PolicyPageProps) {
  const structuredData = POLICIES_DATA_MAP[slug]
  const [activeSectionId, setActiveSectionId] = useState<string>('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileTocOpen, setMobileTocOpen] = useState(false)

  const title = structuredData?.title || fallbackTitle
  const lastUpdated = structuredData?.lastUpdated || 'October 30, 2026'
  const sections = structuredData?.sections || []

  // Initialize active section
  useEffect(() => {
    if (sections.length > 0 && !activeSectionId) {
      setActiveSectionId(sections[0].id)
    }
  }, [sections, activeSectionId])

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id)
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSectionId(sections[i].id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sections])

  const scrollToSection = (id: string) => {
    setActiveSectionId(id)
    setMobileTocOpen(false)
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -90 // offset for sticky navbar
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  if (!structuredData) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-muted-foreground">This policy page is being prepared.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── 1. HEADER SECTION (Clean, seamless against navbar with zero duplicate home links) ── */}
      <header className="border-b border-border/70 bg-gradient-to-b from-amber-50/70 via-background to-background px-4 py-8 sm:px-6 sm:py-10 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3" />
              <span>{structuredData.badge}</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base font-sans leading-relaxed">
              {structuredData.subtitle}
            </p>
            <p className="pt-1 text-xs text-muted-foreground">
              Last updated: <span className="text-foreground font-semibold">{lastUpdated}</span>
            </p>
          </div>
        </div>
      </header>

      {/* ── 2. MOBILE TABLE OF CONTENTS (Expandable quick-jump bar) ── */}
      <div className="sticky top-14 z-30 border-b border-border bg-card/95 backdrop-blur-md px-4 py-3 lg:hidden shadow-xs">
        <button
          type="button"
          onClick={() => setMobileTocOpen(!mobileTocOpen)}
          className="flex min-h-[44px] w-full items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-primary"
        >
          <span>On this page ({sections.length} sections)</span>
          {mobileTocOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>

        {mobileTocOpen && (
          <div className="mt-3 max-h-72 space-y-1 overflow-y-auto border-t border-border pt-2">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  'flex min-h-[44px] w-full items-center rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors',
                  activeSectionId === section.id
                    ? 'bg-primary/15 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <span>{section.number}. {section.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. MAIN CONTENT: TWO-COLUMN SIDE-TABLE LAYOUT ── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          {/* Left Column: Sticky Side Table of Contents (Desktop) */}
          <aside className="hidden lg:block lg:w-72 xl:w-80 shrink-0">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  On This Page
                </span>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  aria-label={sidebarOpen ? 'Collapse Table of Contents' : 'Expand Table of Contents'}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {sidebarOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>
              </div>

              {sidebarOpen && (
                <nav className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                  {sections.map((section) => {
                    const isActive = activeSectionId === section.id
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => scrollToSection(section.id)}
                        className={cn(
                          'group flex min-h-[40px] w-full items-start rounded-xl px-3 py-2 text-left text-xs leading-relaxed transition-all',
                          isActive
                            ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        <span className="mr-2 shrink-0 font-medium opacity-70">
                          {section.number}.
                        </span>
                        <span className="truncate">{section.title}</span>
                      </button>
                    )
                  })}
                </nav>
              )}
            </div>
          </aside>

          {/* Right Column: Main Content Sheet on FoodIQ Clean Card */}
          <main className="flex-1 min-w-0">
            <article className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xs sm:p-10 lg:p-12">
              <div className="space-y-12">
                {sections.map((section: PolicySection) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-24 border-b border-border/60 pb-10 last:border-b-0 last:pb-0"
                  >
                    {/* Section Numbered Title in Classic Serif Font */}
                    <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {section.number}. {section.title}
                    </h2>

                    {/* Section Intro */}
                    {section.intro && (
                      <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground font-sans">
                        {section.intro}
                      </p>
                    )}

                    {/* Paragraphs */}
                    {section.paragraphs && (
                      <div className="mt-3 space-y-3">
                        {section.paragraphs.map((para, pIdx) => (
                          <p key={pIdx} className="text-sm sm:text-base leading-relaxed text-foreground/90 font-sans">
                            {para}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Golden Callout Box (Entity / Contact details matching original warm palette) */}
                    {section.callout?.entityDetails && (
                      <div className="my-6 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-background to-amber-100/30 p-5 sm:p-6 text-sm shadow-xs">
                        <h3 className="font-display text-lg font-bold text-foreground">
                          {section.callout.entityDetails.name}
                        </h3>
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary mt-0.5 mb-3">
                          [{section.callout.entityDetails.legalTitle}]
                        </p>
                        <div className="space-y-2 text-xs sm:text-sm text-foreground/90 font-sans">
                          <p className="flex items-start gap-2">
                            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                            <span>{section.callout.entityDetails.address}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone className="size-4 shrink-0 text-primary" />
                            <a
                              href={`tel:${CONTACT_INFO.phoneRaw}`}
                              className="font-medium hover:underline text-foreground"
                            >
                              {section.callout.entityDetails.phone}
                            </a>
                          </p>
                          <p className="flex items-center gap-2">
                            <Mail className="size-4 shrink-0 text-primary" />
                            <a
                              href={`mailto:${CONTACT_INFO.email}`}
                              className="font-medium hover:underline text-foreground"
                            >
                              {section.callout.entityDetails.email}
                            </a>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Standard Bullets */}
                    {section.bullets && (
                      <ul className="mt-4 space-y-2.5 pl-2">
                        {section.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2.5 text-sm sm:text-base leading-relaxed text-foreground/90 font-sans">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Subsections (e.g. Information you give us, Information collected automatically) */}
                    {section.subsections && (
                      <div className="mt-6 space-y-6">
                        {section.subsections.map((sub, sIdx) => (
                          <div key={sIdx} className="space-y-2.5">
                            {sub.subtitle && (
                              <h3 className="font-display text-lg font-bold text-foreground pt-2">
                                {sub.subtitle}
                              </h3>
                            )}
                            {sub.paragraphs.map((sp, spIdx) => (
                              <p key={spIdx} className="text-sm sm:text-base leading-relaxed text-muted-foreground font-sans">
                                {sp}
                              </p>
                            ))}
                            {sub.bullets && (
                              <ul className="space-y-2 pl-2">
                                {sub.bullets.map((sb, sbIdx) => (
                                  <li key={sbIdx} className="flex items-start gap-2.5 text-sm sm:text-base leading-relaxed text-foreground/90 font-sans">
                                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                                    <span>{sb}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>

              {/* ── 4. RELATED POLICIES FOOTER INSIDE CARD ── */}
              <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Related Policies
                </span>
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold">
                  {slug !== 'privacy' && (
                    <Link
                      to={ROUTES.privacy}
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <span>Privacy Policy</span>
                      <span>›</span>
                    </Link>
                  )}
                  {slug !== 'terms' && (
                    <Link
                      to={ROUTES.terms}
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <span>Terms &amp; Conditions</span>
                      <span>›</span>
                    </Link>
                  )}
                  {slug !== 'refund' && (
                    <Link
                      to={ROUTES.refund}
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <span>Refund Policy</span>
                      <span>›</span>
                    </Link>
                  )}
                  <Link
                    to={ROUTES.contact}
                    className="text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1 ml-2"
                  >
                    <span>Contact Us</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              </div>
            </article>
          </main>
        </div>
      </div>
    </div>
  )
}
