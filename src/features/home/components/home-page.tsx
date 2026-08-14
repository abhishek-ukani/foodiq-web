import { HeroSection } from '@/features/home/components/sections/hero-section'
import { BrandStorySection } from '@/features/home/components/sections/brand-story-section'
import { WhyChooseUsSection } from '@/features/home/components/sections/why-choose-us-section'
import { TodaysSpecialSection } from '@/features/home/components/sections/todays-special-section'
import { PopularMealsSection } from '@/features/home/components/sections/popular-meals-section'
import { TestimonialsSection } from '@/features/home/components/sections/testimonials-section'
import { DeliveryAreasSection } from '@/features/home/components/sections/delivery-areas-section'
import { HowItWorksSection } from '@/features/home/components/sections/how-it-works-section'
import { FaqTeaserSection } from '@/features/home/components/sections/faq-teaser-section'
import { CtaSection } from '@/features/home/components/sections/cta-section'

export function HomePage() {
  return (
    <>
      <HeroSection />
      <BrandStorySection />
      <WhyChooseUsSection />
      <TodaysSpecialSection />
      {/* <PopularMealsSection /> */}
      <HowItWorksSection />
      <TestimonialsSection />
      <DeliveryAreasSection />
      <FaqTeaserSection />
      <CtaSection />
    </>
  )
}
