import { Link } from 'react-router-dom'
import { AtSign, ChefHat, Mail, MapPin, Phone } from 'lucide-react'
import { ROUTES } from '@/constants'

const QUICK_LINKS = [
  { to: ROUTES.about, label: 'About Us' },
  { to: ROUTES.contact, label: 'Contact Us' },
  { to: ROUTES.faq, label: 'FAQs' },
]

const LEGAL_LINKS = [
  { to: ROUTES.privacy, label: 'Privacy Policy' },
  { to: ROUTES.terms, label: 'Terms & Conditions' },
  { to: ROUTES.refund, label: 'Refund Policy' },
]

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-24">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary-foreground/15 flex size-9 items-center justify-center rounded-lg">
                <ChefHat className="size-4.5" aria-hidden />
              </div>
              <span className="font-display text-lg font-semibold">FoodIQ</span>
            </div>
            <p className="text-primary-foreground/70 max-w-xs text-sm">
              Homemade tiffin, cooked fresh every day and delivered with care across Ahmedabad.
            </p>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="bg-primary-foreground/10 hover:bg-primary-foreground/20 flex size-9 items-center justify-center rounded-full transition-colors"
              aria-label="Instagram"
            >
              <AtSign className="size-4" aria-hidden />
            </a>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold">Quick Links</p>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold">Legal</p>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold">Get in Touch</p>
            <ul className="space-y-2 text-sm">
              <li className="text-primary-foreground/70 flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                Ahmedabad, Gujarat
              </li>
              <li className="text-primary-foreground/70 flex items-center gap-2">
                <Phone className="size-4 shrink-0" aria-hidden />
                <a href="tel:+919999999999" className="hover:text-primary-foreground">
                  +91 99999 99999
                </a>
              </li>
              <li className="text-primary-foreground/70 flex items-center gap-2">
                <Mail className="size-4 shrink-0" aria-hidden />
                <a href="mailto:hello@thakarrasoi.com" className="hover:text-primary-foreground">
                  hello@thakarrasoi.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-primary-foreground/15 text-primary-foreground/60 mt-10 border-t pt-6 text-center text-xs">
          © {new Date().getFullYear()} FoodIQ. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
