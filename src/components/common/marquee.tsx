import React from 'react'
import { cn } from '@/lib/utils'

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  reverse?: boolean
  pauseOnHover?: boolean
  children: React.ReactNode
  duration?: string
  showFades?: boolean
  fadeColor?: string
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = true,
  children,
  duration = '32s',
  showFades = true,
  fadeColor = 'from-[#FAF4E6]',
  ...props
}: MarqueeProps) {
  return (
    <div
      className={cn(
        'group relative flex w-full overflow-hidden select-none py-1',
        className,
      )}
      style={{ '--marquee-duration': duration } as React.CSSProperties}
      {...props}
    >
      <div
        className={cn(
          'flex min-w-full shrink-0 items-center justify-around gap-4',
          reverse ? 'animate-marquee-reverse' : 'animate-marquee',
          pauseOnHover && 'group-hover:[animation-play-state:paused]',
        )}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className={cn(
          'flex min-w-full shrink-0 items-center justify-around gap-4',
          reverse ? 'animate-marquee-reverse' : 'animate-marquee',
          pauseOnHover && 'group-hover:[animation-play-state:paused]',
        )}
      >
        {children}
      </div>

      {showFades && (
        <>
          <div
            className={cn(
              'pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 bg-gradient-to-r to-transparent z-10',
              fadeColor,
            )}
          />
          <div
            className={cn(
              'pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l to-transparent z-10',
              fadeColor,
            )}
          />
        </>
      )}
    </div>
  )
}
