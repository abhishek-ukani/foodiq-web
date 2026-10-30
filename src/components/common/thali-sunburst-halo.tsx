import { cn } from '@/lib/utils'

interface ThaliSunburstHaloProps {
  className?: string
}

/**
 * Authentic radiant Indian mandala / sunburst halo ring.
 * Inspired by traditional Saurashtra brass thali engravings, rangoli sunbursts,
 * and royal dining halos. Rendered behind the Hero Thali visual.
 */
export function ThaliSunburstHalo({ className }: ThaliSunburstHaloProps) {
  // 24 radiating sunburst petals / droplets around 360 degrees
  const rayCount = 24
  const rays = Array.from({ length: rayCount }, (_, i) => {
    const angle = (i * 360) / rayCount
    const isMajor = i % 2 === 0
    return { angle, isMajor }
  })

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 flex items-center justify-center select-none overflow-visible',
        className,
      )}
    >
      {/* ── Soft Warm Ambient Radial Glow ── */}
      <div className="absolute size-[120%] rounded-full bg-[radial-gradient(circle,rgba(229,138,19,0.18)_0%,rgba(196,85,37,0.08)_50%,transparent_72%)] blur-2xl" />

      {/* ── Outer Decorative Mandala Sunburst SVG ── */}
      <svg
        viewBox="0 0 560 560"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-[135%] sm:size-[142%] animate-[spin_120s_linear_infinite]"
      >
        {/* Outer Fine Dashed Ring */}
        <circle
          cx="280"
          cy="280"
          r="260"
          stroke="#C45525"
          strokeOpacity="0.22"
          strokeWidth="1.2"
          strokeDasharray="4 6"
        />

        {/* Outer Dot Ring */}
        <circle
          cx="280"
          cy="280"
          r="248"
          stroke="#E58A13"
          strokeOpacity="0.28"
          strokeWidth="1"
        />

        {/* Radiating Saffron & Terracotta Drops / Petals */}
        <g transform="translate(280, 280)">
          {rays.map(({ angle, isMajor }) => (
            <g key={angle} transform={`rotate(${angle})`}>
              {/* Petal Drop (alternating terracotta and gold) */}
              <path
                d="M-3,-228 C-4,-236 0,-246 0,-246 C0,-246 4,-236 3,-228 C2,-224 -2,-224 -3,-228 Z"
                fill={isMajor ? '#C45525' : '#E58A13'}
                fillOpacity={isMajor ? 0.75 : 0.6}
              />
              {/* Subtle Ray Line */}
              <line
                x1="0"
                y1="-208"
                x2="0"
                y2="-222"
                stroke={isMajor ? '#C45525' : '#E58A13'}
                strokeOpacity={isMajor ? 0.4 : 0.25}
                strokeWidth={isMajor ? 1.5 : 1}
              />
              {/* Outer Micro Dot */}
              <circle
                cx="0"
                cy="-256"
                r={isMajor ? 2.5 : 1.5}
                fill={isMajor ? '#E58A13' : '#C45525'}
                fillOpacity={0.65}
              />
            </g>
          ))}
        </g>

        {/* Middle Intricate Brass Thali Engraving Rings */}
        <circle
          cx="280"
          cy="280"
          r="202"
          stroke="#C45525"
          strokeOpacity="0.25"
          strokeWidth="1.5"
        />
        <circle
          cx="280"
          cy="280"
          r="194"
          stroke="#E58A13"
          strokeOpacity="0.2"
          strokeWidth="1"
          strokeDasharray="2 4"
        />

        {/* Inner Subtle Sunburst Ring */}
        <circle
          cx="280"
          cy="280"
          r="164"
          stroke="#C45525"
          strokeOpacity="0.15"
          strokeWidth="1.2"
        />
      </svg>
    </div>
  )
}
