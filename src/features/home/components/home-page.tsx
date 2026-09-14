import { HeroSection } from '@/features/home/components/sections/hero-section'
import { CategoryStrip } from '@/features/home/components/sections/category-strip'
import { TodaysSpecialSection } from '@/features/home/components/sections/todays-special-section'
import { BrandStorySection } from '@/features/home/components/sections/brand-story-section'
import { CtaSection } from '@/features/home/components/sections/cta-section'

export function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section: "Fresh Meals, Made with Love", brass thali, stats */}
      <HeroSection />

      {/* 2. 6 Category Tiles: Lunch, Dinner, Nasta, Farsan, Bulk, Party */}
      <CategoryStrip />

      {/* 3. Today's Special Dish Showcase (Sabji, Rotlo, Salad, Kadhi) + Menu CTA */}
      <TodaysSpecialSection />

      {/* 4. Home Kitchen Story Banner: "From Our Home to Yours" + Desi Taste Seal */}
      <BrandStorySection />

      {/* 5. Green CTA Banner: "Good Food Brings People Together" + Order Now */}
      <CtaSection />
    </div>
  )
}
