import { db } from '@code-whiskers/whiskers-repository'
import { sql } from 'drizzle-orm'
import { HOUR_MS, SPIKE_BASELINE_HOURS, TREND_DAYS } from './constants'
import type { IssueStats } from './types'
import { denseSeries, trendStartOf } from './utils'

type Row = Record<string, unknown>

/**
 * Trend and spike inputs for a page of issues in one grouped scan, bounded by the page's ids. Times
 * go in as ISO strings: `timestamp` columns hold UTC, and a raw Date param would bind local time.
 */
export const getIssueStats = async (
  issueIds: string[],
  now: Date,
): Promise<Map<string, IssueStats>> => {
  if (issueIds.length === 0) return new Map()
  const trendStart = trendStartOf(now).toISOString()
  const hourAgo = new Date(now.getTime() - HOUR_MS)
  const weekAgo = new Date(hourAgo.getTime() - SPIKE_BASELINE_HOURS * HOUR_MS)
  const from = trendStart < weekAgo.toISOString() ? trendStart : weekAgo.toISOString()

  const rows = (await db.execute(sql`
    select issue_id,
      (date_trunc('day', received_at)::date - ${trendStart}::date) as bucket,
      count(*)::int as events,
      (count(*) filter (where received_at >= ${hourAgo.toISOString()}::timestamp))::int as last_hour,
      (count(*) filter (
        where received_at >= ${weekAgo.toISOString()}::timestamp
          and received_at < ${hourAgo.toISOString()}::timestamp
      ))::int as previous_week
    from event
    where issue_id in (${sql.join(
      issueIds.map((id) => sql`${id}`),
      sql`, `,
    )})
      and received_at >= ${from}::timestamp
    group by issue_id, bucket`)) as Row[]

  const grouped = new Map<string, Row[]>()
  for (const row of rows) {
    const id = String(row.issue_id)
    grouped.set(id, [...(grouped.get(id) ?? []), row])
  }
  return new Map(
    issueIds.map((id) => {
      const issueRows = grouped.get(id) ?? []
      const sum = (key: string) => issueRows.reduce((total, row) => total + Number(row[key]), 0)
      const trend = denseSeries(
        TREND_DAYS,
        issueRows.map((row) => ({ bucket: Number(row.bucket), count: Number(row.events) })),
      )
      return [
        id,
        { trend, lastHourEvents: sum('last_hour'), previousWeekEvents: sum('previous_week') },
      ]
    }),
  )
}
