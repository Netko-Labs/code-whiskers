import { useMemo } from 'react'
import { SNOOZED_IDS, useConsoleItems, VIEWER } from '../../../shared/console-data'
import type { ConsoleItem, TriageBucket, TriageFilter } from '../../../shared/console-model'
import { useConsoleStore } from '../../../use-console-store'
import { matchesFilter } from '../utils'

export type TriageItemsResult = {
  items: ConsoleItem[]
  selected: ConsoleItem | undefined
  sample: boolean
  unreachable: boolean
}

export function useTriageItems(
  bucket: TriageBucket,
  filter: TriageFilter,
  selectedId: string | undefined,
): TriageItemsResult {
  const { items, sample, unreachable } = useConsoleItems()
  const assignee = useConsoleStore((s) => s.assignee)

  return useMemo(() => {
    const visible = items.filter((item) => {
      if (bucket === 'assigned' && assignee[item.id] !== VIEWER.name) return false
      if (bucket === 'snoozed' && !SNOOZED_IDS.includes(item.id)) return false
      return matchesFilter(item, filter)
    })

    const selected = visible.find((item) => item.id === selectedId) ?? visible[0]
    return { items: visible, selected, sample, unreachable }
  }, [items, assignee, bucket, filter, selectedId, sample, unreachable])
}
