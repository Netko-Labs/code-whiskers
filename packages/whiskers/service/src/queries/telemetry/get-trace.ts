import { spanTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { asc, eq, sql } from 'drizzle-orm'
import { asDate, inProjects } from '../insights/utils'
import { TRACE_CONTEXT_ERRORS, TRACE_CONTEXT_SLACK_MS } from './constants'
import type { TraceContext } from './types'

export const getTrace = async (traceId: string) =>
  await db
    .select()
    .from(spanTable)
    .where(eq(spanTable.traceId, traceId))
    .orderBy(asc(spanTable.startTime))

/**
 * What else the trace left behind: log lines carrying its id, and error events whose SDK put it
 * in `contexts.trace`. Both are searched only around the trace's own time span.
 */
export const getTraceContext = async (traceId: string): Promise<TraceContext> => {
  const [bounds] = (await db.execute(sql`
    select min(start_time) as started_at,
           max(start_time + duration_ms * interval '1 millisecond') as ended_at,
           array_agg(distinct project_id) as project_ids
    from span where trace_id = ${traceId}`)) as Record<string, unknown>[]
  if (!bounds?.started_at) return { logs: 0, errors: [] }

  const from = new Date(asDate(bounds.started_at).getTime() - TRACE_CONTEXT_SLACK_MS).toISOString()
  const to = new Date(asDate(bounds.ended_at).getTime() + TRACE_CONTEXT_SLACK_MS).toISOString()
  const projectIds = (bounds.project_ids as string[] | null) ?? []

  const [logRows, errorRows] = await Promise.all([
    db.execute(sql`
      select count(*)::int as logs from log_line
      where trace_id = ${traceId}
        and timestamp between ${from}::timestamp and ${to}::timestamp`),
    db.execute(sql`
      select e.id, e.issue_id, e.level, e.received_at, i.title
      from event e join issue i on i.id = e.issue_id
      where e.received_at between ${from}::timestamp and ${to}::timestamp
        ${inProjects('e.project_id', projectIds)}
        and e.payload -> 'contexts' -> 'trace' ->> 'trace_id' = ${traceId}
      order by e.received_at asc
      limit ${TRACE_CONTEXT_ERRORS}`),
  ])
  const [count] = logRows as Record<string, unknown>[]
  return {
    logs: Number(count?.logs ?? 0),
    errors: (errorRows as Record<string, unknown>[]).map((row) => ({
      eventId: String(row.id),
      issueId: String(row.issue_id),
      title: String(row.title),
      level: String(row.level),
      receivedAt: asDate(row.received_at),
    })),
  }
}
