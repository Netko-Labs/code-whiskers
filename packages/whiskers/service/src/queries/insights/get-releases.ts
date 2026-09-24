import { db } from '@code-whiskers/whiskers-repository'
import { sql } from 'drizzle-orm'
import type { ReleaseSummary } from './types'
import { asDate, inProjects } from './utils'

type Row = Record<string, unknown>

/**
 * One row per release an SDK reported, with what it brought: an issue counts as new in the
 * release of its first event.
 */
export const getReleases = async (projectIds?: string[]): Promise<ReleaseSummary[]> => {
  const rows = (await db.execute(sql`
    with first_events as (
      select distinct on (issue_id) issue_id, project_id, release
      from event order by issue_id, received_at asc
    ),
    introduced as (
      select project_id, release, count(*) as new_issues
      from first_events where release is not null group by project_id, release
    )
    select e.project_id, e.release,
           min(e.received_at) as first_seen, max(e.received_at) as last_seen,
           count(*) as events, count(distinct e.issue_id) as issues,
           coalesce(max(i.new_issues), 0) as new_issues,
           max(e.environment) as environment
    from event e
    left join introduced i on i.project_id = e.project_id and i.release = e.release
    where e.release is not null ${inProjects('e.project_id', projectIds)}
    group by e.project_id, e.release
    order by min(e.received_at) desc
    limit 100`)) as Row[]

  return rows.map((row) => ({
    projectId: String(row.project_id),
    release: String(row.release),
    environment: row.environment ? String(row.environment) : null,
    firstSeen: asDate(row.first_seen),
    lastSeen: asDate(row.last_seen),
    events: Number(row.events),
    issues: Number(row.issues),
    newIssues: Number(row.new_issues),
  }))
}
