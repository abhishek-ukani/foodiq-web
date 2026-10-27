import { cn } from '@/lib/utils'

type DividerVariant = 'scallop' | 'wave' | 'curve' | 'crest'

interface SectionDividerProps {
  variant?: DividerVariant
  /** Background color of the section ABOVE this divider (e.g. 'text-[#FAF6EE]') */
  fromColor?: string
  /** Background color of the section BELOW this divider (e.g. 'bg-[#F5EEDD]') */
  toColor?: string
  className?: string
  flipY?: boolean
}

/**
 * Handcrafted SVG section transitions inspired by traditional Kathiyawadi
 * jali patterns, brass thali scalloped rims, and organic earth curves.
 * Creates seamless contrast between alternating page sections.
 */
export function SectionDivider({
  variant = 'wave',
  fromColor = 'text-background',
  toColor = 'bg-transparent',
  className,
  flipY = false,
}: SectionDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'w-full overflow-hidden leading-none select-none pointer-events-none -mb-px -mt-px',
        toColor,
        className,
      )}
    >
      {variant === 'wave' && (
        <svg
          viewBox="0 0 1440 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className={cn('w-full h-8 sm:h-12 block', fromColor, flipY && 'rotate-180')}
        >
          <path
            d="M0,0 C320,38 420,48 720,24 C1020,0 1140,42 1440,16 L1440,0 L0,0 Z"
            fill="currentColor"
          />
        </svg>
      )}

      {variant === 'scallop' && (
        <svg
          viewBox="0 0 1440 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className={cn('w-full h-6 sm:h-9 block', fromColor, flipY && 'rotate-180')}
        >
          <path
            d="M0,0 Q60,48 120,0 Q180,48 240,0 Q300,48 360,0 Q420,48 480,0 Q540,48 600,0 Q660,48 720,0 Q780,48 840,0 Q900,48 960,0 Q1020,48 1080,0 Q1140,48 1200,0 Q1260,48 1320,0 Q1380,48 1440,0 L1440,0 L0,0 Z"
            fill="currentColor"
          />
        </svg>
      )}

      {variant === 'curve' && (
        <svg
          viewBox="0 0 1440 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className={cn('w-full h-8 sm:h-14 block', fromColor, flipY && 'rotate-180')}
        >
          <path
            d="M0,0 C480,56 960,56 1440,0 L1440,0 L0,0 Z"
            fill="currentColor"
          />
        </svg>
      )}

      {variant === 'crest' && (
        <svg
          viewBox="0 0 1440 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className={cn('w-full h-6 sm:h-10 block', fromColor, flipY && 'rotate-180')}
        >
          <path
            d="M0,0 L680,32 C710,36 730,36 760,32 L1440,0 L1440,0 L0,0 Z"
            fill="currentColor"
          />
        </svg>
      )}
    </div>
  )
}
