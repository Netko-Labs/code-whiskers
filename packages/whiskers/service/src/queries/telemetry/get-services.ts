import { db } from '@code-whiskers/whiskers-repository'
import { sql } from 'drizzle-orm'
import { asDate, inProjects } from '../insights/utils'
import type { ServiceSummary } from './types'

/** Every service that logged or traced in the last day, with its error share and latency. */
export const getServices = async (projectIds?: string[]): Promise<ServiceSummary[]> => {
  const rows = (await db.execute(sql`
    with logs as (
      select service, count(*) as logs,
             count(*) filter (where level in ('ERROR', 'FATAL')) as log_errors,
             max(timestamp) as last_log
      from log_line where timestamp > now() - interval '1 day' ${inProjects('project_id', projectIds)} group by service
    ),
    spans as (
      select service, count(*) as spans,
             count(*) filter (where status = 'error') as span_errors,
             percentile_cont(0.5) within group (order by duration_ms) as p50,
             percentile_cont(0.95) within group (order by duration_ms) as p95,
             max(start_time) as last_span
      from span where start_time > now() - interval '1 day' ${inProjects('project_id', projectIds)} group by service
    )
    select coalesce(l.service, s.service) as service,
           coalesce(l.logs, 0) as logs, coalesce(l.log_errors, 0) as log_errors,
           coalesce(s.spans, 0) as spans, coalesce(s.span_errors, 0) as span_errors,
           s.p50, s.p95, greatest(l.last_log, s.last_span) as last_seen
    from logs l full outer join spans s on s.service = l.service
    order by coalesce(l.log_errors, 0) + coalesce(s.span_errors, 0) desc, 1`)) as Record<
    string,
    unknown
  >[]
  return rows.map((row) => ({
    service: String(row.service),
    logs: Number(row.logs),
    logErrors: Number(row.log_errors),
    spans: Number(row.spans),
    spanErrors: Number(row.span_errors),
    p50Ms: row.p50 === null ? null : Number(row.p50),
    p95Ms: row.p95 === null ? null : Number(row.p95),
    lastSeen: row.last_seen ? asDate(row.last_seen) : null,
  }))
}
