import { buttonVariants } from '@code-whiskers/ui/components/button'
import { Link } from '@tanstack/react-router'
import { DataList, DataListHeader, DataListSkeleton } from '@/components/shared/data-list'
import { EmptyState, ErrorState } from '@/components/shared/empty-state'
import { SeverityDot } from '@/components/shared/status'
import { HotspotRow } from './hotspot-row'
import type { CodebaseMapBodyProps } from './lib'

export function CodebaseMapBody({ state, isFiltered }: CodebaseMapBodyProps) {
  if (state.isLoading) return <DataListSkeleton rows={8} density="auto" />
  if (state.isError) {
    return <ErrorState title="Whiskers did not answer" onRetry={state.refetch} />
  }
  if (state.total === 0) {
    return (
      <EmptyState
        title="Nothing mapped yet"
        description="The map fills in from review findings of the last 90 days. Once Whiskers has reviewed a few pull requests, the directories that keep coming up rank here."
        action={
          <Link to="/console/pull-requests" className={buttonVariants({ size: 'sm' })}>
            See pull requests
          </Link>
        }
      />
    )
  }
  if (state.rows.length === 0) {
    return (
      <EmptyState
        size="inline"
        expression="sleeping"
        title="No matches"
        description={isFiltered ? 'No directory fits these filters.' : 'Nothing here.'}
      />
    )
  }

  return (
    <>
      <DataListHeader>
        <span className="w-4" />
        <span className="w-[38%] shrink-0">Directory</span>
        <span className="flex flex-1 items-center gap-3">
          Findings by severity
          <span className="hidden items-center gap-1 font-normal sm:inline-flex">
            <SeverityDot tone="error" size="sm" /> critical, high
            <SeverityDot tone="warning" size="sm" className="ml-2" /> medium
            <SeverityDot tone="neutral" size="sm" className="ml-2" /> low
          </span>
        </span>
        <span className="w-10 text-right">Total</span>
        <span className="hidden w-16 text-right md:block">Spread</span>
        <span className="hidden w-10 text-right sm:block">Last</span>
      </DataListHeader>
      <DataList label="Directories by findings">
        {state.rows.map((row) => (
          <HotspotRow key={row.key} row={row} />
        ))}
      </DataList>
      <p className="m-0 px-gutter py-4 text-2xs text-faint">
        Newest review of each pull request, last 90 days · owners from each repository's CODEOWNERS
      </p>
    </>
  )
}
