import { logLineTable, spanTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, asc, desc, eq, gt, ilike, inArray, lt, type SQL, sql } from 'drizzle-orm'
import type { LogFilter, ServiceSummary, TraceSummary } from './types'
import { asDate, inProjects } from './utils'

const LOG_PAGE = 200
const TRACE_PAGE = 100
const DAY_MS = 86_400_000
const ERROR_LEVELS = ['ERROR', 'FATAL']

export const getLogs = async (filter: LogFilter) => {
  const where: SQL[] = [gt(logLineTable.timestamp, new Date(Date.now() - DAY_MS * 7))]
  if (filter.projectIds) where.push(inArray(logLineTable.projectId, filter.projectIds))
  if (filter.service) where.push(eq(logLineTable.service, filter.service))
  if (filter.level === 'error') where.push(inArray(logLineTable.level, ERROR_LEVELS))
  if (filter.level === 'warn') where.push(eq(logLineTable.level, 'WARN'))
  if (filter.query)
    where.push(ilike(logLineTable.message, `%${filter.query.replace(/[%_]/g, '\\$&')}%`))
  if (filter.before) where.push(lt(logLineTable.id, filter.before))
  return await db
    .select()
    .from(logLineTable)
    .where(and(...where))
    .orderBy(desc(logLineTable.id))
    .limit(LOG_PAGE)
}

/** One row per trace from the last day: its root operation, span count and wall time. */
export const getTraces = async (
  service?: string,
  projectIds?: string[],
): Promise<TraceSummary[]> => {
  const rows = (await db.execute(sql`
    select trace_id,
           min(start_time) as started_at,
           extract(epoch from (max(start_time + duration_ms * interval '1 millisecond') - min(start_time))) * 1000 as duration_ms,
           count(*) as spans,
           count(*) filter (where status = 'error') as errors,
           (array_agg(name order by (parent_span_id is null) desc, start_time asc))[1] as root_name,
           (array_agg(service order by (parent_span_id is null) desc, start_time asc))[1] as root_service
    from span
    where start_time > now() - interval '1 day'
      ${inProjects('project_id', projectIds)}
      ${service ? sql`and trace_id in (select trace_id from span where service = ${service})` : sql``}
    group by trace_id
    order by min(start_time) desc
    limit ${TRACE_PAGE}`)) as Record<string, unknown>[]
  return rows.map((row) => ({
    traceId: String(row.trace_id),
    rootName: String(row.root_name),
    rootService: String(row.root_service),
    startedAt: asDate(row.started_at),
    durationMs: Number(row.duration_ms),
    spans: Number(row.spans),
    errors: Number(row.errors),
  }))
}

export const getTrace = async (traceId: string) =>
  await db
    .select()
    .from(spanTable)
    .where(eq(spanTable.traceId, traceId))
    .orderBy(asc(spanTable.startTime))

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
