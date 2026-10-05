import { type Issue, issueTable } from '@code-whiskers/whiskers-domain'
import { sql } from 'drizzle-orm'
import { TREND_DAYS } from './constants'
import { getIssueStats } from './issue-stats'
import type { IssueRow } from './types'
import { badgesOf } from './utils'

// Raw SQL on purpose: drizzle renders a correlated subquery's columns unqualified, so
// `issue_id = id` would resolve both sides against event. An index probe per row.
export const FIRST_RELEASE = sql<string | null>`(
  select e.release from event e
  where e.issue_id = "issue"."id" and e.release is not null
  order by e.received_at asc limit 1
)`

export const ISSUE_ROW_COLUMNS = { issue: issueTable, firstRelease: FIRST_RELEASE }

/** Issues as a reader sees them: badges and a 14-day trend, from one stats query for all. */
export async function toIssueRows(
  rows: { issue: Issue; firstRelease: string | null }[],
  now: Date,
): Promise<IssueRow[]> {
  const stats = await getIssueStats(
    rows.map(({ issue }) => issue.id),
    now,
  )
  return rows.map(({ issue, firstRelease }) => {
    const issueStats = stats.get(issue.id)
    return {
      ...issue,
      firstRelease,
      trend: issueStats?.trend ?? new Array<number>(TREND_DAYS).fill(0),
      badges: badgesOf(
        {
          ...issue,
          lastHourEvents: issueStats?.lastHourEvents ?? 0,
          previousWeekEvents: issueStats?.previousWeekEvents ?? 0,
        },
        now,
      ),
    }
  })
}
