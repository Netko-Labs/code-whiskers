import { buttonVariants } from '@code-whiskers/ui/components/button'
import { DataGroupHeader, DataList, DataListSkeleton } from '@/components/shared/data-list'
import { EmptyState, ErrorState } from '@/components/shared/empty-state'
import type { RepositoriesBodyProps } from './lib'
import { RepositoryRow } from './repository-row'

export function RepositoriesBody({ state, isFiltered }: RepositoriesBodyProps) {
  if (state.isLoading) return <DataListSkeleton rows={6} density="auto" />
  if (state.isError) {
    return <ErrorState description="Studio could not list repositories." onRetry={state.refetch} />
  }
  if (state.total === 0) {
    return (
      <EmptyState
        title="No repositories connected"
        description="Install the CodeWhiskers GitHub App on an account or organization, then sync. Every repository it can see shows here, ready to watch."
        action={
          state.installUrl && (
            <a
              href={state.installUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ size: 'sm' })}
            >
              Install the GitHub App
            </a>
          )
        }
      />
    )
  }
  if (state.groups.length === 0) {
    return (
      <EmptyState
        size="inline"
        expression="sleeping"
        title="No matches"
        description={isFiltered ? 'No repository fits this search.' : 'Nothing on this tab.'}
      />
    )
  }

  return (
    <>
      {state.groups.map((group) => (
        <section key={group.owner} aria-label={group.owner}>
          <DataGroupHeader label={group.owner} count={group.rows.length} />
          <DataList label={`Repositories in ${group.owner}`}>
            {group.rows.map((row) => (
              <RepositoryRow key={row.repository.id} row={row} />
            ))}
          </DataList>
        </section>
      ))}
      <p className="m-0 px-gutter py-4 text-2xs text-faint">
        Pausing stops reviews and keeps everything else · blockers count pull requests active in the
        last 14 days
      </p>
    </>
  )
}
