import { buttonVariants } from '@code-whiskers/ui/components/button'
import { Link } from '@tanstack/react-router'
import { DataList, DataListSkeleton } from '@/components/shared/data-list'
import { EmptyState, ErrorState } from '@/components/shared/empty-state'
import type { PullRequestsBodyProps } from './lib'
import { PullRequestRow } from './pull-request-row'

export function PullRequestsBody({ state, isFiltered }: PullRequestsBodyProps) {
  if (state.isLoading) return <DataListSkeleton rows={8} density="auto" />
  if (state.isError) {
    return (
      <ErrorState
        title="Whiskers did not answer"
        description="The review worker is unreachable right now; pull requests come back with it."
        onRetry={state.refetch}
      />
    )
  }
  if (state.total === 0) {
    return (
      <EmptyState
        title="No reviews yet"
        description="Watch a repository and open a pull request. Whiskers reviews each push a minute or two after it lands."
        action={
          <Link to="/console/repositories" className={buttonVariants({ size: 'sm' })}>
            Choose repositories
          </Link>
        }
        secondary={
          <Link
            to="/console/review-rules"
            className="text-muted-foreground text-ui underline-offset-4 hover:text-foreground hover:underline"
          >
            Write a review rule
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
        description={
          isFiltered ? 'No pull request fits these filters.' : 'Nothing reviewed in this scope yet.'
        }
      />
    )
  }

  return (
    <>
      <DataList label="Pull requests" isAnimated={state.arrivals.size === 0}>
        {state.rows.map((pullRequest) => (
          <PullRequestRow
            key={`${pullRequest.key}:${pullRequest.latest.id}:${pullRequest.latest.status}`}
            pullRequest={pullRequest}
            isArriving={state.arrivals.has(pullRequest.key)}
          />
        ))}
      </DataList>
      <p className="m-0 px-gutter py-4 text-2xs text-faint">
        One row per pull request, read from its newest push · Whiskers comments, it never merges
      </p>
    </>
  )
}
