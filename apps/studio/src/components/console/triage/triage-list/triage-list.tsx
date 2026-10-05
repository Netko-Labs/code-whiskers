import { useState } from 'react'
import { DataListSkeleton } from '@/components/shared/data-list'
import {
  groupByRecency,
  matchesQuery,
  type TriageListProps,
  useLeavingRows,
  useTriageKeys,
} from '../lib'
import { TriageGroups } from './triage-groups'
import { TriageListEmpty } from './triage-list-empty'
import { TriageListHeader } from './triage-list-header'

export function TriageList({
  bucket,
  filter,
  items,
  selectedId,
  isLoading,
  isUnreachable,
}: TriageListProps) {
  const [query, setQuery] = useState('')
  const shown = query ? items.filter((item) => matchesQuery(item, query)) : items
  const rows = useLeavingRows(shown, `${bucket}|${filter}|${query}`)
  useTriageKeys(shown, selectedId, bucket)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TriageListHeader
        bucket={bucket}
        filter={filter}
        count={shown.length}
        query={query}
        onQuery={setQuery}
      />
      {rows.length > 0 ? (
        <TriageGroups bucket={bucket} groups={groupByRecency(rows)} selectedId={selectedId} />
      ) : isLoading ? (
        <DataListSkeleton rows={8} density="auto" className="[&>div]:h-[54px]" />
      ) : (
        <TriageListEmpty
          bucket={bucket}
          isFiltered={!!query || filter !== 'all'}
          isUnreachable={isUnreachable}
        />
      )}
    </div>
  )
}
