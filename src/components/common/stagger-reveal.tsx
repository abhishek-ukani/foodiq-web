import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StaggerRevealProps {
  children: ReactNode
  staggerDelay?: number
  className?: string
}

/**
 * Container component that staggers the entrance of its direct children
 * as it enters the viewport. Deliberately includes an observer failsafe
 * so content never remains hidden if IntersectionObserver delays.
 */
export function StaggerReveal({
  children,
  staggerDelay = 0.08,
  className,
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })
  const prefersReducedMotion = useReducedMotion()
  const [failsafeElapsed, setFailsafeElapsed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setFailsafeElapsed(true), 900)
    return () => clearTimeout(timer)
  }, [])

  const isVisible = inView || failsafeElapsed || Boolean(prefersReducedMotion)

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  children: ReactNode
  y?: number
  className?: string
}

export function StaggerItem({ children, y = 18, className }: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: prefersReducedMotion ? 0 : y },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: prefersReducedMotion ? 0 : 0.45,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}
