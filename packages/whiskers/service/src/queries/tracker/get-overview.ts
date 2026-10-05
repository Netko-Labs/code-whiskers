import { eventTable, issueTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { count, type SQL, sql } from 'drizzle-orm'
import type { Overview, OverviewScope, OverviewWindow } from './types'
import { denseSeries, overviewWindowOf } from './utils'

type Row = Record<string, unknown>
type BucketRow = { bucket: number; count: number }

// Times go in as ISO strings: `timestamp` columns hold UTC, a raw Date param binds local time.
function bucketOf(column: string, window: OverviewWindow): SQL {
  return sql`floor(extract(epoch from (${sql.raw(column)} - ${window.start.toISOString()}::timestamp)) / ${window.stepMs / 1000})::int`
}

function sinceOf(column: string, window: OverviewWindow): SQL {
  return sql`${sql.raw(column)} >= ${window.start.toISOString()}::timestamp`
}

function inProjects(projectIds: string[] | undefined): SQL {
  if (!projectIds) return sql``
  return sql`and project_id in (${sql.join(
    projectIds.map((id) => sql`${id}`),
    sql`, `,
  )})`
}

/** A project scope with no repository has no reviews; no scope at all reads every review. */
function inRepository(scope: OverviewScope): SQL | null {
  if (scope.repository) return sql`and lower(owner || '/' || repo) = lower(${scope.repository})`
  return scope.projectIds ? null : sql``
}

function rowsOf(result: unknown, key = 'n'): BucketRow[] {
  return (result as Row[]).map((row) => ({ bucket: Number(row.bucket), count: Number(row[key]) }))
}

async function bucketed(
  table: string,
  column: string,
  scope: OverviewScope,
  window: OverviewWindow,
) {
  return rowsOf(
    await db.execute(sql`
      select ${bucketOf(column, window)} as bucket, count(*)::int as n from ${sql.raw(table)}
      where ${sinceOf(column, window)} ${inProjects(scope.projectIds)}
      group by 1`),
  )
}

async function reviewRows(scope: OverviewScope, window: OverviewWindow): Promise<Row[]> {
  const repository = inRepository(scope)
  if (!repository) return []
  return (await db.execute(sql`
    select ${bucketOf('created_at', window)} as bucket, count(*)::int as n,
      (count(*) filter (where status = 'failed'))::int as failed
    from review where ${sinceOf('created_at', window)} ${repository}
    group by 1`)) as Row[]
}

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

/** The dashboard's numbers over one range, bucketed for its charts, read in one round of queries. */
export const getOverview = async (scope: OverviewScope, now = new Date()): Promise<Overview> => {
  const window = overviewWindowOf(scope.range, now)
  const [events, newIssues, regressions, reviews, unresolved, allEvents, allIssues] =
    await Promise.all([
      bucketed('event', 'received_at', scope, window),
      bucketed('issue', 'first_seen', scope, window),
      bucketed('issue', 'regressed_at', scope, window),
      reviewRows(scope, window),
      db.execute(sql`
        select count(*)::int as n from issue
        where status = 'unresolved' ${inProjects(scope.projectIds)}`),
      db.select({ value: count() }).from(eventTable),
      db.select({ value: count() }).from(issueTable),
    ])

  const dense = (rows: BucketRow[]) => denseSeries(window.length, rows)
  const columns = {
    events: dense(events),
    newIssues: dense(newIssues),
    regressions: dense(regressions),
    reviews: dense(rowsOf(reviews)),
    failedReviews: dense(rowsOf(reviews, 'failed')),
  }
  const at = (series: number[], index: number) => series[index] ?? 0

  return {
    summary: { events: allEvents[0]?.value ?? 0, issues: allIssues[0]?.value ?? 0 },
    range: scope.range,
    stepMs: window.stepMs,
    series: columns.events.map((_, index) => ({
      bucket: new Date(window.start.getTime() + index * window.stepMs),
      events: at(columns.events, index),
      newIssues: at(columns.newIssues, index),
      regressions: at(columns.regressions, index),
      reviews: at(columns.reviews, index),
      failedReviews: at(columns.failedReviews, index),
    })),
    totals: {
      events: sum(columns.events),
      newIssues: sum(columns.newIssues),
      regressions: sum(columns.regressions),
      reviews: sum(columns.reviews),
      failedReviews: sum(columns.failedReviews),
      unresolved: Number((unresolved as Row[])[0]?.n ?? 0),
    },
  }
}
