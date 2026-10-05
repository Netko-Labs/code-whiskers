import { useEffect, useRef, useState } from 'react'
import type { ArrivalEntry } from '../types'

const NONE = new Set<string>()

/** Keys whose stamp changed since the previous answer; the first answer marks nothing. */
export function useArrivals(entries: ArrivalEntry[]): Set<string> {
  const seen = useRef<Map<string, string> | null>(null)
  const [arrivals, setArrivals] = useState(NONE)

  useEffect(() => {
    const previous = seen.current
    seen.current = new Map(entries.map((entry) => [entry.key, entry.stamp]))
    if (!previous) return
    const fresh = entries.filter((entry) => previous.get(entry.key) !== entry.stamp)
    if (fresh.length > 0) setArrivals(new Set(fresh.map((entry) => entry.key)))
  }, [entries])

  return arrivals
}
