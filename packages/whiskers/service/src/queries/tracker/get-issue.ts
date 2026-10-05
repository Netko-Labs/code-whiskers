import { eventTable, type HistogramPeriod, issueTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, count, desc, eq, isNotNull, min, sql } from 'drizzle-orm'
import { BREAKDOWN_LIMIT, DAY_MS, HISTOGRAM_HOURS, HOUR_MS, TREND_DAYS } from './constants'
import { ISSUE_ROW_COLUMNS, toIssueRows } from './issue-row'
import { getIssueTags } from './issue-tags'
import type { HistogramBucket, IssueDetail, NamedCount, ReleaseCount } from './types'
import { denseSeries, isUuid, trendStartOf } from './utils'

type Row = Record<string, unknown>

async function environmentsOf(issueId: string): Promise<NamedCount[]> {
  const rows = await db
    .select({ name: eventTable.environment, count: count() })
    .from(eventTable)
    .where(and(eq(eventTable.issueId, issueId), isNotNull(eventTable.environment)))
    .groupBy(eventTable.environment)
    .orderBy(desc(count()))
    .limit(BREAKDOWN_LIMIT)
  return rows.map((row) => ({ name: row.name ?? '', count: row.count }))
}

async function releasesOf(issueId: string): Promise<ReleaseCount[]> {
  const rows = await db
    .select({ name: eventTable.release, count: count(), firstSeen: min(eventTable.receivedAt) })
    .from(eventTable)
    .where(and(eq(eventTable.issueId, issueId), isNotNull(eventTable.release)))
    .groupBy(eventTable.release)
    .orderBy(desc(min(eventTable.receivedAt)))
    .limit(BREAKDOWN_LIMIT)
  return rows.map((row) => ({
    name: row.name ?? '',
    count: row.count,
    firstSeen: row.firstSeen ?? new Date(0),
  }))
}

/** Hourly over the last 24h, else daily over 14 days; buckets are dense, oldest first. */
async function histogramOf(
  issueId: string,
  period: HistogramPeriod,
  now: Date,
): Promise<HistogramBucket[]> {
  const isHourly = period === '24h'
  const step = isHourly ? HOUR_MS : DAY_MS
  const length = isHourly ? HISTOGRAM_HOURS : TREND_DAYS
  const start = isHourly
    ? new Date(Math.floor(now.getTime() / HOUR_MS) * HOUR_MS - (HISTOGRAM_HOURS - 1) * HOUR_MS)
    : trendStartOf(now)
  const from = start.toISOString()
  const bucket = isHourly
    ? sql`floor(extract(epoch from (received_at - ${from}::timestamp)) / 3600)::int`
    : sql`(date_trunc('day', received_at)::date - ${from}::date)`
  const rows = (await db.execute(sql`
    select ${bucket} as bucket, count(*)::int as n from event
    where issue_id = ${issueId} and received_at >= ${from}::timestamp
    group by 1`)) as Row[]
  const series = denseSeries(
    length,
    rows.map((row) => ({ bucket: Number(row.bucket), count: Number(row.n) })),
  )
  return series.map((value, index) => ({
    bucket: new Date(start.getTime() + index * step),
    count: value,
  }))
}

export const getIssue = async (
  issueId: string,
  period: HistogramPeriod,
): Promise<IssueDetail | null> => {
  if (!isUuid(issueId)) return null
  const [row] = await db
    .select(ISSUE_ROW_COLUMNS)
    .from(issueTable)
    .where(eq(issueTable.id, issueId))
    .limit(1)
  if (!row) return null

  const now = new Date()
  const [[issue], environments, releases, tags, histogram] = await Promise.all([
    toIssueRows([row], now),
    environmentsOf(issueId),
    releasesOf(issueId),
    getIssueTags(issueId),
    histogramOf(issueId, period, now),
  ])
  if (!issue) return null
  return { issue, environments, releases, tags, histogram }
}
