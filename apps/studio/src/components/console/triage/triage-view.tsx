import { SplitView } from '@/components/shared/split-view'
import { type TriageViewProps, useTriageItems } from './lib'
import { TriageDetail } from './triage-detail'
import { TriageList } from './triage-list'

/** Linear's inbox: what needs a human on the left, the selected item in full on the right. */
export function TriageView({ bucket, filter, selectedId }: TriageViewProps) {
  const { items, selected, unreachable, isLoading } = useTriageItems(bucket, filter, selectedId)

  return (
    <SplitView
      listDefaultSize="38"
      listMinSize={300}
      detailMinSize={420}
      list={
        <TriageList
          bucket={bucket}
          filter={filter}
          items={items}
          selectedId={selected?.id ?? ''}
          isLoading={isLoading}
          isUnreachable={unreachable}
        />
      }
      detail={selected ? <TriageDetail key={selected.id} item={selected} /> : null}
    />
  )
}
