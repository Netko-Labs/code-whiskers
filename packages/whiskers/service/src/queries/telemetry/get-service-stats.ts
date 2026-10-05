import { db } from '@code-whiskers/whiskers-repository'
import { type SQL, sql } from 'drizzle-orm'
import { asDate, inProjects } from '../insights/utils'
import { bucketSql } from './conditions'
import { STATS_WINDOW_MS } from './constants'
import type { ServiceLogRow, ServicePointRow, ServiceStatsPage, ServiceTotalRow } from './types'
import { bucketPlan, mergeServiceStats, numberOrNull, windowOf } from './utils'

// A request is a span that entered the service: a server span or a trace root.
const IS_REQUEST = sql`(kind = 2 or parent_span_id is null)`

const REQUEST_METRICS = sql`
  count(*)::int as requests,
  count(*) filter (where status = 'error')::int as errors,
  percentile_cont(0.5) within group (order by duration_ms) as p50,
  percentile_cont(0.95) within group (order by duration_ms) as p95`

function rowsOf(result: unknown): Record<string, unknown>[] {
  return result as Record<string, unknown>[]
}

/** Request rate, errors and latency per service, whole-window and per bucket, plus log volume. */
export const getServiceStats = async (
  range: { projectIds?: string[]; from?: Date; to?: Date },
  buckets: number,
): Promise<ServiceStatsPage> => {
  const plan = bucketPlan(windowOf(range.from, range.to, STATS_WINDOW_MS), buckets)
  const from = plan.from.toISOString()
  const to = plan.to.toISOString()
  const spanWhere: SQL = sql`start_time >= ${from}::timestamp and start_time < ${to}::timestamp
    and ${IS_REQUEST} ${inProjects('project_id', range.projectIds)}`

  const [totals, points, logs] = await Promise.all([
    db.execute(sql`
      select service, ${REQUEST_METRICS}, max(start_time) as last_seen
      from span where ${spanWhere} group by service`),
    db.execute(sql`
      select service, ${bucketSql('start_time', plan.from, plan.stepMs)} as bucket, ${REQUEST_METRICS}
      from span where ${spanWhere} group by 1, 2`),
    db.execute(sql`
      select service, count(*)::int as logs,
             count(*) filter (where level in ('ERROR', 'FATAL'))::int as log_errors,
             max(timestamp) as last_seen
      from log_line
      where timestamp >= ${from}::timestamp and timestamp < ${to}::timestamp
        ${inProjects('project_id', range.projectIds)}
      group by service`),
  ])

  const totalRows: ServiceTotalRow[] = rowsOf(totals).map((row) => ({
    service: String(row.service),
    requests: Number(row.requests),
    errors: Number(row.errors),
    p50Ms: numberOrNull(row.p50),
    p95Ms: numberOrNull(row.p95),
    lastSeen: row.last_seen ? asDate(row.last_seen) : null,
  }))
  const pointRows: ServicePointRow[] = rowsOf(points).map((row) => ({
    service: String(row.service),
    bucket: Number(row.bucket),
    requests: Number(row.requests),
    errors: Number(row.errors),
    p50Ms: numberOrNull(row.p50),
    p95Ms: numberOrNull(row.p95),
  }))
  const logRows: ServiceLogRow[] = rowsOf(logs).map((row) => ({
    service: String(row.service),
    logs: Number(row.logs),
    logErrors: Number(row.log_errors),
    lastSeen: row.last_seen ? asDate(row.last_seen) : null,
  }))

  return {
    from: plan.from,
    to: plan.to,
    stepMs: plan.stepMs,
    services: mergeServiceStats(totalRows, pointRows, logRows, plan),
  }
}
