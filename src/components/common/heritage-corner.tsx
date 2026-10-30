import { cn } from '@/lib/utils'

interface HeritageCornerProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  className?: string
  size?: number
}

/**
 * Ancient & Traditional Indian / Kathiyawadi Paisley (Ambi / Kalka) Corner Watermark.
 * Inspired by authentic Gujarati block prints, Mughal royal court textiles,
 * kalamkari tapestries, and traditional wedding invitation filigree.
 *
 * Richly detailed with:
 * - Quarter-mandala corner crown with scalloped lotus arcs
 * - Double-contoured royal Kalka (paisley) with pearl-beaded outer spine
 * - Traditional Kathiyawadi diamond jali (lattice) & blooming lotus medallion
 * - Flanking acanthus leaves, champaka buds, and scrolling botanical tendrils
 * - Delicate mehndi / henna stippling pearls
 */
export function HeritageCorner({
  position = 'top-right',
  className,
  size = 280,
}: HeritageCornerProps) {
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0 scale-x-[-1]',
    'bottom-left': 'bottom-0 left-0 scale-y-[-1]',
    'bottom-right': 'bottom-0 right-0 scale-x-[-1] scale-y-[-1]',
  }[position]

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute select-none overflow-hidden z-0 opacity-20 transition-opacity duration-300',
        positionClasses,
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-full text-current"
      >
        {/* ── 1. CORNER APEX MANDALA CROWN (Quarter-Circle radiating from 0,0) ── */}
        <g stroke="currentColor" strokeWidth="1.2">
          {/* Inner ring */}
          <path d="M0 24 A 24 24 0 0 1 24 0" />
          {/* Dotted ring */}
          <path d="M0 38 A 38 38 0 0 1 38 0" strokeDasharray="2 3" strokeWidth="1" />
          {/* Scalloped petal arch */}
          <path
            d="M0 54 Q 6 50 12 52 Q 18 44 26 48 Q 34 38 42 44 Q 48 32 54 0"
            strokeWidth="1.2"
          />
          {/* Outer framing ring */}
          <path d="M0 68 A 68 68 0 0 1 68 0" strokeWidth="1" />
          <path d="M0 76 A 76 76 0 0 1 76 0" strokeDasharray="3 4" strokeWidth="0.8" />
        </g>

        {/* Apex Pearl Beads */}
        <g fill="currentColor">
          <circle cx="16" cy="16" r="2.2" />
          <circle cx="32" cy="12" r="1.8" />
          <circle cx="12" cy="32" r="1.8" />
          <circle cx="48" cy="16" r="2" />
          <circle cx="16" cy="48" r="2" />
          <circle cx="36" cy="36" r="2.5" />
          <circle cx="58" cy="32" r="1.8" />
          <circle cx="32" cy="58" r="1.8" />
        </g>

        {/* Corner Radiating Lotus Petals */}
        <path
          d="M20 20 C 32 8 48 8 52 24 C 44 28 32 32 20 20 Z"
          stroke="currentColor"
          strokeWidth="1"
          fill="currentColor"
          fillOpacity="0.08"
        />
        <path
          d="M20 20 C 8 32 8 48 24 52 C 28 44 32 32 20 20 Z"
          stroke="currentColor"
          strokeWidth="1"
          fill="currentColor"
          fillOpacity="0.08"
        />
        <path
          d="M28 28 C 42 20 56 32 48 48 C 38 46 32 38 28 28 Z"
          stroke="currentColor"
          strokeWidth="1"
          fill="currentColor"
          fillOpacity="0.12"
        />

        {/* ── 2. THE GRAND ROYAL KALKA (PAISLEY) BODY ── */}
        {/* Outer Spine Scalloped Lace Fringe */}
        <path
          d="M 52 238
             Q 44 226 50 216 Q 44 204 54 194 Q 50 182 62 172 Q 62 160 76 150
             Q 80 138 96 128 Q 104 116 122 108 Q 134 96 154 88 Q 170 78 192 72
             Q 212 66 234 68 Q 254 72 268 84 Q 280 98 282 116 Q 280 136 264 148
             Q 248 158 232 152 Q 220 144 216 130 Q 216 116 226 106 Q 234 100 242 104"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        />

        {/* Primary Outer Sweeping Contour */}
        <path
          d="M 56 248
             C 40 214 46 172 74 138
             C 104 102 148 76 200 68
             C 244 60 280 76 290 108
             C 298 136 280 166 248 174
             C 222 180 202 162 204 138
             C 206 118 222 104 238 108
             C 248 110 254 120 250 128
             C 246 134 238 134 236 128"
          stroke="currentColor"
          strokeWidth="1.8"
          fill="currentColor"
          fillOpacity="0.04"
        />

        {/* Secondary Inner Parallel Contour (Double Wall) */}
        <path
          d="M 68 244
             C 54 214 60 180 84 150
             C 112 118 152 94 198 86
             C 236 80 266 94 274 118
             C 280 140 266 160 240 166
             C 220 170 210 156 212 140
             C 214 128 224 118 236 120"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
        />

        {/* Pearl Dots Along Outer Double-Wall Channel */}
        <g fill="currentColor">
          <circle cx="62" cy="226" r="1.6" />
          <circle cx="68" cy="204" r="1.7" />
          <circle cx="76" cy="182" r="1.8" />
          <circle cx="88" cy="162" r="1.9" />
          <circle cx="102" cy="144" r="2.0" />
          <circle cx="118" cy="128" r="2.1" />
          <circle cx="138" cy="114" r="2.2" />
          <circle cx="160" cy="102" r="2.2" />
          <circle cx="184" cy="92" r="2.2" />
          <circle cx="210" cy="86" r="2.2" />
          <circle cx="236" cy="86" r="2.2" />
          <circle cx="258" cy="94" r="2.1" />
          <circle cx="272" cy="108" r="2.0" />
          <circle cx="274" cy="126" r="1.9" />
          <circle cx="266" cy="144" r="1.8" />
          <circle cx="250" cy="156" r="1.7" />
          <circle cx="232" cy="158" r="1.6" />
        </g>

        {/* ── 3. PAISLEY BELLY: JALI LATTICE & BLOOMING LOTUS ── */}
        {/* Core Heart Teardrop Frame */}
        <path
          d="M 88 232
             C 76 206 84 180 102 160
             C 124 136 156 120 186 116
             C 214 112 230 126 226 144
             C 222 160 204 172 186 172
             C 160 172 134 192 120 216
             C 110 232 98 240 88 232 Z"
          stroke="currentColor"
          strokeWidth="1.3"
          fill="currentColor"
          fillOpacity="0.06"
        />

        {/* Traditional Diamond Jali (Cross-Hatch Lattice Grid in Paisley Belly) */}
        <g stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.45">
          <line x1="96" y1="184" x2="148" y2="236" />
          <line x1="108" y1="168" x2="168" y2="228" />
          <line x1="124" y1="154" x2="188" y2="218" />
          <line x1="144" y1="144" x2="204" y2="204" />
          <line x1="168" y1="138" x2="216" y2="186" />

          <line x1="148" y1="140" x2="96" y2="192" />
          <line x1="168" y1="148" x2="108" y2="208" />
          <line x1="188" y1="156" x2="124" y2="220" />
          <line x1="204" y1="168" x2="144" y2="228" />
        </g>

        {/* Jali Diamond Dots */}
        <g fill="currentColor" fillOpacity="0.7">
          <circle cx="122" cy="188" r="1.3" />
          <circle cx="138" cy="174" r="1.3" />
          <circle cx="154" cy="162" r="1.3" />
          <circle cx="170" cy="154" r="1.3" />
          <circle cx="136" cy="202" r="1.3" />
          <circle cx="152" cy="188" r="1.3" />
          <circle cx="168" cy="176" r="1.3" />
          <circle cx="184" cy="168" r="1.3" />
          <circle cx="150" cy="216" r="1.3" />
          <circle cx="166" cy="202" r="1.3" />
          <circle cx="182" cy="190" r="1.3" />
        </g>

        {/* Royal Blooming Lotus Medallion in Lower Belly */}
        <g transform="translate(112, 198) scale(0.72)">
          {/* Central seed */}
          <circle cx="0" cy="0" r="5" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1" />
          {/* 6 Radiating Lotus Petals */}
          <path d="M 0 -5 C -6 -14 6 -14 0 -5 Z" fill="currentColor" fillOpacity="0.6" stroke="currentColor" strokeWidth="1" />
          <path d="M 4 -3 C 12 -8 16 2 4 -3 Z" fill="currentColor" fillOpacity="0.6" stroke="currentColor" strokeWidth="1" />
          <path d="M 4 3 C 14 6 8 16 4 3 Z" fill="currentColor" fillOpacity="0.6" stroke="currentColor" strokeWidth="1" />
          <path d="M 0 5 C 6 14 -6 14 0 5 Z" fill="currentColor" fillOpacity="0.6" stroke="currentColor" strokeWidth="1" />
          <path d="M -4 3 C -12 8 -16 -2 -4 3 Z" fill="currentColor" fillOpacity="0.6" stroke="currentColor" strokeWidth="1" />
          <path d="M -4 -3 C -14 -6 -8 -16 -4 -3 Z" fill="currentColor" fillOpacity="0.6" stroke="currentColor" strokeWidth="1" />
        </g>

        {/* Radiating Sunburst Drops around Inner Core */}
        <g fill="currentColor" fillOpacity="0.5">
          <path d="M 124 142 C 126 136 132 134 130 142 Z" />
          <path d="M 142 130 C 146 124 152 124 148 132 Z" />
          <path d="M 162 122 C 168 118 174 120 168 126 Z" />
          <path d="M 184 120 C 190 118 194 122 188 126 Z" />
          <path d="M 204 124 C 210 124 212 130 206 132 Z" />
        </g>

        {/* ── 4. FLANKING BOTANICAL VINES, LEAVES & LOTUS BUDS ── */}
        {/* TOP FLANK VINE (sweeping towards the right border) */}
        <path
          d="M 108 68
             C 128 48 162 38 196 36
             C 226 34 256 42 284 32
             C 298 28 308 18 312 8"
          stroke="currentColor"
          strokeWidth="1.4"
          fill="none"
        />

        {/* Top Vine Flourish Leaves & Lotus Buds */}
        <path
          d="M 166 42 C 164 26 182 22 188 36 C 180 40 172 44 166 42 Z"
          stroke="currentColor"
          strokeWidth="1"
          fill="currentColor"
          fillOpacity="0.15"
        />
        <path
          d="M 224 38 C 228 22 246 22 248 38 C 240 40 230 42 224 38 Z"
          stroke="currentColor"
          strokeWidth="1"
          fill="currentColor"
          fillOpacity="0.15"
        />
        {/* Blooming Champaka / Lotus Bud at Top End */}
        <g transform="translate(284, 32) rotate(-20) scale(0.8)">
          <path
            d="M 0 0 C -8 -16 8 -24 16 -12 C 20 -4 12 8 0 0 Z"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="currentColor"
            fillOpacity="0.2"
          />
          <path
            d="M 4 -4 C 0 -12 10 -16 12 -8 Z"
            fill="currentColor"
            fillOpacity="0.5"
          />
          <circle cx="16" cy="-14" r="2" fill="currentColor" />
        </g>

        {/* Curled Tendril Spiral at Top */}
        <path
          d="M 198 36 C 206 24 218 24 220 32 C 222 38 214 42 210 38"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        />
        <circle cx="210" cy="38" r="1.5" fill="currentColor" />

        {/* LEFT FLANK VINE (sweeping downwards towards bottom border) */}
        <path
          d="M 68 108
             C 48 128 38 162 36 196
             C 34 226 42 256 32 284
             C 28 298 18 308 8 312"
          stroke="currentColor"
          strokeWidth="1.4"
          fill="none"
        />

        {/* Left Vine Flourish Leaves */}
        <path
          d="M 42 166 C 26 164 22 182 36 188 C 40 180 44 172 42 166 Z"
          stroke="currentColor"
          strokeWidth="1"
          fill="currentColor"
          fillOpacity="0.15"
        />
        <path
          d="M 38 224 C 22 228 22 246 38 248 C 40 240 42 230 38 224 Z"
          stroke="currentColor"
          strokeWidth="1"
          fill="currentColor"
          fillOpacity="0.15"
        />
        {/* Drooping Champaka Bud at Left End */}
        <g transform="translate(32, 284) rotate(70) scale(0.8)">
          <path
            d="M 0 0 C -8 -16 8 -24 16 -12 C 20 -4 12 8 0 0 Z"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="currentColor"
            fillOpacity="0.2"
          />
          <path
            d="M 4 -4 C 0 -12 10 -16 12 -8 Z"
            fill="currentColor"
            fillOpacity="0.5"
          />
          <circle cx="16" cy="-14" r="2" fill="currentColor" />
        </g>

        {/* Curled Tendril Spiral at Left */}
        <path
          d="M 36 198 C 24 206 24 218 32 220 C 38 222 42 214 38 210"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        />
        <circle cx="38" cy="210" r="1.5" fill="currentColor" />

        {/* ── 5. SCALLOPED FAN & TRADITIONAL BASE ROSETTE ── */}
        <path
          d="M 54 250
             C 62 260 76 270 94 274
             C 112 278 126 270 134 260
             C 120 254 104 252 86 250 Z"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="currentColor"
          fillOpacity="0.1"
        />
        {/* Base fan floret ribs */}
        <path d="M 66 254 L 80 270" stroke="currentColor" strokeWidth="0.9" />
        <path d="M 82 252 L 96 274" stroke="currentColor" strokeWidth="0.9" />
        <path d="M 100 252 L 114 270" stroke="currentColor" strokeWidth="0.9" />
        <path d="M 118 254 L 126 264" stroke="currentColor" strokeWidth="0.9" />

        {/* Base pearl cluster */}
        <circle cx="80" cy="274" r="2" fill="currentColor" />
        <circle cx="96" cy="278" r="2.4" fill="currentColor" />
        <circle cx="114" cy="274" r="2" fill="currentColor" />

        {/* Auxiliary Micro-Ambi (Kalka Bud) at Base */}
        <path
          d="M 48 262 C 40 274 46 290 60 292 C 72 294 80 286 76 274 C 70 270 60 272 56 264 Z"
          stroke="currentColor"
          strokeWidth="1"
          fill="currentColor"
          fillOpacity="0.08"
        />
        <circle cx="58" cy="282" r="1.8" fill="currentColor" />
      </svg>
    </div>
  )
}
