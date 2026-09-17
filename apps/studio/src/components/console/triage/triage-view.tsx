import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@code-whiskers/ui/components/empty'
import { SAMPLE_DATA_NOTE } from '../shared/console-data'
import { type TriageViewProps, useTriageItems } from './lib'
import { TriageDetail } from './triage-detail'
import { TriageList } from './triage-list'

export function TriageView({ bucket, filter, selectedId }: TriageViewProps) {
  const { items, selected, sample, unreachable } = useTriageItems(bucket, filter, selectedId)

  const note = sample
    ? unreachable
      ? 'Sample data — whiskers is unreachable'
      : SAMPLE_DATA_NOTE
    : ''

  return (
    <>
      <TriageList
        bucket={bucket}
        filter={filter}
        items={items}
        selectedId={selected?.id ?? ''}
        sampleNote={note}
      />
      <div className="relative flex min-w-[420px] flex-1 flex-col">
        {selected ? (
          <TriageDetail item={selected} />
        ) : (
          <Empty className="flex-1">
            <EmptyHeader>
              <EmptyTitle>Nothing here</EmptyTitle>
              <EmptyDescription>No items match this bucket and filter.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </>
  )
}
