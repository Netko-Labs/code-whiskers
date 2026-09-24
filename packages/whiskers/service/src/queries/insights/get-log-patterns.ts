import { createHash } from 'node:crypto'
import { logLineTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, desc, gt, inArray } from 'drizzle-orm'
import {
  LOG_PATTERN_LIMIT,
  LOG_PATTERN_SAMPLES,
  LOG_PATTERN_SCAN_LIMIT,
  LOG_PATTERN_WINDOW_HOURS,
} from './constants'
import type { LogPattern } from './types'
import { logPattern } from './utils'

const HOUR_MS = 3_600_000

/**
 * Error and fatal lines from the last day, grouped by service and message shape — the log side
 * of the triage inbox. Grouped in memory over the newest few thousand lines; a flood is sampled.
 */
export const getLogPatterns = async (
  projectIds?: string[],
  now = new Date(),
): Promise<LogPattern[]> => {
  const lines = await db
    .select({
      projectId: logLineTable.projectId,
      service: logLineTable.service,
      level: logLineTable.level,
      message: logLineTable.message,
      timestamp: logLineTable.timestamp,
    })
    .from(logLineTable)
    .where(
      and(
        inArray(logLineTable.level, ['ERROR', 'FATAL']),
        projectIds ? inArray(logLineTable.projectId, projectIds) : undefined,
        gt(logLineTable.timestamp, new Date(now.getTime() - LOG_PATTERN_WINDOW_HOURS * HOUR_MS)),
      ),
    )
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
    const hoursAgo = Math.floor((now.getTime() - line.timestamp.getTime()) / HOUR_MS)
    const bucket = LOG_PATTERN_WINDOW_HOURS - 1 - hoursAgo
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
