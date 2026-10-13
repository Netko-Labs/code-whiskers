import { DataList, DataListSkeleton } from '@/components/shared/data-list'
import { EmptyState, ErrorState } from '@/components/shared/empty-state'
import { useMemoryActivity } from '../lib'
import { MemoryActivityRow } from './memory-activity-row'

/** Every change people and the reviewer made to memory, newest first, each undoable. */
export function MemoryActivityList() {
  const state = useMemoryActivity()
  if (state.isLoading) return <DataListSkeleton rows={5} density="auto" />
  if (state.isError) {
    return <ErrorState description="Studio could not read the activity." onRetry={state.refetch} />
  }
  if (state.entries.length === 0) {
    return (
      <EmptyState
        size="inline"
        expression="sleeping"
        title="No changes yet"
        description="Every note added, edited or retired, by a person or by Whiskers, shows up here."
      />
    )
  }
  return (
    <DataList label="Memory activity" isDivided>
      {state.entries.map((entry) => (
        <MemoryActivityRow key={entry.id} entry={entry} onUndo={() => state.undo(entry)} />
      ))}
    </DataList>
  )
}
