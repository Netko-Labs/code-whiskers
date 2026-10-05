import { Fragment } from 'react'
import { DataGroupHeader, DataList } from '@/components/shared/data-list'
import { type TriageGroupListProps, useScrollSelected } from '../lib'
import { TriageRow } from './triage-row'

/** One list so ↑↓ walk across bands; the bands are headers inside it, not separate lists. */
export function TriageGroups({ bucket, groups, selectedId }: TriageGroupListProps) {
  const ref = useScrollSelected(selectedId)

  return (
    <div ref={ref} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <DataList label="Inbox">
        {groups.map((group) => (
          <Fragment key={group.key}>
            <DataGroupHeader
              label={group.label}
              count={group.rows.filter((row) => !row.isLeaving).length}
              className="sticky top-0 z-[1]"
            />
            {group.rows.map((entry) => (
              <TriageRow
                key={entry.item.id}
                bucket={bucket}
                entry={entry}
                isSelected={entry.item.id === selectedId}
              />
            ))}
          </Fragment>
        ))}
      </DataList>
    </div>
  )
}
