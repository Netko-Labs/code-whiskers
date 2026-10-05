import type { Tone } from '@/components/shared/status'
import type { WhiskersServicePoint, WhiskersServiceStats } from '@/integrations/whiskers'
import type { ServiceSeries } from './types'
import { ERROR_RATE_ALARM } from './values'

/** A bucket without requests has no latency; it carries the last known value so lines don't dive. */
function carried(
  points: WhiskersServicePoint[],
  read: (point: WhiskersServicePoint) => number | null,
) {
  let last = 0
  return points.map((point) => {
    const value = read(point)
    if (value !== null) last = value
    return last
  })
}

export function seriesOf(stats: WhiskersServiceStats): ServiceSeries {
  return {
    requests: stats.points.map((point) => point.requests),
    errors: stats.points.map((point) => point.errors),
    p50: carried(stats.points, (point) => point.p50Ms),
    p95: carried(stats.points, (point) => point.p95Ms),
  }
}

export function errorRate(stats: Pick<WhiskersServiceStats, 'requests' | 'errors'>): number {
  return stats.requests ? stats.errors / stats.requests : 0
}

export function perMinute(count: number, windowMs: number): number {
  return windowMs > 0 ? count / (windowMs / 60_000) : 0
}

export function formatRate(value: number): string {
  if (value === 0) return '0'
  if (value < 0.1) return '<0.1'
  return value < 10 ? value.toFixed(1) : Math.round(value).toLocaleString()
}

export function formatPercent(share: number): string {
  if (share === 0) return '0%'
  if (share < 0.001) return '<0.1%'
  return `${(share * 100).toFixed(share < 0.1 ? 1 : 0)}%`
}

/** Red past the alarm line, amber for any failure, otherwise no color at all. */
export function healthTone(stats: WhiskersServiceStats): Tone {
  const rate = errorRate(stats)
  if (rate >= ERROR_RATE_ALARM) return 'error'
  if (stats.errors > 0 || stats.logErrors > 0) return 'warning'
  return 'neutral'
}
