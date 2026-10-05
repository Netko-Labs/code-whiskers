import { useEffect, useMemo, useState } from 'react'
import type { ConsoleItem } from '../../../shared/console-model'
import type { LeavingRow, TriageRowEntry } from '../types'
import { goneRows, mergeLeaving } from '../utils'
import { LEAVE_MS } from '../values'

/**
 * Keeps a row that just left the list on screen for one fold, so triage reads as the item going
 * away rather than the list jumping. Derived during render so the row never blinks out first. A
 * new `viewKey` (bucket, filter, search) is a different list: nothing folds.
 */
export function useLeavingRows(items: ConsoleItem[], viewKey: string): TriageRowEntry[] {
  const signature = `${viewKey}|${items.map((item) => item.id).join(',')}`
  const [seen, setSeen] = useState({ signature, viewKey, items, leaving: [] as LeavingRow[] })

  if (seen.signature !== signature) {
    const gone = seen.viewKey === viewKey ? goneRows(seen.items, items) : []
    const goneIds = new Set(gone.map((row) => row.item.id))
    const kept = seen.viewKey === viewKey ? seen.leaving : []
    setSeen({
      signature,
      viewKey,
      items,
      leaving: [...kept.filter((row) => !goneIds.has(row.item.id)), ...gone],
    })
  }

  const { leaving } = seen
  useEffect(() => {
    if (leaving.length === 0) return
    const ids = new Set(leaving.map((row) => row.item.id))
    const timer = setTimeout(() => {
      setSeen((current) => ({
        ...current,
        leaving: current.leaving.filter((row) => !ids.has(row.item.id)),
      }))
    }, LEAVE_MS)
    return () => clearTimeout(timer)
  }, [leaving])

  return useMemo(() => mergeLeaving(items, leaving), [items, leaving])
}
