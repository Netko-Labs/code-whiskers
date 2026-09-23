import { useMemo } from 'react'
import { useConsoleItems, useTriageRecords, useViewer } from '../../../shared/console-data'
import type { ConsoleItem, TriageBucket, TriageFilter } from '../../../shared/console-model'
import { useConsoleStore } from '../../../use-console-store'
import { matchesFilter, statusFor } from '../utils'

export type TriageItemsResult = {
  items: ConsoleItem[]
  selected: ConsoleItem | undefined
  sample: boolean
  unreachable: boolean
}

function inOrganization(item: ConsoleItem, orgLogin: string | null): boolean {
  if (!orgLogin || item.kind !== 'review' || !item.triage) return true
  return item.triage.scope.toLowerCase().startsWith(`${orgLogin.toLowerCase()}/`)
}

/** Inbox hides running snoozes; Assigned is the viewer's; Snoozed is only running snoozes. */
export function useTriageItems(
  bucket: TriageBucket,
  filter: TriageFilter,
  selectedId: string | undefined,
): TriageItemsResult {
  const { items, sample, unreachable } = useConsoleItems()
  const records = useTriageRecords()
  const viewer = useViewer()
  const orgLogin = useConsoleStore((s) => s.orgLogin)

  return useMemo(() => {
    const now = new Date()
    const visible = items.filter((item) => {
      const status = statusFor(item, records, now)
      if (bucket === 'assigned' && (!viewer || status.assigneeUserId !== viewer.id)) return false
      if (bucket === 'snoozed' && !status.snoozedUntil) return false
      if (bucket === 'inbox' && status.snoozedUntil) return false
      return inOrganization(item, orgLogin) && matchesFilter(item, filter)
    })

    const selected = visible.find((item) => item.id === selectedId) ?? visible[0]
    return { items: visible, selected, sample, unreachable }
  }, [items, records, viewer, orgLogin, bucket, filter, selectedId, sample, unreachable])
}
