import { logLineTable } from '@code-whiskers/whiskers-domain'
import { eq, gte, ilike, inArray, lt, type SQL, sql } from 'drizzle-orm'
import type { LogFilter, TimeWindow } from './types'
import { containsPattern, storedLevels } from './utils'

/** The explorer's filter as WHERE terms; the upper bound only applies when the caller set one. */
export function logConditions(filter: LogFilter, window: TimeWindow): SQL[] {
  const where: SQL[] = [gte(logLineTable.timestamp, window.from)]
  if (filter.to) where.push(lt(logLineTable.timestamp, window.to))
  if (filter.projectIds) where.push(inArray(logLineTable.projectId, filter.projectIds))
  if (filter.service) where.push(eq(logLineTable.service, filter.service))
  if (filter.levels?.length) where.push(inArray(logLineTable.level, storedLevels(filter.levels)))
  if (filter.query) where.push(ilike(logLineTable.message, containsPattern(filter.query)))
  if (filter.traceId) where.push(eq(logLineTable.traceId, filter.traceId))
  for (const [key, value] of Object.entries(filter.attrs ?? {})) {
    where.push(sql`${logLineTable.attributes} ->> ${key} = ${value}`)
  }
  return where
}

/** Bucket index of `column` in a plan starting at `from`, for raw SQL. */
export function bucketSql(column: SQL | string, from: Date, stepMs: number): SQL {
  const target = typeof column === 'string' ? sql.raw(column) : column
  return sql`floor(extract(epoch from (${target} - ${from.toISOString()}::timestamp)) * 1000 / ${stepMs})::int`
}
