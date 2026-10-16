import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { MealTimingState } from '@/features/menu/hooks/use-meal-timing'

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name'

type MenuHeroProps = {
  searchQuery: string
  onSearchChange: (q: string) => void
  sort: SortOption
  onSortChange: (s: SortOption) => void
  timing?: MealTimingState
}

export function MenuHero({ searchQuery, onSearchChange, sort, onSortChange }: MenuHeroProps) {
  return (
    <div className="bg-[#FAF8F2] px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6 pb-2">
      <div
        className="relative mx-auto overflow-hidden rounded-[24px] border border-[#E9E2CF]/60 shadow-sm"
        style={{
          maxWidth: '1360px',
          minHeight: '290px',
          background: 'linear-gradient(110deg, #FAF4E8 0%, #F5EBD7 45%, #EFE1C8 100%)',
        }}
      >
        {/* ── LEFT BACKGROUND: Subtle Traditional Indian Mandala / Paisley Watermark ── */}
        <div
          className="absolute -left-12 -top-16 pointer-events-none opacity-[0.08] select-none"
          style={{ width: '420px', height: '420px' }}
        >
          <svg viewBox="0 0 200 200" fill="currentColor" className="w-full h-full text-[#7B5B28]">
            <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <g key={deg} transform={`rotate(${deg} 100 100)`}>
                <path d="M100 20 C95 40 95 55 100 65 C105 55 105 40 100 20" fill="currentColor" />
                <circle cx="100" cy="12" r="3" fill="currentColor" />
                <path d="M100 65 C92 75 92 85 100 90 C108 85 108 75 100 65" fill="currentColor" opacity="0.6" />
              </g>
            ))}
            <circle cx="100" cy="100" r="18" fill="currentColor" opacity="0.4" />
          </svg>
        </div>

        {/* ── LEFT CONTENT AREA ── */}
        <div className="relative z-20 flex flex-col justify-center h-full min-h-[290px] px-6 sm:px-10 lg:px-12 py-7 sm:py-8 max-w-full lg:max-w-[52%]">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-xs font-bold italic tracking-wide text-[#087443]">Fresh</span>
            <span className="text-xs font-semibold text-[#8C8375]">•</span>
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#7A817B]">Homely</span>
            <span className="text-xs font-semibold text-[#8C8375]">•</span>
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#7A817B]">Gujarati</span>
          </div>

          {/* Heading */}
          <h1
            className="leading-[1.15] tracking-tight mb-2"
            style={{
              fontSize: 'clamp(1.75rem, 2.8vw, 2.65rem)',
              color: '#17231D',
              fontWeight: 800,
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            Explore Our <span className="text-[#087443] font-bold">Delicious</span>
            <br />
            Menu
          </h1>

          {/* Subtext */}
          <p className="text-xs sm:text-sm leading-relaxed mb-6 text-[#7A817B] max-w-[340px]">
            Homestyle Gujarati dishes, freshly cooked daily and delivered to your doorstep.
          </p>

          {/* Search + Sort */}
          <div className="flex items-center gap-3 w-full max-w-[460px]">
            <div className="relative flex-1">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none size-4 text-[#8C8375]"
              />
              <Input
                id="menu-hero-search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search dishes, thalis, sabjis, sweets..."
                className="pl-9 h-10 rounded-full text-xs sm:text-sm bg-white/95 hover:bg-white border-[#E5DEC9] focus-visible:ring-1 focus-visible:ring-[#087443] placeholder:text-[#9E9687] text-[#17231D] shadow-xs"
              />
            </div>
            <Select value={sort} onValueChange={(v) => onSortChange(v as SortOption)}>
              <SelectTrigger
                className="h-10 rounded-full text-xs sm:text-sm min-w-[130px] bg-white/95 hover:bg-white border-[#E5DEC9] text-[#524B40] shadow-xs shrink-0"
              >
                <div className="flex items-center gap-1.5 font-medium">
                  <svg width="13" height="11" viewBox="0 0 13 11" fill="none" className="text-[#6B5847]">
                    <path d="M0 1h13M2 5.5h9M4 10h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <SelectValue placeholder="Sort" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white border-[#E9E5DA] rounded-xl shadow-lg">
                <SelectItem value="default">Sort: Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low → High</SelectItem>
                <SelectItem value="price-desc">Price: High → Low</SelectItem>
                <SelectItem value="name">Name: A → Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── FOOD IMAGE AREA (Seamless blend into warm background) ── */}
        <div className="absolute right-0 top-0 bottom-0 hidden lg:block w-[56%] pointer-events-none select-none">
          {/* Subtle soft edge mask on the image */}
          <div
            className="w-full h-full relative"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 14%, rgba(0,0,0,0.9) 26%, black 36%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 14%, rgba(0,0,0,0.9) 26%, black 36%)',
            }}
          >
            <img
              src="/gujarati-thali-hero.jpg"
              alt="Traditional Gujarati Thali"
              loading="eager"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Soft matching color gradient overlay to completely melt left edge */}
          <div
            className="absolute inset-y-0 left-0 w-36 pointer-events-none"
            style={{
              background: 'linear-gradient(to right, #F5EBD7 0%, rgba(245, 235, 215, 0.6) 50%, transparent 100%)',
            }}
          />

          {/* Cursive Gujarati touch */}
          <div
            className="absolute bottom-5 right-7 pointer-events-none text-right"
            style={{
              fontFamily: "'Caveat', cursive, serif",
              color: '#165C30',
              fontSize: '1.25rem',
              fontWeight: 700,
              transform: 'rotate(-4deg)',
              lineHeight: 1.15,
              textShadow: '0 1px 2px rgba(255,255,255,0.8)',
            }}
          >
            Ghar jevo<br />swaad ♥
          </div>
        </div>
      </div>
    </div>
  )
}
