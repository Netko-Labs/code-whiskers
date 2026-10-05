import { formatAge } from '@/shared/format-date'
import { issueTriageRef, triageKey, useMembers, useTriageRecords } from '../../shared/console-data'
import { shortRelease } from '../../shared/issue-lifecycle'
import type { IssueStatsProps } from '../lib'

const CELL =
  'flex min-w-0 flex-col gap-[3px] border-rule-soft border-r px-5 py-[13px] last:border-r-0'
const LABEL = 'text-[11px] text-muted-foreground'
const VALUE = 'font-mono font-semibold text-base tabular-nums'
const NOTE = 'truncate font-mono text-[11px] text-muted-foreground'

export function IssueStats({ issue }: IssueStatsProps) {
  const records = useTriageRecords()
  const members = useMembers()
  const ref = issueTriageRef(issue)
  const assigneeId = ref ? records.get(triageKey(ref))?.assigneeUserId : null
  const owner = members.find((member) => member.id === assigneeId)?.name ?? 'Unassigned'

  return (
    <div className="grid shrink-0 grid-cols-[repeat(auto-fit,minmax(140px,1fr))] border-border border-b">
      <div className={CELL}>
        <span className={LABEL}>Events</span>
        <span className={VALUE}>{issue.eventCount.toLocaleString()}</span>
      </div>
      <div className={CELL}>
        <span className={LABEL}>Users</span>
        <span className={VALUE}>{issue.userCount.toLocaleString()}</span>
      </div>
      <div className={CELL}>
        <span className={LABEL}>First seen</span>
        <span className={VALUE}>{formatAge(issue.firstSeen)} ago</span>
        <span className={NOTE}>
          {issue.firstRelease ? `in ${shortRelease(issue.firstRelease)}` : 'no release'}
        </span>
      </div>
      <div className={CELL}>
        <span className={LABEL}>Last seen</span>
        <span className={VALUE}>{formatAge(issue.lastSeen)} ago</span>
        <span className={NOTE}>
          {issue.lastRelease ? `in ${shortRelease(issue.lastRelease)}` : 'no release'}
        </span>
      </div>
      <div className={CELL}>
        <span className={LABEL}>Assignee</span>
        <span className="truncate font-medium text-sm">{owner}</span>
      </div>
    </div>
  )
}
