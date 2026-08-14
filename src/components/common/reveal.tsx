import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

interface RevealProps {
  children: ReactNode
  /** Seconds to stagger this item behind its siblings. */
  delay?: number
  /** Pixels to travel upward as the element fades in. */
  y?: number
  className?: string
}

/** How long to wait for the observer before showing content unconditionally. */
const VISIBILITY_FAILSAFE_MS = 1000

/**
 * Fade-and-rise on scroll into view.
 *
 * Deliberately not a bare `whileInView` + `initial={{ opacity: 0 }}`: that leaves
 * content stuck at zero opacity whenever the IntersectionObserver never fires —
 * slow JS, a prerenderer, or a crawler that skips observers. Since these pages
 * need to be indexable, the content reveals itself after a short timeout
 * regardless, and skips the animation entirely under `prefers-reduced-motion`.
 */
export function Reveal({ children, delay = 0, y = 12, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })
  const prefersReducedMotion = useReducedMotion()
  const [failsafeElapsed, setFailsafeElapsed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setFailsafeElapsed(true), VISIBILITY_FAILSAFE_MS)
    return () => clearTimeout(timer)
  }, [])

  const isVisible = inView || failsafeElapsed || Boolean(prefersReducedMotion)

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={
        prefersReducedMotion ? { duration: 0 } : { duration: 0.4, delay, ease: 'easeOut' }
      }
    >
      {children}
    </motion.div>
  )
}
