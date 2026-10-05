import { eventTable, issueTable, reviewTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, count, eq, gt, gte, isNotNull, type SQL, sql } from 'drizzle-orm'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import { DAY_MS, PREVIEW_DAYS, PREVIEW_ROW_CAP } from './constants'
import { eventFilters, issueFilters, reviewFilters } from './scope'
import type { AlertCondition, AlertPreviewResult, AlertTrigger, RateBucket } from './types'
import { dayCounts, throttledFirings } from './utils'

async function datesOf(
  column: AnyPgColumn,
  table: typeof issueTable | typeof reviewTable,
  where: SQL[],
) {
  const rows = await db
    .select({ at: sql<Date>`${column}` })
    .from(table)
    .where(and(...where))
    .limit(PREVIEW_ROW_CAP)
  return rows.map((row) => new Date(row.at))
}

/** Tumbling windows stand in for the sliding one the loop uses: close enough to plan with. */
async function rateBuckets(condition: AlertCondition, key: AnyPgColumn, since: Date) {
  // Inlined, not bound: GROUP BY must repeat the select expression exactly, placeholders included.
  const seconds = sql.raw(String(Math.trunc(condition.windowMinutes) * 60))
  const bucket = sql<Date>`to_timestamp(floor(extract(epoch from ${eventTable.receivedAt}) / ${seconds}) * ${seconds})`
  const events = count()
  const rows = await db
    .select({ key: sql<string>`${key}`, at: bucket })
    .from(eventTable)
    .where(and(gt(eventTable.receivedAt, since), ...eventFilters(condition)))
    .groupBy(key, bucket)
    .having(gte(events, condition.threshold))
    .limit(PREVIEW_ROW_CAP)
  return rows.map((row): RateBucket => ({ key: String(row.key), at: new Date(row.at) }))
}

async function firingsFor(trigger: AlertTrigger, condition: AlertCondition, since: Date) {
  switch (trigger) {
    case 'new_issue':
      return datesOf(issueTable.firstSeen, issueTable, [
        gt(issueTable.firstSeen, since),
        ...issueFilters(condition),
      ])
    case 'issue_regressed':
      return datesOf(issueTable.regressedAt, issueTable, [
        isNotNull(issueTable.regressedAt),
        gt(issueTable.regressedAt, since),
        ...issueFilters(condition),
      ])
    case 'issue_frequency':
    case 'error_rate': {
      const key = trigger === 'issue_frequency' ? eventTable.issueId : eventTable.projectId
      const buckets = await rateBuckets(condition, key, since)
      return throttledFirings(buckets, condition.actionIntervalMinutes)
    }
    case 'review_failed':
    case 'blocking_review':
      return datesOf(reviewTable.completedAt, reviewTable, [
        gt(reviewTable.completedAt, since),
        trigger === 'review_failed'
          ? eq(reviewTable.status, 'failed')
          : eq(reviewTable.verdict, 'request_changes'),
        ...reviewFilters(condition),
      ])
  }
}

/** How often a condition would have fired over the last week, per day, oldest first. */
export async function previewCondition(
  condition: AlertCondition,
  now = new Date(),
): Promise<AlertPreviewResult> {
  const since = new Date(now.getTime() - PREVIEW_DAYS * DAY_MS)
  const results = await Promise.all(
    condition.triggers.map((trigger) => firingsFor(trigger, condition, since)),
  )
  const dates = results.flat()
  return {
    count: dates.length,
    days: dayCounts(dates, now, PREVIEW_DAYS),
    isCapped: results.some((result) => result.length >= PREVIEW_ROW_CAP),
  }
}
