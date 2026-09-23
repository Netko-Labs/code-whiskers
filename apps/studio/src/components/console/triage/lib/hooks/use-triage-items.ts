import { useMemo } from 'react'
import {
  inBucket,
  statusFor,
  useConsoleItems,
  useTriageRecords,
  useViewer,
} from '../../../shared/console-data'
import type { ConsoleItem, TriageBucket, TriageFilter } from '../../../shared/console-model'
import { useConsoleStore } from '../../../use-console-store'
import { matchesFilter } from '../utils'

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
      return (
        inBucket(statusFor(item, records, now), bucket, viewer?.id) &&
        inOrganization(item, orgLogin) &&
        matchesFilter(item, filter)
      )
    })

    const selected = visible.find((item) => item.id === selectedId) ?? visible[0]
    return { items: visible, selected, sample, unreachable }
  }, [items, records, viewer, orgLogin, bucket, filter, selectedId, sample, unreachable])
}
