import { CursorSchema, type OverviewRange } from '@code-whiskers/whiskers-domain'
import {
  DAY_MS,
  NEW_ISSUE_WINDOW_MS,
  OVERVIEW_WINDOWS,
  REGRESSED_WINDOW_MS,
  SPIKE_BASELINE_HOURS,
  SPIKE_FACTOR,
  SPIKE_MIN_EVENTS,
  TREND_DAYS,
  UUID_PATTERN,
} from './constants'
import type { BadgeInput, Cursor, IssueBadge, OverviewWindow } from './types'

/** Opaque to clients: base64url of `[sortValue, id]`. */
export function encodeCursor(value: string | number, id: string): string {
  return Buffer.from(JSON.stringify([value, id])).toString('base64url')
}

export function decodeCursor(cursor: string): Cursor | null {
  try {
    const parsed = CursorSchema.safeParse(
      JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')),
    )
    return parsed.success ? { value: parsed.data[0], id: parsed.data[1] } : null
  } catch {
    return null
  }
}

/** Derived per read, never stored: each one is a window over time that would go stale. */
export function badgesOf(input: BadgeInput, now: Date): IssueBadge[] {
  const badges: IssueBadge[] = []
  const age = (date: Date) => now.getTime() - date.getTime()
  if (age(input.firstSeen) < NEW_ISSUE_WINDOW_MS) badges.push('new')
  if (
    input.status === 'unresolved' &&
    input.regressedAt &&
    age(input.regressedAt) < REGRESSED_WINDOW_MS
  ) {
    badges.push('regressed')
  }
  const hourlyBaseline = input.previousWeekEvents / SPIKE_BASELINE_HOURS
  if (input.lastHourEvents > Math.max(SPIKE_MIN_EVENTS, SPIKE_FACTOR * hourlyBaseline)) {
    badges.push('spiking')
  }
  return badges
}

export function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

/** Midnight UTC of the oldest of the trend's days; today is the last. */
export function trendStartOf(now: Date, days = TREND_DAYS): Date {
  return new Date(startOfUtcDay(now).getTime() - (days - 1) * DAY_MS)
}

/** The range's buckets end with the one holding `now`; the oldest starts `length - 1` steps back. */
export function overviewWindowOf(range: OverviewRange, now: Date): OverviewWindow {
  const { stepMs, length } = OVERVIEW_WINDOWS[range]
  const current = Math.floor(now.getTime() / stepMs) * stepMs
  return { start: new Date(current - (length - 1) * stepMs), stepMs, length }
}

/** Sparse `(bucket, count)` rows into a dense series; out-of-range buckets are dropped. */
export function denseSeries(length: number, rows: { bucket: number; count: number }[]): number[] {
  const series = new Array<number>(length).fill(0)
  for (const { bucket, count } of rows) {
    if (bucket >= 0 && bucket < length) series[bucket] = (series[bucket] ?? 0) + count
  }
  return series
}

/**
 * Ids that would make Postgres refuse the whole query are dropped. Asked for ids but none valid
 * is an empty list, not "no filter".
 */
export function uuidsOf(value: string | undefined): string[] | undefined {
  if (!value?.trim()) return undefined
  return value
    .split(',')
    .map((id) => id.trim())
    .filter((id) => UUID_PATTERN.test(id))
}

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value)
}
