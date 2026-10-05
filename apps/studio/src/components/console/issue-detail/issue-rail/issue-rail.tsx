import { formatAge } from '@/shared/format-date'
import { shortRelease } from '../../shared/issue-lifecycle'
import type { IssueRailProps } from '../lib'
import { IssueActivity } from './issue-activity'
import { IssueFacetList } from './issue-facet-list'

export function IssueRail({ issue, detail }: IssueRailProps) {
  const environments = (detail?.environments ?? []).map((env) => ({
    name: env.name,
    count: env.count,
  }))
  const releases = (detail?.releases ?? []).map((release) => ({
    name: shortRelease(release.name),
    count: release.count,
    note: `first ${formatAge(release.firstSeen)} ago`,
  }))

  return (
    <aside className="flex min-w-0 flex-col gap-6">
      <IssueFacetList title="Environments" rows={environments} />
      <IssueFacetList title="Releases" rows={releases} isMono />
      <IssueActivity key={issue.id} issue={issue} />
    </aside>
  )
}
