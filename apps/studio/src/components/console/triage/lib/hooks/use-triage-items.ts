import { useMemo, useRef } from 'react'
import {
  inBucket,
  statusFor,
  useConsoleItems,
  useTriageRecords,
  useViewer,
} from '../../../shared/console-data'
import type { ConsoleItem, TriageBucket, TriageFilter } from '../../../shared/console-model'
import { isInScope, useConsoleScope } from '../../../shared/console-scope'
import { useConsoleStore } from '../../../use-console-store'
import type { SelectionAnchor, TriageItemsResult } from '../types'
import { matchesFilter, nextSelection } from '../utils'

function inOrganization(item: ConsoleItem, orgLogin: string | null): boolean {
  if (!orgLogin) return true
  const login = orgLogin.toLowerCase()
  if (item.alert) return item.alert.organization.toLowerCase() === login
  if (item.kind !== 'review' || !item.triage) return true
  return item.triage.scope.toLowerCase().startsWith(`${login}/`)
}

export function useTriageItems(
  bucket: TriageBucket,
  filter: TriageFilter,
  selectedId: string | undefined,
): TriageItemsResult {
  const { items, unreachable, isLoading } = useConsoleItems()
  const records = useTriageRecords()
  const viewer = useViewer()
  const orgLogin = useConsoleStore((s) => s.orgLogin)
  const scope = useConsoleScope()
  const anchor = useRef<SelectionAnchor | null>(null)

  return useMemo(() => {
    const now = new Date()
    const visible = items.filter(
      (item) =>
        inBucket(item, statusFor(item, records, now), bucket, viewer?.id) &&
        inOrganization(item, orgLogin) &&
        isInScope(scope, item) &&
        matchesFilter(item, filter),
    )
    const index = visible.findIndex((item) => item.id === selectedId)
    if (selectedId && index >= 0) anchor.current = { id: selectedId, index }
    const selected = nextSelection(visible, selectedId, anchor.current)
    return { items: visible, selected, unreachable, isLoading }
  }, [items, records, viewer, orgLogin, scope, bucket, filter, selectedId, unreachable, isLoading])
}
