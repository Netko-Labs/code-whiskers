import { IconGitPullRequest } from '@tabler/icons-react'
import { useState } from 'react'
import { Page, PageHeader } from '@/components/shared/page'
import { LiveDot } from '@/components/shared/status'
import { type PullRequestsPageProps, usePullRequestList } from './lib'
import { PullRequestsBody } from './pull-requests-body'
import { PullRequestsToolbar } from './pull-requests-toolbar'

export function PullRequestsPage({ search }: PullRequestsPageProps) {
  const [query, setQuery] = useState('')
  const state = usePullRequestList(search, query)
  const isFiltered = !!(search.repo || search.verdict || search.mine || query.trim())

  return (
    <Page>
      <PageHeader
        icon={<IconGitPullRequest stroke={1.75} />}
        title="Pull requests"
        description={
          state.total === 0 ? 'Whiskers reviews every push to a watched repository' : undefined
        }
        meta={
          state.total > 0 && (
            <>
              <span className="animate-enter">
                <span className="font-medium font-mono text-foreground tabular-nums">
                  {state.total}
                </span>{' '}
                reviewed
              </span>
              <span className="text-faint">·</span>
              <span className="animate-enter">
                <span className="font-medium font-mono text-foreground tabular-nums">
                  {state.blocked}
                </span>{' '}
                with blockers
              </span>
              {state.running > 0 && (
                <>
                  <span className="text-faint">·</span>
                  <span className="animate-enter">
                    <span className="font-medium font-mono text-foreground tabular-nums">
                      {state.running}
                    </span>{' '}
                    reviewing now
                  </span>
                </>
              )}
              <LiveDot label="Updates live" />
            </>
          )
        }
      />
      {state.total > 0 && (
        <PullRequestsToolbar search={search} query={query} onQuery={setQuery} state={state} />
      )}
      <PullRequestsBody state={state} isFiltered={isFiltered} />
    </Page>
  )
}
