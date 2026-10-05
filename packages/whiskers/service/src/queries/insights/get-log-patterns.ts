import { createHash } from 'node:crypto'
import { logLineTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, desc } from 'drizzle-orm'
import { logConditions } from '../telemetry/conditions'
import type { LogFilter } from '../telemetry/types'
import { windowOf } from '../telemetry/utils'
import {
  LOG_PATTERN_LIMIT,
  LOG_PATTERN_SAMPLES,
  LOG_PATTERN_SCAN_LIMIT,
  LOG_PATTERN_WINDOW_HOURS,
} from './constants'
import type { LogPattern } from './types'
import { logPattern } from './utils'

const HOUR_MS = 3_600_000
const DEFAULT_LEVELS: LogFilter['levels'] = ['error', 'fatal']

/**
 * Lines grouped by service and message shape — error and fatal over the last day unless the
 * filter says otherwise. Grouped in memory over the newest few thousand lines; a flood is
 * sampled. `hourly` is 24 equal buckets across the window: hours for the default day.
 */
export const getLogPatterns = async (
  filter: LogFilter = {},
  now = new Date(),
): Promise<LogPattern[]> => {
  const window = windowOf(filter.from, filter.to, LOG_PATTERN_WINDOW_HOURS * HOUR_MS, now)
  const bucketMs = Math.max(
    1,
    (window.to.getTime() - window.from.getTime()) / LOG_PATTERN_WINDOW_HOURS,
  )
  const levels = filter.levels?.length ? filter.levels : DEFAULT_LEVELS
  const lines = await db
    .select({
      projectId: logLineTable.projectId,
      service: logLineTable.service,
      level: logLineTable.level,
      message: logLineTable.message,
      timestamp: logLineTable.timestamp,
    })
    .from(logLineTable)
    .where(and(...logConditions({ ...filter, levels }, window)))
    .orderBy(desc(logLineTable.timestamp))
    .limit(LOG_PATTERN_SCAN_LIMIT)

  const groups = new Map<string, LogPattern>()
  for (const line of lines) {
    const pattern = logPattern(line.message)
    const key = `${line.projectId}\u0000${line.service}\u0000${pattern}`
    const group = groups.get(key) ?? {
      hash: createHash('sha1').update(key).digest('hex').slice(0, 12),
      projectId: line.projectId,
      service: line.service,
      pattern,
      count: 0,
      firstSeen: line.timestamp,
      lastSeen: line.timestamp,
      hourly: Array.from({ length: LOG_PATTERN_WINDOW_HOURS }, () => 0),
      samples: [],
    }
    group.count += 1
    if (line.timestamp < group.firstSeen) group.firstSeen = line.timestamp
    if (line.timestamp > group.lastSeen) group.lastSeen = line.timestamp
    const bucketsAgo = Math.floor((window.to.getTime() - line.timestamp.getTime()) / bucketMs)
    const bucket = LOG_PATTERN_WINDOW_HOURS - 1 - bucketsAgo
    if (bucket >= 0 && bucket < LOG_PATTERN_WINDOW_HOURS)
      group.hourly[bucket] = (group.hourly[bucket] ?? 0) + 1
    if (group.samples.length < LOG_PATTERN_SAMPLES) {
      group.samples.push({ timestamp: line.timestamp, level: line.level, message: line.message })
    }
    groups.set(key, group)
  }

  return [...groups.values()]
    .sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime())
    .slice(0, LOG_PATTERN_LIMIT)
}
