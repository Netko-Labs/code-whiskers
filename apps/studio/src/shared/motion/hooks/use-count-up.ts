import { useEffect, useRef, useState } from 'react'
import { COUNT_UP_DURATION_MS } from '../constants'
import { easeOutQuart, interpolate } from '../utils'
import { usePrefersReducedMotion } from './use-prefers-reduced-motion'

/** Tweens from the last shown value to `target`; reduced motion jumps straight there. */
export function useCountUp(target: number, durationMs = COUNT_UP_DURATION_MS): number {
  const isReduced = usePrefersReducedMotion()
  const [shown, setShown] = useState(target)
  const shownRef = useRef(target)

  useEffect(() => {
    const from = shownRef.current
    if (isReduced || from === target) {
      shownRef.current = target
      setShown(target)
      return
    }
    const startedAt = performance.now()
    let frame = 0
    const step = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / durationMs)
      const next = interpolate(from, target, easeOutQuart(progress))
      shownRef.current = next
      setShown(next)
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, durationMs, isReduced])

  return shown
}
