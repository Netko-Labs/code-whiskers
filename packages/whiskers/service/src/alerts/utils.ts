import { ALERT_LEVEL_ALIASES, ALERT_LEVELS } from '@code-whiskers/whiskers-domain'
import { ALERT_LOOKBACK_MS, ALERT_OVERLAP_MS, DAY_MS } from './constants'
import type { AlertLevel, AlertRule, RateBucket } from './types'

/** Every stored spelling at or above `min`, for an `IN (…)` filter; null means no floor. */
export function levelsAtLeast(min: AlertLevel | null): string[] | null {
  if (!min) return null
  const levels: string[] = ALERT_LEVELS.slice(ALERT_LEVELS.indexOf(min))
  const aliases = Object.entries(ALERT_LEVEL_ALIASES)
    .filter(([, canonical]) => levels.includes(canonical))
    .map(([alias]) => alias)
  return [...levels, ...aliases]
}

/** Event triggers resume where the last pass stopped, a little early, never too far back. */
export function cursorFor(rule: Pick<AlertRule, 'lastEvaluatedAt'>, now: Date): Date {
  const floor = now.getTime() - ALERT_LOOKBACK_MS
  const last = rule.lastEvaluatedAt ? new Date(rule.lastEvaluatedAt).getTime() : floor
  return new Date(Math.max(floor, last - ALERT_OVERLAP_MS))
}

/** Replays the per-subject action interval over windows that held, oldest first. */
export function throttledFirings(buckets: RateBucket[], intervalMinutes: number): Date[] {
  const lastByKey = new Map<string, number>()
  const fired: Date[] = []
  for (const bucket of [...buckets].sort((a, b) => a.at.getTime() - b.at.getTime())) {
    const last = lastByKey.get(bucket.key)
    const at = bucket.at.getTime()
    if (last !== undefined && at - last < intervalMinutes * 60_000) continue
    lastByKey.set(bucket.key, at)
    fired.push(bucket.at)
  }
  return fired
}

/** Counts per day, oldest day first, the last entry ending at `now`. */
export function dayCounts(dates: Date[], now: Date, days: number): number[] {
  const counts = new Array<number>(days).fill(0)
  for (const date of dates) {
    const age = Math.floor((now.getTime() - date.getTime()) / DAY_MS)
    if (age >= 0 && age < days) counts[days - 1 - age] = (counts[days - 1 - age] ?? 0) + 1
  }
  return counts
}

export function plural(count: number, noun: string): string {
  return `${count.toLocaleString('en-US')} ${noun}${count === 1 ? '' : 's'}`
}
