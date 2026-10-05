import { Checkbox } from '@code-whiskers/ui/components/checkbox'
import { cn } from '@code-whiskers/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import { formatAge } from '@/shared/format-date'
import { issueTriageRef, triageKey, useMembers, useTriageRecords } from '../../shared/console-data'
import { PersonAvatar } from '../../shared/console-ui'
import { IssueBadges, LevelRule, TrendBars } from '../../shared/issue-ui'
import { ISSUE_GRID, type IssueListRowProps } from './lib'

const NUMBER = 'text-right font-mono text-[12px] tabular-nums'

/** The title is a stretched link; the checkbox sits above it so selecting never navigates. */
export function IssueListRow({
  issue,
  project,
  hasStatus,
  isSelected,
  onToggle,
}: IssueListRowProps) {
  const records = useTriageRecords()
  const members = useMembers()
  const ref = issueTriageRef(issue)
  const assigneeId = ref ? records.get(triageKey(ref))?.assigneeUserId : null
  const assignee = members.find((member) => member.id === assigneeId)
  const isOpen = issue.status === 'unresolved'

  return (
    <div
      className={cn(
        'relative grid h-9 items-center gap-x-4 border-rule-soft border-b px-8 transition-colors hover:bg-surface-subtle',
        isSelected && 'bg-surface-subtle',
      )}
      style={{ gridTemplateColumns: ISSUE_GRID }}
    >
      <Checkbox
        aria-label={`Select ${issue.title}`}
        checked={isSelected}
        onClick={(event) => onToggle(issue.id, event.shiftKey)}
        className="z-[1]"
      />
      <div className="flex min-w-0 items-center gap-2">
        <LevelRule level={issue.level} isMuted={!isOpen} className="h-4" />
        <Link
          to="/console/issues/$issueId"
          params={{ issueId: issue.id }}
          className={cn(
            'min-w-0 shrink truncate font-medium text-[13px] after:absolute after:inset-0',
            !isOpen && 'text-muted-foreground',
          )}
        >
          {issue.title}
        </Link>
        {issue.culprit && (
          <span className="min-w-0 shrink-[2] truncate font-mono text-[11.5px] text-muted-foreground">
            {issue.culprit}
          </span>
        )}
        <IssueBadges issue={issue} hasStatus={hasStatus} />
      </div>
      <span className="truncate font-mono text-[12px] text-muted-foreground">{project}</span>
      <TrendBars values={issue.trend} />
      <span className={NUMBER}>{issue.eventCount.toLocaleString()}</span>
      <span className={cn(NUMBER, 'text-muted-foreground')}>
        {issue.userCount.toLocaleString()}
      </span>
      <span className={cn(NUMBER, 'text-muted-foreground')}>{formatAge(issue.lastSeen)}</span>
      {assignee ? (
        <PersonAvatar name={assignee.name} image={assignee.image} className="size-5 text-[8px]" />
      ) : (
        <span />
      )}
    </div>
  )
}
