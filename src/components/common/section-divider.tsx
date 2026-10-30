import { cn } from '@/lib/utils'

export type DividerVariant =
  | 'wave'         // 1. Organic shallow wave with terracotta stroke
  | 'skyline'      // 2. Ahmedabad Heritage Pol & Kite Skyline line-art (from reference)
  | 'mandala'      // 3. Central radiant sunburst & lotus petal arc (from reference)
  | 'bandhani'     // 4. Kathiyawadi diamond bandhani dot line (from reference)
  | 'paisley'      // 5. Corner paisley flourish seam
  | 'slant'        // 6. Modern architectural diagonal slope
  | 'diya'         // 7. Sacred diya / flame petal crest (for Annadaan)
  | 'double-line'  // 8. Royal double terracotta hairline with brass diamond seal
  | 'line'         // Clean straight terracotta gradient hairline
  | 'straight'     // Clean straight terracotta gradient hairline
  | 'curve'        // Subtle shallow curve
  | 'arc'          // Subtle shallow curve
  | 'scallop'      // Legacy alias
  | 'crest'        // Legacy alias

interface SectionDividerProps {
  variant?: DividerVariant
  /** Background color of the section ABOVE this divider (e.g. 'text-[#F5EEDD]' or 'text-background') */
  fromColor?: string
  /** Background color of the section BELOW this divider (e.g. 'bg-[#221610]' or 'bg-[#FFFDF9]') */
  toColor?: string
  className?: string
  flipY?: boolean
  /** Optional label displayed for previewing / comparing styles */
  previewLabel?: string
}

/**
 * Rich, minimal, and unique Kathiyawadi & Ahmedabad handcrafted section transitions.
 * Supports distinct styles across section changes so every transition feels intentional,
 * authentic, and beautifully suited to the content.
 */
