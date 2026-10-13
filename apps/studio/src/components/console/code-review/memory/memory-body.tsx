import { DataList, DataListSkeleton } from '@/components/shared/data-list'
import { EmptyState, ErrorState } from '@/components/shared/empty-state'
import { draftOf, isOnTab, KIND_META, type MemoryBodyProps } from './lib'
import { MemoryEmpty } from './memory-empty'
import { MemoryNoteRow } from './memory-note-row'

export function MemoryBody({ state, tab, onEdit }: MemoryBodyProps) {
  if (state.isLoading) return <DataListSkeleton rows={4} density="auto" />
  if (state.isError) {
    return <ErrorState description="Studio could not read the memory." onRetry={state.refetch} />
  }
  if (state.notes.length === 0) {
    return <MemoryEmpty organizations={state.organizations} onWrite={onEdit} />
  }

  const visible = state.notes.filter((note) => isOnTab(note, tab))
  if (visible.length === 0) {
    const what =
      tab === 'retired' || tab === 'activity'
        ? 'Nothing retired'
        : tab === 'all'
          ? 'Nothing in use'
          : `No ${KIND_META[tab].plural.toLowerCase()} yet`
    return (
      <EmptyState
        size="inline"
        expression="sleeping"
        title={what}
        description="Switch tabs to see the rest."
      />
    )
  }

  return (
    <>
      <DataList label="Memory notes" isDivided>
        {visible.map((note) => (
          <MemoryNoteRow key={note.id} note={note} onEdit={() => onEdit(draftOf(note))} />
        ))}
      </DataList>
      <p className="m-0 px-gutter py-4 text-2xs text-faint">
        Read on every pull request it applies to · changes reach the next review within a minute
      </p>
    </>
  )
}
