import { logLineTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, desc, lt, sql } from 'drizzle-orm'
import { bucketSql, logConditions } from './conditions'
import { LOG_PAGE, LOG_WINDOW_MS, VOLUME_WINDOW_MS } from './constants'
import type { LogFilter, LogPage, LogVolume, VolumeRow } from './types'
import { bucketPlan, fillVolume, windowOf } from './utils'

/** Newest first by arrival; `before` pages back by id. */
export const getLogs = async (page: LogPage) => {
  const window = windowOf(page.from, page.to, LOG_WINDOW_MS)
  const where = logConditions(page, window)
  if (page.before) where.push(lt(logLineTable.id, page.before))
  return await db
    .select()
    .from(logLineTable)
    .where(and(...where))
    .orderBy(desc(logLineTable.id))
    .limit(page.limit ?? LOG_PAGE)
}

/** Lines per bucket and level band over the window: the explorer's histogram. */
export const getLogVolume = async (filter: LogFilter, buckets: number): Promise<LogVolume> => {
  const plan = bucketPlan(windowOf(filter.from, filter.to, VOLUME_WINDOW_MS), buckets)
  const rows = (await db
    .select({
      bucket: bucketSql(sql`${logLineTable.timestamp}`, plan.from, plan.stepMs),
      level: logLineTable.level,
      count: sql<number>`count(*)::int`,
    })
    .from(logLineTable)
    .where(and(...logConditions({ ...filter, to: plan.to }, plan)))
    .groupBy(sql`1`, sql`2`)) as VolumeRow[]
  return { from: plan.from, to: plan.to, stepMs: plan.stepMs, buckets: fillVolume(rows, plan) }
}
