import { buttonVariants } from '@code-whiskers/ui/components/button'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { DataList, DataListSkeleton } from '@/components/shared/data-list'
import { EmptyState, ErrorState } from '@/components/shared/empty-state'
import { Page, PageHeader } from '@/components/shared/page'
import { type SavedQuery, savedQueriesQuery } from '@/integrations/studio-api'
import { useSavedQueryActions } from './lib'
import { RenameDialog } from './rename-dialog'
import { SavedQueryRow } from './saved-query-row'

export function SavedQueriesPage() {
  const { data, isPending, isError, refetch } = useQuery({ ...savedQueriesQuery(), retry: false })
  const [renaming, setRenaming] = useState<SavedQuery | null>(null)
  const actions = useSavedQueryActions()
  const saved = data ?? []

  return (
    <Page>
      <PageHeader
        title="Saved queries"
        description="Views you come back to: open one and its filters and time range come with it."
        meta={
          saved.length > 0 && <span className="font-mono tabular-nums">{saved.length} saved</span>
        }
      />
      {isPending ? (
        <DataListSkeleton rows={6} />
      ) : isError ? (
        <ErrorState size="inline" onRetry={() => void refetch()} />
      ) : saved.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          description="Filter logs or traces down to what matters, then use Save view to keep it here."
          action={
            <Link to="/console/live-logs" className={buttonVariants({ size: 'sm' })}>
              Open live logs
            </Link>
          }
          secondary={
            <Link
              to="/console/traces"
              className="text-muted-foreground text-ui underline-offset-4 hover:text-foreground hover:underline"
            >
              Open traces
            </Link>
          }
        />
      ) : (
        <DataList label="Saved queries">
          {saved.map((view) => (
            <SavedQueryRow
              key={view.id}
              saved={view}
              onRename={setRenaming}
              onDelete={actions.remove}
            />
          ))}
        </DataList>
      )}
      <RenameDialog
        key={renaming?.id ?? 'closed'}
        saved={renaming}
        onClose={() => setRenaming(null)}
        onRename={actions.rename}
      />
    </Page>
  )
}
