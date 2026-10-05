import { MIN_STEP_MS } from './constants'
import type {
  BucketPlan,
  LevelBand,
  ServiceLogRow,
  ServicePoint,
  ServicePointRow,
  ServiceStats,
  ServiceTotalRow,
  TelemetryLevel,
  TimeWindow,
  VolumeBucket,
  VolumeRow,
} from './types'

/** An open end falls back to `fallbackMs` before the other; a reversed pair is swapped. */
export function windowOf(
  from: Date | undefined,
  to: Date | undefined,
  fallbackMs: number,
  now = new Date(),
): TimeWindow {
  const end = to ?? now
  const start = from ?? new Date(end.getTime() - fallbackMs)
  return start <= end ? { from: start, to: end } : { from: end, to: start }
}

export function bucketPlan(window: TimeWindow, count: number): BucketPlan {
  const span = window.to.getTime() - window.from.getTime()
  return { ...window, count, stepMs: Math.max(MIN_STEP_MS, Math.ceil(span / count)) }
}

export function levelBand(level: string): LevelBand {
  const upper = level.toUpperCase()
  if (upper === 'ERROR' || upper === 'FATAL') return 'error'
  if (upper === 'WARN') return 'warn'
  if (upper === 'DEBUG' || upper === 'TRACE') return 'debug'
  return 'info'
}

export function storedLevels(levels: TelemetryLevel[]): string[] {
  return levels.map((level) => level.toUpperCase())
}

/** `%` and `_` are ILIKE wildcards; a search for them means the characters. */
export function containsPattern(text: string): string {
  return `%${text.replace(/[\\%_]/g, '\\$&')}%`
}

function startOf(plan: BucketPlan, index: number): Date {
  return new Date(plan.from.getTime() + index * plan.stepMs)
}

function inPlan(plan: BucketPlan, index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < plan.count
}

/** Every bucket present, empty ones as zeros, so the chart's x axis is the range itself. */
export function fillVolume(rows: VolumeRow[], plan: BucketPlan): VolumeBucket[] {
  const buckets = Array.from({ length: plan.count }, (_, index) => ({
    start: startOf(plan, index),
    error: 0,
    warn: 0,
    info: 0,
    debug: 0,
  }))
  for (const row of rows) {
    const bucket = buckets[row.bucket]
    if (bucket && inPlan(plan, row.bucket)) bucket[levelBand(row.level)] += row.count
  }
  return buckets
}

function fillPoints(rows: ServicePointRow[], plan: BucketPlan): ServicePoint[] {
  const points: ServicePoint[] = Array.from({ length: plan.count }, (_, index) => ({
    start: startOf(plan, index),
    requests: 0,
    errors: 0,
    p50Ms: null,
    p95Ms: null,
  }))
  for (const row of rows) {
    if (!inPlan(plan, row.bucket)) continue
    points[row.bucket] = { ...row, start: startOf(plan, row.bucket) }
  }
  return points
}

function latest(a: Date | null, b: Date | null): Date | null {
  if (!a) return b
  if (!b) return a
  return a > b ? a : b
}

/**
 * Spans give requests, errors and latency; logs give volume. A service that only logs still
 * gets a card, with no request series.
 */
export function mergeServiceStats(
  totals: ServiceTotalRow[],
  points: ServicePointRow[],
  logs: ServiceLogRow[],
  plan: BucketPlan,
): ServiceStats[] {
  const names = new Set([...totals.map((row) => row.service), ...logs.map((row) => row.service)])
  return [...names]
    .map((service) => {
      const total = totals.find((row) => row.service === service)
      const log = logs.find((row) => row.service === service)
      return {
        service,
        requests: total?.requests ?? 0,
        errors: total?.errors ?? 0,
        p50Ms: total?.p50Ms ?? null,
        p95Ms: total?.p95Ms ?? null,
        logs: log?.logs ?? 0,
        logErrors: log?.logErrors ?? 0,
        lastSeen: latest(total?.lastSeen ?? null, log?.lastSeen ?? null),
        points: fillPoints(
          points.filter((row) => row.service === service),
          plan,
        ),
      }
    })
    .sort(
      (a, b) => b.requests + b.logs - (a.requests + a.logs) || a.service.localeCompare(b.service),
    )
}

export function numberOrNull(value: unknown): number | null {
  return value === null || value === undefined ? null : Number(value)
}
