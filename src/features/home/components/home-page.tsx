import { HeroSection } from '@/features/home/components/sections/hero-section'
import { CategoryStrip } from '@/features/home/components/sections/category-strip'
import { TodaysSpecialSection } from '@/features/home/components/sections/todays-special-section'
import { FarmStorySection } from '@/features/home/components/sections/farm-story-section'
import { OccasionsSection } from '@/features/home/components/sections/occasions-section'
import { AnnadaanSection } from '@/features/home/components/sections/annadaan-section'
import { DeliveryTimingsSection } from '@/features/home/components/sections/delivery-timings-section'
import { ServingAhmedabadSection } from '@/features/home/components/sections/serving-ahmedabad-section'
import { CtaSection } from '@/features/home/components/sections/cta-section'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SectionDivider } from '@/components/common/section-divider'
import { useTodaysSpecial } from '@/features/home/hooks/use-home-queries'
import type { SpecialMenuItem } from '@/features/home/services/home-service'
import type { Tables } from '@/types/database.types'

export function HomePage() {
  const { data: dbSpecials } = useTodaysSpecial()
  const [searchParams] = useSearchParams()
  const previewCount = searchParams.get('preview_specials')

  const previewMockSpecials: SpecialMenuItem[] | null = useMemo(() => {
    if (!previewCount) return null
    const count = parseInt(previewCount, 10)
    if (isNaN(count) || count <= 0) return null

    const mockPool: SpecialMenuItem[] = [
      {
        id: 'spec-1',
        daily_menu_id: 'dm-1',
        food_item_id: 'fi-1',
        is_special: true,
        is_available: true,
        price_override: null,
        available_quantity: null,
        sold_quantity: 0,
        display_order: 1,
        created_at: '',
        updated_at: '',
        cutoff_time: null,
        cutoff_note: null,
        is_standalone_sale: true,
        is_thali_option: true,
        food_items: {
          id: 'fi-1',
          name: 'Ringna No Olo',
          name_gujarati: 'રીંગણાનો ઓળો',
          description: 'Smoky fire-roasted baingan tempered with fresh spring garlic & green chillies.',
          image_url: '/gujarati-thali-hero.jpg',
          price: 120,
          is_available: true,
          food_type: 'veg',
          category_id: null,
          created_at: '',
          updated_at: '',
          display_order: 1,
          kind: 'single',
          spice_level: 2,
          total_sold: 45,
          unit_type: 'portion',
          image_alt: null,
          sku: null,
        } as unknown as Tables<'food_items'>,
      },
      {
        id: 'spec-2',
        daily_menu_id: 'dm-1',
        food_item_id: 'fi-2',
        is_special: true,
        is_available: true,
        price_override: null,
        available_quantity: null,
        sold_quantity: 0,
        display_order: 2,
        created_at: '',
        updated_at: '',
        cutoff_time: null,
        cutoff_note: null,
        is_standalone_sale: true,
        is_thali_option: true,
        food_items: {
          id: 'fi-2',
          name: 'Kathiyawadi Sev Tameta',
          name_gujarati: 'કાઠિયાવાડી સેવ ટમેટા',
          description: 'Tangy-sweet vine tomato gravy infused with roasted cumin and Bhavnagri sev.',
          image_url: '/images/dishes/classic-thali.jpg',
          price: 110,
          is_available: true,
          food_type: 'veg',
          category_id: null,
          created_at: '',
          updated_at: '',
          display_order: 2,
          kind: 'single',
          spice_level: 2,
          total_sold: 80,
          unit_type: 'portion',
          image_alt: null,
          sku: null,
        } as unknown as Tables<'food_items'>,
      },
      {
        id: 'spec-3',
        daily_menu_id: 'dm-1',
        food_item_id: 'fi-3',
        is_special: true,
        is_available: true,
        price_override: null,
        available_quantity: null,
        sold_quantity: 0,
        display_order: 3,
        created_at: '',
        updated_at: '',
        cutoff_time: null,
        cutoff_note: null,
        is_standalone_sale: true,
        is_thali_option: true,
        food_items: {
          id: 'fi-3',
          name: 'Clay-Tava Bajra Rotlo',
          name_gujarati: 'માટીના તવાનો બાજરો',
          description: 'Hand-patted black millet flatbread roasted over slow embers, served with white butter.',
          image_url: '/images/dishes/gujarati-kathiyawadi-thali.jpg',
          price: 40,
          is_available: true,
          food_type: 'veg',
          category_id: null,
          created_at: '',
          updated_at: '',
          display_order: 3,
          kind: 'single',
          spice_level: 1,
          total_sold: 120,
          unit_type: 'portion',
          image_alt: null,
          sku: null,
        } as unknown as Tables<'food_items'>,
      },
    ]

    return mockPool.slice(0, count)
  }, [previewCount])

  const specials = previewMockSpecials ?? dbSpecials
  const hasSpecials = Boolean(
    specials &&
      specials.some((item) => item.food_items && item.food_items.is_available !== false),
  )

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

      {/* 3. Today's Special Dish Showcase (rendered only if specials exist) */}
      {hasSpecials ? (
        <>
          {/* Style 2: Kathiyawadi Bandhani Diamond Seam (into Warm Sandstone Today's Special) */}
          <SectionDivider
            variant="bandhani"
            fromColor="text-[#FFFDF9]"
            toColor="bg-[#F5EEDD]"
          />

          <TodaysSpecialSection initialSpecials={specials} />

          {/* Style 3: Mandala Sunburst Arc (into Deep Earthen Clay Farm Roots) */}
          <SectionDivider
            variant="mandala"
            fromColor="text-[#F5EEDD]"
            toColor="bg-[#221610]"
          />
        </>
      ) : (
        /* Seamless direct transition from Ivory (#FFFDF9) to Deep Clay (#221610) when no specials */
        <SectionDivider
          variant="mandala"
          fromColor="text-[#FFFDF9]"
          toColor="bg-[#221610]"
        />
      )}

      {/* 4. Signature Deep Contrast: Farm Roots & Ingredient Inspector (#221610) */}
      <FarmStorySection />

      {/* Style 4: Modern Terracotta Slant (emerging from Deep Clay into Festive Parchment Occasions) */}
      <SectionDivider
        variant="slant"
        fromColor="text-[#221610]"
        toColor="bg-[#FAF4E6]"
      />

      {/* 5. Occasions & Bulk Catering: Interactive Guest Estimator */}
      <OccasionsSection />

      {/* Style 5: Sacred Diya Flame Crest (into Annadaan Community Meal Giving) */}
      <SectionDivider
        variant="diya"
        fromColor="text-[#FAF4E6]"
        toColor="bg-[#3a0a1a]"
      />

      {/* 6. Annadaan Community Meal Giving (અન્નદાન સેવા • ₹110/Thali • +1 We Give Too) */}
      <AnnadaanSection />

      {/* Style 6: Organic Shallow Wave with Terracotta Hairline (into Soft Sandstone Delivery Timings) */}
      <SectionDivider
        variant="wave"
        fromColor="text-[#3a0a1a]"
        toColor="bg-[#F3ECE0]"
      />

      {/* 7. Daily Delivery Timings & Kitchen Cutoffs */}
      <DeliveryTimingsSection />

      {/* Style 7: Ahmedabad Heritage Pol & Kite Skyline (into Serving Ahmedabad) */}
      <SectionDivider
        variant="skyline"
        fromColor="text-[#F3ECE0]"
        toColor="bg-[#380B1C]"
      />

      {/* 8. Serving Ahmedabad & Stay Connected with FoodIQ */}
      <ServingAhmedabadSection />

      {/* Style 8: Royal Double Terracotta Hairline with Brass Diamond Seal (into Grand CTA) */}
      <SectionDivider
        variant="double-line"
        fromColor="text-[#380B1C]"
        toColor="bg-background"
      />

      {/* 9. Terracotta Grand Banquet CTA Banner */}
      <CtaSection />
    </div>
  )
}