export function SectionDivider({
  variant = 'wave',
  fromColor = 'text-background',
  toColor = 'bg-transparent',
  className,
  flipY = false,
  previewLabel,
}: SectionDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative w-full overflow-hidden leading-none select-none pointer-events-none -mb-px -mt-px',
        toColor,
        className,
      )}
    >
      {/* ── Optional Subtle Label for Reviewing Styles ── */}
      {previewLabel && (
        <div className="absolute top-0.5 right-4 z-20 pointer-events-auto">
          <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-black/60 text-amber-300/80 backdrop-blur-sm border border-white/10">
            {previewLabel}
          </span>
        </div>
      )}

      {/* ── STYLE 1: Organic Shallow Wave with Terracotta Hairline ── */}
      {variant === 'wave' && (
        <svg
          viewBox="0 0 1440 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className={cn('w-full h-3 sm:h-4 block', fromColor, flipY && 'rotate-180')}
        >
          <path
            d="M0,0 C380,12 700,4 1060,13 1440,6 L1440,0 L0,0 Z"
            fill="currentColor"
          />
          <path
            d="M0,0 C380,12 700,4 1060,13 1440,6"
            stroke="#C45525"
            strokeOpacity="0.4"
            strokeWidth="1.2"
            fill="none"
          />
        </svg>
      )}

      {/* ── STYLE 2: Ahmedabad Heritage Pol & Kite Skyline (Reference Image 3) ── */}
      {variant === 'skyline' && (
        <div className={cn('relative w-full', fromColor)}>
          <svg
            viewBox="0 0 1440 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className={cn('w-full h-7 sm:h-10 block text-current', flipY && 'rotate-180')}
          >
            {/* Solid fill for preceding section */}
            <path
              d="M0,0 
                 L0,18 
                 L120,18 L130,8 L160,8 L170,18 
                 L240,18 L255,4 L270,18 
                 L340,18 L360,10 L380,18 
                 L460,18 L475,2 L490,18 
                 L570,18 L585,10 L600,18 
                 L680,18 L700,4 L720,18 
                 L800,18 L815,10 L830,18 
                 L900,18 L920,4 L940,18 
                 L1020,18 L1035,10 L1050,18 
                 L1130,18 L1145,2 L1160,18 
                 L1240,18 L1260,10 L1280,18 
                 L1350,18 L1365,6 L1380,18 
                 L1440,18 L1440,0 Z"
              fill="currentColor"
            />
            {/* Ahmedabad Heritage Pol Rooftop Outline */}
            <path
              d="M0,18 
                 L120,18 L130,8 L160,8 L170,18 
                 L240,18 L255,4 L270,18 
                 L340,18 L360,10 L380,18 
                 L460,18 L475,2 L490,18 
                 L570,18 L585,10 L600,18 
                 L680,18 L700,4 L720,18 
                 L800,18 L815,10 L830,18 
                 L900,18 L920,4 L940,18 
                 L1020,18 L1035,10 L1050,18 
                 L1130,18 L1145,2 L1160,18 
                 L1240,18 L1260,10 L1280,18 
                 L1350,18 L1365,6 L1380,18 
                 L1440,18"
              stroke="#C45525"
              strokeOpacity="0.45"
              strokeWidth="1.2"
              fill="none"
            />
            {/* Uttarayan Flying Kites & String Lines */}
            <g stroke="#E58A13" strokeOpacity="0.5" strokeWidth="1">
              {/* Kite 1 */}
              <polygon points="200,6 205,10 200,14 195,10" fill="#E58A13" fillOpacity="0.3" />
              <path d="M200,14 Q204,18 200,22" />
              {/* Kite 2 */}
              <polygon points="640,4 645,8 640,12 635,8" fill="#C45525" fillOpacity="0.35" />
              <path d="M640,12 Q644,17 638,20" />
              {/* Kite 3 */}
              <polygon points="1090,5 1095,9 1090,13 1085,9" fill="#E58A13" fillOpacity="0.3" />
              <path d="M1090,13 Q1094,18 1088,21" />
            </g>
          </svg>
        </div>
      )}

      {/* ── STYLE 3: Central Radiant Sunburst / Mandala Halo Arc (Reference Image 1) ── */}
      {variant === 'mandala' && (
        <svg
          viewBox="0 0 1440 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className={cn('w-full h-5 sm:h-7 block', fromColor, flipY && 'rotate-180')}
        >
          {/* Shallow base arc with central dip */}
          <path
            d="M0,0 L600,0 C660,12 780,12 840,0 L1440,0 L1440,0 L0,0 Z"
            fill="currentColor"
          />
          {/* Seam line */}
          <path
            d="M0,0 L600,0 C660,12 780,12 840,0 L1440,0"
            stroke="#C45525"
            strokeOpacity="0.3"
            strokeWidth="1.2"
            fill="none"
          />
          {/* Central Sunburst Rays & Lotus Petals */}
          <g transform="translate(720, 6)">
            {/* Concentric Halo Arc */}
            <path
              d="M-50,0 A50,14 0 0,0 50,0"
              stroke="#E58A13"
              strokeOpacity="0.45"
              strokeWidth="1"
              strokeDasharray="2 3"
              fill="none"
            />
            {/* Central Lotus Dot Cluster */}
            <circle cx="0" cy="8" r="2.5" fill="#C45525" fillOpacity="0.8" />
            <circle cx="-16" cy="6" r="1.8" fill="#E58A13" fillOpacity="0.7" />
            <circle cx="16" cy="6" r="1.8" fill="#E58A13" fillOpacity="0.7" />
            <circle cx="-32" cy="3" r="1.5" fill="#C45525" fillOpacity="0.6" />
            <circle cx="32" cy="3" r="1.5" fill="#C45525" fillOpacity="0.6" />
          </g>
        </svg>
      )}

      {/* ── STYLE 4: Kathiyawadi Diamond Bandhani Dot Seam (Reference Image 2) ── */}
      {variant === 'bandhani' && (
        <div className="relative w-full h-3 sm:h-4 flex items-center justify-center">
          {/* Solid Top Fill */}
          <div className={cn('absolute inset-0', fromColor)} style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }} />
          {/* Hairline */}
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C45525]/30 to-transparent" />
          {/* Repeating Bandhani Diamond Dot Pattern */}
          <svg
            viewBox="0 0 1440 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-3 block text-primary/40"
          >
            {/* Diamond dots repeating across width */}
            <g fill="currentColor">
              {[120, 240, 360, 480, 600, 720, 840, 960, 1080, 1200, 1320].map((x) => (
                <polygon
                  key={x}
                  points={`${x},2 ${x + 3},6 ${x},10 ${x - 3},6`}
                  fill={x === 720 ? '#C45525' : '#E58A13'}
                  fillOpacity={x === 720 ? 0.9 : 0.6}
                />
              ))}
            </g>
          </svg>
        </div>
      )}

      {/* ── STYLE 5: Corner Paisley Flourish Seam ── */}
      {variant === 'paisley' && (
        <svg
          viewBox="0 0 1440 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className={cn('w-full h-3 sm:h-4.5 block', fromColor, flipY && 'rotate-180')}
        >
          <path d="M0,0 L1440,0 L1440,4 L0,4 Z" fill="currentColor" />
          <line x1="0" y1="4" x2="1440" y2="4" stroke="#C45525" strokeOpacity="0.35" strokeWidth="1" />
          {/* Left Paisley Scroll */}
          <path
            d="M20,4 C35,4 45,12 60,12 C70,12 75,6 85,6 C90,6 95,9 100,9"
            stroke="#C45525"
            strokeOpacity="0.5"
            strokeWidth="1.2"
            fill="none"
          />
          <circle cx="102" cy="9" r="1.5" fill="#C45525" fillOpacity="0.7" />
          {/* Right Paisley Scroll */}
          <path
            d="M1420,4 C1405,4 1395,12 1380,12 C1370,12 1365,6 1355,6 C1350,6 1345,9 1340,9"
            stroke="#C45525"
            strokeOpacity="0.5"
            strokeWidth="1.2"
            fill="none"
          />
          <circle cx="1338" cy="9" r="1.5" fill="#C45525" fillOpacity="0.7" />
        </svg>
      )}

      {/* ── STYLE 6: Modern Architectural Diagonal Slant ── */}
      {variant === 'slant' && (
        <svg
          viewBox="0 0 1440 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className={cn('w-full h-3.5 sm:h-5 block', fromColor, flipY && 'rotate-180')}
        >
          <path d="M0,0 L1440,16 L1440,0 L0,0 Z" fill="currentColor" />
          <line x1="0" y1="0" x2="1440" y2="16" stroke="#C45525" strokeOpacity="0.4" strokeWidth="1.2" />
        </svg>
      )}

      {/* ── STYLE 7: Sacred Diya / Flame Petal Notch (for Annadaan & Giving) ── */}
      {variant === 'diya' && (
        <svg
          viewBox="0 0 1440 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className={cn('w-full h-3.5 sm:h-5 block', fromColor, flipY && 'rotate-180')}
        >
          <path
            d="M0,0 L680,0 C695,0 705,12 720,12 C735,12 745,0 760,0 L1440,0 L1440,0 L0,0 Z"
            fill="currentColor"
          />
          <path
            d="M0,0 L680,0 C695,0 705,12 720,12 C735,12 745,0 760,0 L1440,0"
            stroke="#C45525"
            strokeOpacity="0.4"
            strokeWidth="1.2"
            fill="none"
          />
          {/* Diya Flame Tip Icon */}
          <circle cx="720" cy="16" r="2" fill="#E58A13" fillOpacity="0.8" />
        </svg>
      )}

      {/* ── STYLE 8: Royal Double Terracotta Hairline with Brass Diamond Seal ── */}
      {(variant === 'double-line' || variant === 'crest') && (
        <div className="relative w-full h-3 sm:h-4 flex items-center justify-center">
          <div className="w-full space-y-1">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#C45525]/35 to-transparent" />
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#E58A13]/25 to-transparent" />
          </div>
          {/* Center Brass Diamond Seal */}
          <div className="absolute flex items-center justify-center size-4 rounded-full bg-background border border-[#C45525]/40 shadow-xs">
            <div className="size-1.5 rotate-45 bg-[#C45525]" />
          </div>
        </div>
      )}

      {/* ── Fallback Clean Straight Hairline ── */}
      {(variant === 'line' || variant === 'straight') && (
        <div className="relative w-full h-2.5 sm:h-3 flex items-center justify-center">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
          <div className="absolute inset-x-1/4 h-2 bg-primary/10 blur-[2px] pointer-events-none" />
        </div>
      )}

      {/* ── Fallback Shallow Curve / Arc ── */}
      {(variant === 'curve' || variant === 'arc' || variant === 'scallop') && (
        <svg
          viewBox="0 0 1440 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className={cn('w-full h-2.5 sm:h-3.5 block', fromColor, flipY && 'rotate-180')}
        >
          <path
            d="M0,0 C480,10 960,10 1440,0 L1440,0 L0,0 Z"
            fill="currentColor"
          />
          <path
            d="M0,0 C480,10 960,10 1440,0"
            stroke="#C45525"
            strokeOpacity="0.3"
            strokeWidth="1.2"
            fill="none"
          />
        </svg>
      )}
    </div>
  )
}
