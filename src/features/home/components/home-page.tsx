import { HeroSection } from '@/features/home/components/sections/hero-section'
import { CategoryStrip } from '@/features/home/components/sections/category-strip'
import { TodaysSpecialSection } from '@/features/home/components/sections/todays-special-section'
import { FarmStorySection } from '@/features/home/components/sections/farm-story-section'
import { OccasionsSection } from '@/features/home/components/sections/occasions-section'
import { AnnadaanSection } from '@/features/home/components/sections/annadaan-section'
import { DeliveryTimingsSection } from '@/features/home/components/sections/delivery-timings-section'
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

      {/* 4. Farm Roots & Unified 5-Ingredient Shelf (Zero Repetition) */}
      <FarmStorySection />

      {/* 5. Occasions & Bulk Catering (Pooja, Family, Office, Travel packs + Estimator) */}
      <OccasionsSection />

      {/* 6. Annadaan Community Meal Giving (અન્નદાન સેવા • ₹51/Thali) */}
      <AnnadaanSection />

      {/* 7. Daily Delivery Timings & Kitchen Cutoffs (Lunch 12–2 PM, Dinner 7:30–9:30 PM) */}
      <DeliveryTimingsSection />

      {/* 8. Green CTA Banner: "Good Food Brings People Together" + Order Now */}
      <CtaSection />
    </div>
  )
}
