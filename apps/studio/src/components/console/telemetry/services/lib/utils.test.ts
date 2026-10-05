import { describe, expect, test } from 'bun:test'
import type { WhiskersServiceStats } from '@/integrations/whiskers'
import { errorRate, formatPercent, formatRate, healthTone, perMinute, seriesOf } from './utils'

const point = (requests: number, p95Ms: number | null) => ({
  start: new Date(0),
  requests,
  errors: 0,
  p50Ms: p95Ms === null ? null : p95Ms / 2,
  p95Ms,
})

const stats = (patch: Partial<WhiskersServiceStats>): WhiskersServiceStats => ({
  service: 'api',
  requests: 100,
  errors: 0,
  p50Ms: 10,
  p95Ms: 40,
  logs: 0,
  logErrors: 0,
  lastSeen: null,
  points: [],
  ...patch,
})

describe('service series', () => {
  test('latency carries over empty buckets instead of dropping to zero', () => {
    const series = seriesOf(stats({ points: [point(2, 40), point(0, null), point(3, 80)] }))
    expect(series.requests).toEqual([2, 0, 3])
    expect(series.p95).toEqual([40, 40, 80])
    expect(series.p50).toEqual([20, 20, 40])
  })
})

describe('rates', () => {
  test('error rate and per-minute rate', () => {
    expect(errorRate({ requests: 200, errors: 5 })).toBe(0.025)
    expect(errorRate({ requests: 0, errors: 0 })).toBe(0)
    expect(perMinute(120, 60 * 60_000)).toBe(2)
  })

  test('formatting stays honest at the small end', () => {
    expect(formatRate(0)).toBe('0')
    expect(formatRate(0.04)).toBe('<0.1')
    expect(formatRate(2.345)).toBe('2.3')
    expect(formatPercent(0.0004)).toBe('<0.1%')
    expect(formatPercent(0.025)).toBe('2.5%')
    expect(formatPercent(0.5)).toBe('50%')
  })

  test('tone: red past 5%, amber for any failure, else none', () => {
    expect(healthTone(stats({ errors: 10 }))).toBe('error')
    expect(healthTone(stats({ errors: 1 }))).toBe('warning')
    expect(healthTone(stats({ logErrors: 1 }))).toBe('warning')
    expect(healthTone(stats({}))).toBe('neutral')
  })
})
