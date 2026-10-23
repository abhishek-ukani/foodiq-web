import { HeroSection } from '@/features/home/components/sections/hero-section'
import { CategoryStrip } from '@/features/home/components/sections/category-strip'
import { TodaysSpecialSection } from '@/features/home/components/sections/todays-special-section'
import { FarmStorySection } from '@/features/home/components/sections/farm-story-section'
import { OccasionsSection } from '@/features/home/components/sections/occasions-section'
import { AnnadaanSection } from '@/features/home/components/sections/annadaan-section'
import { DeliveryTimingsSection } from '@/features/home/components/sections/delivery-timings-section'
import { ServingAhmedabadSection } from '@/features/home/components/sections/serving-ahmedabad-section'
import { CtaSection } from '@/features/home/components/sections/cta-section'
import { SectionDivider } from '@/components/common/section-divider'

export function HomePage() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-clip bg-background">
      {/* 1. Hero Section: "Fresh Meals, Made with Love", warm cream atmosphere */}
      <HeroSection />

      {/* Scallop transition from Hero into elevated Ivory Category Strip */}
      <SectionDivider
        variant="scallop"
        fromColor="text-background"
        toColor="bg-[#FFFDF9]"
      />

      {/* 2. 6 Category Tiles: Tabletop surface with 3D hover lift */}
      <CategoryStrip />

      {/* Wave transition into Warm Sandstone Today's Special */}
      <SectionDivider
        variant="wave"
        fromColor="text-[#FFFDF9]"
        toColor="bg-[#F5EEDD]"
      />

      {/* 3. Today's Special Dish Showcase (Sabji, Rotlo, Salad, Kadhi) */}
      <TodaysSpecialSection />

      {/* Scalloped Arch transition diving into Deep Earthen Clay */}
      <SectionDivider
        variant="scallop"
        fromColor="text-[#F5EEDD]"
        toColor="bg-[#221610]"
      />

      {/* 4. Signature Deep Contrast: Farm Roots & Ingredient Inspector (#221610) */}
      <FarmStorySection />

      {/* Organic Curve transition emerging from Deep Clay into Festive Parchment */}
      <SectionDivider
        variant="curve"
        fromColor="text-[#221610]"
        toColor="bg-[#FAF4E6]"
      />

      {/* 5. Occasions & Bulk Catering: Interactive Guest Estimator */}
      <OccasionsSection />

      {/* Organic Wave transition into Annadaan */}
      <SectionDivider
        variant="wave"
        fromColor="text-[#FAF4E6]"
        toColor="bg-[#3a0a1a]"
      />

      {/* 6. Annadaan Community Meal Giving (અન્નદાન સેવા • ₹110/Thali • +1 We Give Too) */}
      <AnnadaanSection />

      {/* Scallop transition into Soft Sandstone Delivery Timings */}
      <SectionDivider
        variant="scallop"
        fromColor="text-[#3a0a1a]"
        toColor="bg-[#F3ECE0]"
      />

      {/* 7. Daily Delivery Timings & Kitchen Cutoffs */}
      <DeliveryTimingsSection />

      {/* Wave transition into Deep Wine Serving Ahmedabad */}
      <SectionDivider
        variant="wave"
        fromColor="text-[#F3ECE0]"
        toColor="bg-[#380B1C]"
      />

      {/* 8. Serving Ahmedabad & Stay Connected with FoodIQ */}
      <ServingAhmedabadSection />

      {/* Scallop transition back to warm cream backdrop for Grand CTA */}
      <SectionDivider
        variant="scallop"
        fromColor="text-[#380B1C]"
        toColor="bg-background"
      />

      {/* 9. Terracotta Grand Banquet CTA Banner */}
      <CtaSection />
    </div>
  )
}
