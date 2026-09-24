import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { db } from '@code-whiskers/whiskers-repository'
import { sql } from 'drizzle-orm'
import { EXACT_COUNT_LIMIT, STORES } from './constants'
import type { InstanceStats, StoreStats } from './types'
import { asDate } from './utils'

type Row = Record<string, unknown>

function num(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value)
}

function first(result: unknown): Row {
  return ((result as Row[])[0] ?? {}) as Row
}

async function storeStats(table: string, oldestColumn: string): Promise<StoreStats> {
  const name = sql.identifier(table)
  const column = sql.identifier(oldestColumn)
  const meta = first(
    await db.execute(sql`
      select pg_total_relation_size(${table}::regclass) as bytes,
             greatest(reltuples, 0)::bigint as estimate
      from pg_class where oid = ${table}::regclass`),
  )
  const isEstimate = num(meta.estimate) > EXACT_COUNT_LIMIT
  const counted = first(
    await db.execute(
      isEstimate
        ? sql`select min(${column}) as oldest from ${name}`
        : sql`select count(*)::bigint as rows, min(${column}) as oldest from ${name}`,
    ),
  )
  return {
    table,
    bytes: num(meta.bytes),
    rows: isEstimate ? num(meta.estimate) : num(counted.rows),
    isEstimate,
    oldest: counted.oldest ? asDate(counted.oldest) : null,
  }
}

/** What this worker is holding and whether it keeps up — for an operator, not a bill. */
export const getInstanceStats = async (): Promise<InstanceStats> => {
  const [size, reviews, events, ...stores] = await Promise.all([
    db.execute(sql`select pg_database_size(current_database()) as bytes`),
    db.execute(sql`
      select
        count(*) filter (where created_at > now() - interval '24 hours') as reviews_24h,
        count(*) filter (where created_at > now() - interval '7 days') as reviews_7d,
        count(*) filter (where status = 'failed' and created_at > now() - interval '7 days') as failed_7d,
        count(*) filter (where status in ('pending', 'running')) as in_flight,
        percentile_cont(0.5) within group (order by extract(epoch from completed_at - created_at))
          filter (where status = 'completed' and created_at > now() - interval '7 days') as median_seconds
      from review`),
    db.execute(sql`
      select
        count(*) filter (where received_at > now() - interval '24 hours') as events_24h,
        count(*) filter (where received_at > now() - interval '7 days') as events_7d
      from event where received_at > now() - interval '7 days'`),
    ...STORES.map((store) => storeStats(store.table, store.oldest)),
  ])
  const review = first(reviews)
  const event = first(events)
  return {
    telemetryRetentionDays: whiskersEnvConfig.telemetry.retentionDays,
    databaseBytes: num(first(size).bytes),
    stores,
    activity: {
      reviews24h: num(review.reviews_24h),
      reviews7d: num(review.reviews_7d),
      failed7d: num(review.failed_7d),
      inFlight: num(review.in_flight),
      medianReviewSeconds: review.median_seconds === null ? null : num(review.median_seconds),
      events24h: num(event.events_24h),
      events7d: num(event.events_7d),
    },
  }
}
