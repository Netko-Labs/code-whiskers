import { describe, expect, test } from 'bun:test'
import type { WhiskersTrace } from '@/integrations/whiskers'
import { durationBar, durationScale, p95Of, parseTraceSearch } from './utils'

const trace = (durationMs: number): WhiskersTrace => ({
  traceId: `t${durationMs}`,
  rootName: 'GET /',
  rootService: 'api',
  startedAt: new Date(0),
  durationMs,
  spans: 1,
  errors: 0,
})

describe('parseTraceSearch', () => {
  test('legacy tabs map to filters; junk is dropped', () => {
    expect(parseTraceSearch({ tab: 1 })).toEqual({ errors: true })
    expect(parseTraceSearch({ tab: 2, minMs: 'abc' })).toEqual({ sort: 'slowest' })
    expect(parseTraceSearch({ q: ' checkout ', minMs: 500, range: '6h' })).toEqual({
      q: 'checkout',
      minMs: 500,
      range: '6h',
    })
  })
})

describe('durations', () => {
  const traces = Array.from({ length: 20 }, (_, index) => trace((index + 1) * 10))

  test('p95 is the nearest-rank value', () => {
    expect(p95Of(traces)).toBe(190)
    expect(p95Of([])).toBe(0)
  })

  test('the scale stops at twice p95 so one outlier cannot flatten the rest', () => {
    expect(durationScale([...traces, trace(10_000)], 190)).toBe(380)
    expect(durationScale(traces, 190)).toBe(200)
  })

  test('bars mark anything past p95 as slow and clamp to the track', () => {
    expect(durationBar(400, 380, 190)).toEqual({ percent: 100, p95Percent: 50, isSlow: true })
    expect(durationBar(1, 380, 190).percent).toBe(2)
    expect(durationBar(100, 380, 190).isSlow).toBe(false)
  })
})
