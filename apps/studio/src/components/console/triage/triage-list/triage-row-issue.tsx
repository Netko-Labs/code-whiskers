import { IssueBadges, TrendBars } from '../../shared/issue-ui'
import type { TriageRowIssueProps } from '../lib'

/** An error row's evidence: where it throws, its badges, and two weeks of events at a glance. */
export function TriageRowIssue({ item, owner }: TriageRowIssueProps) {
  const { issue } = item
  if (!issue) return null

  return (
    <>
      {issue.culprit && (
        <span className="truncate font-mono text-[11.5px] text-muted-foreground">
          {issue.culprit}
        </span>
      )}
      <span className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <IssueBadges issue={issue} />
        <span className="min-w-0 flex-1 truncate">
          {[item.scopeLabel, owner ? `→ ${owner}` : null].filter(Boolean).join(' · ')}
        </span>
        <TrendBars values={issue.trend} className="h-3 w-12 shrink-0" />
        <span className="shrink-0 font-mono text-[11px] text-faint tabular-nums">
          {issue.eventCount.toLocaleString()} · {item.age}
        </span>
      </span>
    </>
  )
}
