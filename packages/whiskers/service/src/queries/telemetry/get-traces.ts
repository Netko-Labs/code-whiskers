import { db } from '@code-whiskers/whiskers-repository'
import { sql } from 'drizzle-orm'
import { asDate, inProjects } from '../insights/utils'
import { TRACE_PAGE, TRACE_WINDOW_MS } from './constants'
import type { TraceFilter, TraceSummary } from './types'
import { containsPattern, windowOf } from './utils'

/**
 * One row per trace in the window: its root operation, span count and wall time. The service
 * filter keeps whole traces that touched the service, not just its spans.
 */
export const getTraces = async (filter: TraceFilter): Promise<TraceSummary[]> => {
  const window = windowOf(filter.from, filter.to, TRACE_WINDOW_MS)
  const from = window.from.toISOString()
  const upper = filter.to ? sql`and start_time < ${window.to.toISOString()}::timestamp` : sql``
  const rows = (await db.execute(sql`
    with traces as (
      select trace_id,
             min(start_time) as started_at,
             extract(epoch from (max(start_time + duration_ms * interval '1 millisecond') - min(start_time))) * 1000 as duration_ms,
             count(*)::int as spans,
             count(*) filter (where status = 'error')::int as errors,
             (array_agg(name order by (parent_span_id is null) desc, start_time asc))[1] as root_name,
             (array_agg(service order by (parent_span_id is null) desc, start_time asc))[1] as root_service
      from span
      where start_time >= ${from}::timestamp ${upper}
        ${inProjects('project_id', filter.projectIds)}
        ${filter.service ? sql`and trace_id in (select trace_id from span where service = ${filter.service} and start_time >= ${from}::timestamp)` : sql``}
      group by trace_id
    )
    select * from traces
    where true
      ${filter.query ? sql`and (trace_id = ${filter.query} or root_name ilike ${containsPattern(filter.query)})` : sql``}
      ${filter.hasErrors ? sql`and errors > 0` : sql``}
      ${filter.minMs ? sql`and duration_ms >= ${filter.minMs}` : sql``}
    order by ${filter.sort === 'slowest' ? sql`duration_ms desc` : sql`started_at desc`}
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
