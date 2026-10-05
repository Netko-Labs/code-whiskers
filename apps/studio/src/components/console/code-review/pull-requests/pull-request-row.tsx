import { cn } from '@code-whiskers/ui/lib/utils'
import { IconGitPullRequest } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { DataRow, DataRowLead, DataRowMeta, DataRowTrail } from '@/components/shared/data-list'
import { formatAge } from '@/shared/format-date'
import { blockerCount } from '../shared/review-model'
import { SeverityCounts } from '../shared/severity-counts'
import { VerdictBadge } from '../shared/verdict-badge'
import type { PullRequestRowProps } from './lib'

export function PullRequestRow({ pullRequest, isArriving }: PullRequestRowProps) {
  const { latest } = pullRequest
  const hasBlockers = blockerCount(pullRequest.counts) > 0

  return (
    <DataRow
      density="auto"
      tone={hasBlockers ? 'error' : 'neutral'}
      className={cn(isArriving && 'animate-highlight')}
      render={<Link to="/console/reviews/$reviewId" params={{ reviewId: latest.id }} />}
    >
      <DataRowLead>
        <IconGitPullRequest stroke={1.75} />
      </DataRowLead>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="shrink-0 font-mono text-2xs text-muted-foreground tabular-nums">
            #{pullRequest.prNumber}
          </span>
          <span className="min-w-0 truncate font-medium">
            {pullRequest.title ?? 'Untitled pull request'}
          </span>
        </span>
        <span className="flex min-w-0 items-center gap-1.5 text-2xs text-muted-foreground">
          <span className="truncate font-mono">{pullRequest.slug}</span>
          {pullRequest.author && (
            <>
              <span className="text-faint">·</span>
              <span className="shrink-0">{pullRequest.author}</span>
            </>
          )}
          {latest.headRef && (
            <>
              <span className="hidden text-faint sm:inline">·</span>
              <span className="hidden truncate font-mono sm:inline">{latest.headRef}</span>
            </>
          )}
        </span>
      </span>
      <DataRowTrail>
        <SeverityCounts counts={pullRequest.counts} className="hidden w-28 justify-end md:flex" />
        <DataRowMeta className="hidden w-16 text-right lg:block">
          {pullRequest.pushes} {pullRequest.pushes === 1 ? 'push' : 'pushes'}
        </DataRowMeta>
        <span className="flex w-36 justify-end">
          <VerdictBadge verdict={pullRequest.verdict} />
        </span>
        <DataRowMeta className="w-8 text-right">{formatAge(pullRequest.lastActivity)}</DataRowMeta>
      </DataRowTrail>
    </DataRow>
  )
}
