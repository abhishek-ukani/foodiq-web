import { useMemo } from 'react'
import {
  MessageCircle,
  Camera,
  UtensilsCrossed,
  HeartHandshake,
  Sparkles,
} from 'lucide-react'
import { Reveal } from '@/components/common/reveal'

const PRICE_PER_MEAL = 110
const WHATSAPP_PHONE = '919999999999'

const THALI_ITEMS = [
  '5 Roti',
  '2 Sabji',
  'Dal',
  'Rice',
  'Sweet',
  'Snack / Farsan (Free Add-on)',
  'Salad',
  'Pickle',
  'Papad',
  'Chhas',
]

export function AnnadaanSection() {
  const thaliCount = 10

  // Every 10 thalis, FoodIQ contributes 1 more
  const foodiqAdds = useMemo(() => Math.floor(thaliCount / 10), [thaliCount])
  const totalMealsServed = useMemo(() => thaliCount + foodiqAdds, [thaliCount, foodiqAdds])
  const totalAmount = useMemo(() => thaliCount * PRICE_PER_MEAL, [thaliCount])

  const handleWhatsAppClick = () => {
    const msg =
      `Hi FoodIQ! I would like to plan a meal donation (Annadaan):\n\n` +
      `• Sponsoring: ${thaliCount} Thalis (₹${totalAmount.toLocaleString('en-IN')})\n` +
      `• FoodIQ Match: +${foodiqAdds} extra Thali${foodiqAdds > 1 ? 's' : ''}\n` +
      `• Total Meals Served: ${totalMealsServed} People\n\n` +
      `Please guide me with the available dates, occasion and delivery details in Ahmedabad.`;

    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <section
      id="donate"
      className="relative overflow-hidden bg-[#3a0a1a] text-[#fff6e0] py-14 sm:py-20 lg:py-24 px-4 sm:px-6"
      style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}
    >
      {/* Anchor for backward compatibility with #annadaan */}
      <span id="annadaan" className="absolute -top-24 left-0 pointer-events-none" aria-hidden="true" />

      {/* Main Grid Container */}
      <div className="max-w-[1120px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">

        {/* ── LEFT COLUMN: Headline & High-Trust Impact Cards ── */}
        <div className="lg:col-span-6 flex flex-col justify-between h-full">
          <div>
            <Reveal>
              <h2
                className="text-[clamp(32px,5vw,54px)] font-normal leading-[1.06] tracking-[-0.01em] text-[#fff6e0]"
                style={{ fontFamily: "'Young Serif', Georgia, serif" }}
              >
                Feed someone on your special day
              </h2>
            </Reveal>

            <Reveal delay={0.06}>
              <p className="mt-3.5 text-[16px] sm:text-[17px] text-[#e9cfc0] max-w-[38ch] leading-relaxed">
                You choose how many. We cook fresh and deliver.
              </p>
            </Reveal>

            {/* Give-back match highlight pill */}
            <Reveal delay={0.12}>
              <div className="mt-6 inline-flex items-center gap-3 bg-[#f2a900] text-[#2a0713] py-2 pr-5 pl-2 rounded-full font-semibold text-sm sm:text-[15px] shadow-sm select-none">
                <b
                  className="w-[38px] h-[38px] rounded-full bg-[#3a0a1a] text-[#f2a900] grid place-items-center text-[17px] font-normal shrink-0"
                  style={{ fontFamily: "'Young Serif', Georgia, serif" }}
                >
                  +1
                </b>
                <span>Donate 10 thalis, we add 1 more</span>
              </div>
            </Reveal>
          </div>

          {/* High-Trust Annadaan Transparency Cards (Compact & Sleek) */}
          <div className="mt-6 space-y-2 max-w-md">
            <Reveal delay={0.16}>
              <div className="rounded-xl bg-[#521329]/50 border border-[#6d2a40]/60 py-2 px-3 sm:py-2.5 sm:px-3.5 flex items-center gap-2.5 transition-all hover:bg-[#521329]/75 hover:border-[#f2a900]/40">
                <div className="size-7 rounded-lg bg-[#f2a900]/15 border border-[#f2a900]/30 text-[#f2a900] flex items-center justify-center shrink-0">
                  <Camera className="size-3.5" />
                </div>
                <h4 className="text-xs sm:text-sm font-medium text-[#fff6e0]">
                  Photo &amp; Video Proof
                </h4>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="rounded-xl bg-[#521329]/50 border border-[#6d2a40]/60 py-2 px-3 sm:py-2.5 sm:px-3.5 flex items-center gap-2.5 transition-all hover:bg-[#521329]/75 hover:border-[#f2a900]/40">
                <div className="size-7 rounded-lg bg-[#f2a900]/15 border border-[#f2a900]/30 text-[#f2a900] flex items-center justify-center shrink-0">
                  <UtensilsCrossed className="size-3.5" />
                </div>
                <h4 className="text-xs sm:text-sm font-medium text-[#fff6e0]">
                  Cooked Fresh
                </h4>
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="rounded-xl bg-[#521329]/50 border border-[#6d2a40]/60 py-2 px-3 sm:py-2.5 sm:px-3.5 flex items-center gap-2.5 transition-all hover:bg-[#521329]/75 hover:border-[#f2a900]/40">
                <div className="size-7 rounded-lg bg-[#f2a900]/15 border border-[#f2a900]/30 text-[#f2a900] flex items-center justify-center shrink-0">
                  <HeartHandshake className="size-3.5" />
                </div>
                <h4 className="text-xs sm:text-sm font-medium text-[#fff6e0]">
                  Respectful Direct Delivery
                </h4>
              </div>
            </Reveal>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Physical Meal Ticket Card ── */}
        <div className="lg:col-span-6 flex flex-col justify-between h-full">
          <Reveal delay={0.15} className="w-full h-full flex flex-col">
            <div className="relative w-full h-full bg-[#fff6e0] text-[#2a0713] rounded-[26px] p-6 sm:p-7 shadow-[0_24px_50px_rgba(0,0,0,0.35)] flex flex-col justify-between transition-all">
              {/* Ticket Top Section */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3
                      className="text-[26px] font-normal leading-tight text-[#2a0713]"
                      style={{ fontFamily: "'Young Serif', Georgia, serif" }}
                    >
                      Plan your donation
                    </h3>
                    <span className="inline-block mt-1.5 font-semibold text-sm text-[#9a5b00]">
                      Choose Your Meal
                    </span>
                  </div>

                  {/* Annadaan Seva Badge */}
                  <div className="inline-flex items-center gap-1.5 bg-[#f6e7bf] border border-[#ecd9b0] text-[#2a0713] px-3 py-1 rounded-full text-xs font-semibold shrink-0 shadow-2xs">
                    <Sparkles className="size-3 text-[#9a5b00]" />
                    <span>Annadaan Seva</span>
                  </div>
                </div>

                {/* Inclusions Chips */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-4">
                  {THALI_ITEMS.map((item) => (
                    <span
                      key={item}
                      className="text-[13px] sm:text-[13.5px] font-medium py-1.5 px-3 rounded-full bg-white border border-[#ecd9b0] text-[#2a0713] shadow-2xs"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ticket Bottom Section */}
              <div className="mt-6">
                {/* ── SIGNATURE TICKET TEAR LINE WITH PHYSICAL EDGE CUTOUT NOTCHES ── */}
                <div className="relative my-4 -mx-6 sm:-mx-7 border-t-2 border-dashed border-[#d9bf8a]">
                  {/* Left Notch Cutout */}
                  <span
                    aria-hidden="true"
                    className="absolute -top-3 -left-3 size-6 rounded-full bg-[#3a0a1a]"
                  />
                  {/* Right Notch Cutout */}
                  <span
                    aria-hidden="true"
                    className="absolute -top-3 -right-3 size-6 rounded-full bg-[#3a0a1a]"
                  />
                </div>

                {/* Bonus Pill & Total Price */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[13px] sm:text-[13.5px] font-semibold bg-[#3a0a1a] text-[#f2a900] py-1.5 px-3 rounded-full">
                    +1 thali on every 10
                  </span>
                  <span
                    className="text-[26px] sm:text-[28px] font-normal text-[#2a0713]"
                    style={{ fontFamily: "'Young Serif', Georgia, serif" }}
                  >
                    From ₹1,000
                  </span>
                </div>

                {/* Action CTA Button */}
                <button
                  id="cta"
                  type="button"
                  onClick={handleWhatsAppClick}
                  className="mt-3.5 w-full rounded-[16px] bg-[#3a0a1a] hover:bg-[#6b1a36] text-[#fff6e0] font-semibold text-base py-3.5 sm:py-4 px-5 flex items-center justify-center gap-2.5 cursor-pointer shadow-md transition-all active:scale-[0.99] focus-visible:outline-3 focus-visible:outline-[#3a0a1a] focus-visible:outline-offset-2"
                >
                  <MessageCircle className="size-5 text-[#f2a900]" />
                  <span>Plan my donation on WhatsApp</span>
                </button>

                {/* Trust Steps Badges */}
                <div className="flex flex-wrap gap-1.5 mt-3 text-[11.5px] sm:text-[12px] text-[#8a6a5c]">
                  <span className="bg-[#f6e7bf] rounded-full py-1 px-2.5 font-medium">Min 10 thalis</span>
                  <span className="bg-[#f6e7bf] rounded-full py-1 px-2.5 font-medium">Book 24 hrs ahead</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

      </div>
    </section>
  )
}
