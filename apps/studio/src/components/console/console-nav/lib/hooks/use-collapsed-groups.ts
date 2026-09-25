import { useCallback, useEffect, useState } from 'react'
import type { CollapsedGroups } from '../types'
import { NAV_COLLAPSED_KEY } from '../values'

function readCollapsed(): string[] {
  try {
    const stored = JSON.parse(window.localStorage.getItem(NAV_COLLAPSED_KEY) ?? '[]')
    return Array.isArray(stored) ? stored.filter((label) => typeof label === 'string') : []
  } catch {
    return []
  }
}

/** Which sidebar groups are folded — a per-browser preference, so it lives in localStorage. */
export function useCollapsedGroups(): CollapsedGroups {
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(() => new Set())

  // Read after mount: the server render has no storage, and the first paint must match it.
  useEffect(() => setCollapsed(new Set(readCollapsed())), [])

  const toggle = useCallback((label: string) => {
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      try {
        window.localStorage.setItem(NAV_COLLAPSED_KEY, JSON.stringify([...next]))
      } catch {
        // Private windows can refuse storage; folding still works for this visit.
      }
      return next
    })
  }, [])

  return { collapsed, toggle }
}
