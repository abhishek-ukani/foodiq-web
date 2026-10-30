import { Link } from 'react-router-dom'
import { AtSign, ChefHat, Mail, MapPin, Phone, Heart } from 'lucide-react'
import { ROUTES, CONTACT_INFO } from '@/constants'
import { cn } from '@/lib/utils'

const QUICK_LINKS = [
  { to: ROUTES.menu, label: "Today's Menu" },
  { to: ROUTES.about, label: 'Our Story & Farm' },
  { to: ROUTES.contact, label: 'Contact Us' },
  { to: ROUTES.faq, label: 'FAQs' },
]

const LEGAL_LINKS = [
  { to: ROUTES.privacy, label: 'Privacy Policy' },
  { to: ROUTES.terms, label: 'Terms & Conditions' },
  { to: ROUTES.refund, label: 'Refund Policy' },
]

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps = {}) {
  return (
    <footer className={cn("relative bg-[#19110b] text-[#FAF4E6] mt-16 sm:mt-24 border-t border-[#2e1d13] overflow-hidden", className)}>
      {/* Subtle Warm Amber Ambient Glow in Corner */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-0 size-80 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/4 size-72 rounded-full bg-amber-500/5 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-12 py-14 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand & Story Column */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-5">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 border border-primary/30 flex size-10 items-center justify-center rounded-xl text-primary">
                <ChefHat className="size-5" aria-hidden />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-white">FoodIQ</span>
            </div>

            <p className="text-[#FAF4E6]/70 max-w-sm text-sm leading-relaxed font-sans">
              Pure homemade Kathiyawadi tiffin, prepared daily with Gulab double filtered groundnut oil, Amul ghee, and delivered fresh across Ahmedabad.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="bg-white/10 hover:bg-white/20 text-[#FAF4E6] flex size-10 items-center justify-center rounded-full transition-colors border border-white/10"
                aria-label="Instagram"
              >
                <AtSign className="size-4.5" aria-hidden />
              </a>
              <span className="text-xs text-[#FAF4E6]/60 font-medium">Follow our daily rasoi updates</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-3 lg:col-span-2">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-200/90">
              Quick Links
            </p>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
                    className="text-[#FAF4E6]/75 hover:text-white text-sm transition-colors hover:underline underline-offset-4"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-3 lg:col-span-2">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-200/90">
              Legal &amp; Policy
            </p>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
                    className="text-[#FAF4E6]/75 hover:text-white text-sm transition-colors hover:underline underline-offset-4"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

            {/* Contact Column */}
            <div className="space-y-3 lg:col-span-3">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-200/90">
                Get in Touch
              </p>
              <ul className="space-y-2.5 text-sm">
                <li className="text-[#FAF4E6]/75 flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-amber-300" aria-hidden />
                  <div>
                    <span className="block">Bodakdev, Ahmedabad, Gujarat</span>
                    <span className="text-[11px] text-[#FAF4E6]/55 block">Single Kitchen • No Branches</span>
                  </div>
                </li>
                <li className="text-[#FAF4E6]/75 flex items-center gap-2.5">
                  <Phone className="size-4 shrink-0 text-amber-300" aria-hidden />
                  <a
                    href={`tel:${CONTACT_INFO.phoneRaw}`}
                    className="hover:text-white transition-colors"
                  >
                    {CONTACT_INFO.phone}
                  </a>
                </li>
                <li className="text-[#FAF4E6]/75 flex items-center gap-2.5">
                  <Mail className="size-4 shrink-0 text-amber-300" aria-hidden />
                  <a
                    href={`mailto:${CONTACT_INFO.email}`}
                    className="hover:text-white transition-colors"
                  >
                    {CONTACT_INFO.email}
                  </a>
                </li>
              </ul>
            </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 text-xs text-[#FAF4E6]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} FoodIQ. All rights reserved.</p>
          <p className="flex items-center gap-1.5 justify-center">
            <span>Made with</span>
            <Heart className="size-3 text-red-400 fill-red-400" />
            <span>for authentic home food lovers</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
