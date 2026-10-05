import { Panel } from '@/components/shared/page'
import { StatCard, StatGrid } from '@/components/shared/stats'
import { TrendBars } from '../../shared/issue-ui'
import { dayLabel, type ReleaseSectionProps } from './lib'
import { ReleaseIssueList } from './release-issue-list'

export function ReleaseOverview({ detail }: ReleaseSectionProps) {
  const { stats, histogram, environments } = detail
  const first = histogram[0]
  const last = histogram.at(-1)
  const suspects = detail.commits.filter((commit) => commit.suspectIssueIds.length > 0).length

  return (
    <div className="flex flex-col gap-6">
      <StatGrid>
        <StatCard label="Events" value={stats.events} trend={histogram.map((b) => b.count)} />
        <StatCard
          label="New issues"
          value={stats.newIssues}
          tone={stats.newIssues > 0 ? 'error' : 'neutral'}
          hint="first seen in this release"
        />
        <StatCard label="Users affected" value={stats.users} />
        <StatCard
          label="Commits"
          value={detail.commits.length}
          hint={suspects > 0 ? `${suspects} suspect` : undefined}
        />
      </StatGrid>
      <Panel
        title="Events"
        description={environments
          .map((env) => `${env.name} ${env.count.toLocaleString()}`)
          .join(' · ')}
      >
        <TrendBars
          values={histogram.map((bucket) => bucket.count)}
          labels={histogram.map((b) => `${dayLabel(b.bucket)} · ${b.count.toLocaleString()}`)}
          className="h-20"
        />
        <div className="mt-2 flex justify-between font-mono text-2xs text-faint">
          <span>{first ? dayLabel(first.bucket) : ''}</span>
          <span>{last ? dayLabel(last.bucket) : ''}</span>
        </div>
      </Panel>
      <div className="grid gap-4 xl:grid-cols-3">
        <ReleaseIssueList
          title="New"
          description="First seen in this release"
          issues={detail.newIssues}
          empty="It brought no new issues."
        />
        <ReleaseIssueList
          title="Regressed"
          description="Resolved before, back in this release"
          issues={detail.regressedIssues}
          empty="Nothing came back."
        />
        <ReleaseIssueList
          title="Resolved"
          description="Fixes that shipped with it"
          issues={detail.resolvedIssues}
          empty="No resolve landed in it."
        />
      </div>
    </div>
  )
}
