import { describe, expect, test } from 'bun:test'
import { LogQuerySchema, TraceQuerySchema } from '@code-whiskers/whiskers-domain'
import {
  bucketPlan,
  containsPattern,
  fillVolume,
  levelBand,
  mergeServiceStats,
  windowOf,
} from '../src/queries/telemetry/utils'

const NOW = new Date('2026-10-05T12:00:00.000Z')
const HOUR = 3_600_000

describe('windowOf', () => {
  test('an open start falls back before the end; an open end is now', () => {
    expect(windowOf(undefined, undefined, HOUR, NOW)).toEqual({
      from: new Date(NOW.getTime() - HOUR),
      to: NOW,
    })
  })

  test('a reversed pair is swapped rather than empty', () => {
    const from = new Date(NOW.getTime() + HOUR)
    expect(windowOf(from, NOW, HOUR, NOW)).toEqual({ from: NOW, to: from })
  })
})

describe('bucketPlan and fillVolume', () => {
  const plan = bucketPlan({ from: new Date(NOW.getTime() - HOUR), to: NOW }, 4)

  test('the window splits into equal steps of at least a second', () => {
    expect(plan.stepMs).toBe(15 * 60_000)
    expect(bucketPlan({ from: NOW, to: NOW }, 10).stepMs).toBe(1_000)
  })

  test('every bucket is present; levels fold into four bands; strays are dropped', () => {
    const buckets = fillVolume(
      [
        { bucket: 0, level: 'ERROR', count: 2 },
        { bucket: 0, level: 'FATAL', count: 1 },
        { bucket: 2, level: 'WARN', count: 5 },
        { bucket: 3, level: 'TRACE', count: 1 },
        { bucket: 3, level: 'NOTICE', count: 4 },
        { bucket: 9, level: 'INFO', count: 99 },
      ],
      plan,
    )
    expect(buckets).toHaveLength(4)
    expect(buckets[0]).toMatchObject({ error: 3, warn: 0, info: 0, debug: 0 })
    expect(buckets[1]).toMatchObject({ error: 0, warn: 0, info: 0, debug: 0 })
    expect(buckets[2]?.warn).toBe(5)
    expect(buckets[3]).toMatchObject({ debug: 1, info: 4 })
    expect(buckets[1]?.start).toEqual(new Date(plan.from.getTime() + plan.stepMs))
  })
})

describe('mergeServiceStats', () => {
  test('a service that only logs still gets a row; busiest first; empty buckets are zero', () => {
    const plan = bucketPlan({ from: new Date(NOW.getTime() - HOUR), to: NOW }, 2)
    const stats = mergeServiceStats(
      [{ service: 'api', requests: 10, errors: 1, p50Ms: 12, p95Ms: 80, lastSeen: NOW }],
      [{ service: 'api', bucket: 1, requests: 10, errors: 1, p50Ms: 12, p95Ms: 80 }],
      [
        { service: 'api', logs: 3, logErrors: 0, lastSeen: new Date(0) },
        { service: 'worker', logs: 40, logErrors: 2, lastSeen: NOW },
      ],
      plan,
    )
    expect(stats.map((row) => row.service)).toEqual(['worker', 'api'])
    const api = stats[1]
    expect(api).toMatchObject({ requests: 10, logs: 3, lastSeen: NOW })
    expect(api?.points[0]).toMatchObject({ requests: 0, p95Ms: null })
    expect(api?.points[1]).toMatchObject({ requests: 10, p95Ms: 80 })
    expect(stats[0]).toMatchObject({ requests: 0, p50Ms: null, logErrors: 2 })
  })
})

describe('small helpers', () => {
  test('levels fold into bands', () => {
    expect(levelBand('fatal')).toBe('error')
    expect(levelBand('WARN')).toBe('warn')
    expect(levelBand('DEBUG')).toBe('debug')
    expect(levelBand('anything')).toBe('info')
  })

  test('ILIKE wildcards in a search are literal', () => {
    expect(containsPattern('100%_done\\')).toBe('%100\\%\\_done\\\\%')
  })
})

describe('query schemas', () => {
  test('levels, attrs and epoch bounds parse from a query string', () => {
    const parsed = LogQuerySchema.parse({
      levels: 'error, WARN',
      attrs: '{"http.status_code":"500"}',
      from: '1790000000000',
    })
    expect(parsed.levels).toEqual(['error', 'warn'])
    expect(parsed.attrs).toEqual({ 'http.status_code': '500' })
    expect(parsed.from).toEqual(new Date(1_790_000_000_000))
  })

  test('malformed attrs and unknown levels are refused', () => {
    expect(LogQuerySchema.safeParse({ attrs: '{nope' }).success).toBe(false)
    expect(LogQuerySchema.safeParse({ levels: 'loud' }).success).toBe(false)
  })

  test('traces sort by recency unless asked', () => {
    expect(TraceQuerySchema.parse({}).sort).toBe('recent')
  })
})
