import { useEffect, useRef, useState } from 'react'
import type { WhiskersLog } from '@/integrations/whiskers'
import type { LiveTail, TailAck } from '../types'
import { nextAck, tailView } from '../utils'
import { TOP_MARGIN } from '../values'

/**
 * Reading at the top, new lines flow in and flash once; scrolled away, they wait behind a
 * "N new lines" pill. Paused, nothing is held back.
 */
export function useLiveTail(lines: WhiskersLog[], isLive: boolean): LiveTail {
  const [ack, setAck] = useState<TailAck | null>(null)
  const [isAtTop, setIsAtTop] = useState(true)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsAtTop(entry?.isIntersecting ?? true),
      { rootMargin: `-${TOP_MARGIN}px 0px 0px 0px` },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isLive || lines.length === 0) return
    setAck((current) => (current === null || isAtTop ? nextAck(lines, current) : current))
  }, [isLive, isAtTop, lines])

  const held = isLive ? ack : null
  return {
    ...tailView(lines, held),
    freshAfter: held?.freshAfter ?? Number.POSITIVE_INFINITY,
    sentinelRef,
    showNew: () => {
      setAck((current) => nextAck(lines, current))
      sentinelRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    },
  }
}
