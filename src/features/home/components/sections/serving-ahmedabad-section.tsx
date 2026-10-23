import { MapPin, Bike } from 'lucide-react'
import { Reveal } from '@/components/common/reveal'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

export function ServingAhmedabadSection() {
  return (
    <section className="relative overflow-hidden bg-[#380B1C] py-14 sm:py-20 lg:py-24 text-white">
      {/* Ambient Lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-0 size-96 rounded-full bg-[#5E1430]/35 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-0 size-96 rounded-full bg-black/40 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto items-stretch">

          {/* ── CARD 1: Serving Ahmedabad ── */}
          <Reveal>
            <div className="h-full rounded-[2.5rem] bg-[#290513] border border-[#52132A] p-8 sm:p-10 flex flex-col justify-between space-y-6 shadow-xl shadow-black/20">
              <div className="space-y-4">
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#FAF0DC]">
                  Serving Ahmedabad
                </h3>

                <div className="space-y-1 text-sm sm:text-base text-[#FAF0DC]/80 font-sans leading-relaxed pt-2">
                  <p>Shop No 5, Ground Floor,</p>
                  <p>Skywalk Luxuria,</p>
                  <p>Vandematram Rd,</p>
                  <p>Gota, Ahmedabad – 382481.</p>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#3D0A1E] border border-[#631836] px-4 py-2 text-xs font-semibold text-[#E5AC55]">
                  <Bike className="size-4 text-[#E5AC55]" />
                  <span>Delivery only • Ahmedabad</span>
                </span>

                <a
                  href="https://maps.google.com/?q=Skywalk+Luxuria+Gota+Ahmedabad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#FAF0DC]/70 hover:text-white transition-colors py-2 px-3 hover:underline underline-offset-4"
                >
                  <MapPin className="size-3.5" />
                  <span>View on Map</span>
                </a>
              </div>
            </div>
          </Reveal>

          {/* ── CARD 2: Stay connected with FoodIQ ── */}
          <Reveal delay={0.08}>
            <div className="h-full rounded-[2.5rem] bg-[#290513] border border-[#52132A] p-8 sm:p-10 flex flex-col justify-between space-y-6 shadow-xl shadow-black/20">
              <div className="space-y-3">
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#FAF0DC]">
                  Stay connected with FoodIQ
                </h3>

                <p className="text-sm sm:text-base text-[#FAF0DC]/80 font-sans leading-relaxed pt-1">
                  Follow us for today&apos;s thali, behind-the-scenes moments and a little more taste of home.
                </p>
              </div>

              {/* Social Action Buttons with 44px+ touch targets */}
              <div className="space-y-3 pt-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[48px] rounded-full border border-[#FAF0DC]/30 hover:border-[#FAF0DC] hover:bg-white/5 text-[#FAF0DC] text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  <InstagramIcon className="size-4.5" />
                  <span>FOLLOW ON INSTAGRAM</span>
                </a>

                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[48px] rounded-full border border-[#FAF0DC]/30 hover:border-[#FAF0DC] hover:bg-white/5 text-[#FAF0DC] text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  <FacebookIcon className="size-4.5" />
                  <span>FOLLOW US ON FACEBOOK</span>
                </a>
              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  )
}
