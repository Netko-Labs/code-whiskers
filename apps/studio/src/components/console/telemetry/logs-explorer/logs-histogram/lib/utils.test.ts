import { describe, expect, test } from 'bun:test'
import type { WhiskersLogVolume } from '@/integrations/whiskers'
import { bandTotals, brushWindow, bucketAt, histogramColumns } from './utils'
import { CHART_HEIGHT } from './values'

const bucket = (
  start: number,
  counts: Partial<Record<'error' | 'warn' | 'info' | 'debug', number>>,
) => ({
  start: new Date(start),
  error: 0,
  warn: 0,
  info: 0,
  debug: 0,
  ...counts,
})

const volume: WhiskersLogVolume = {
  from: new Date(0),
  to: new Date(3_000),
  stepMs: 1_000,
  buckets: [bucket(0, { error: 1, info: 3 }), bucket(1_000, {}), bucket(2_000, { warn: 2 })],
}

describe('histogramColumns', () => {
  test('the busiest bucket fills the height; errors stack from the axis up', () => {
    const [first, empty, last] = histogramColumns(volume.buckets)
    expect(first?.segments.map((segment) => segment.band)).toEqual(['error', 'info'])
    expect(first?.segments[0]).toEqual({
      band: 'error',
      y: CHART_HEIGHT * 0.75,
      height: CHART_HEIGHT * 0.25,
    })
    expect(first?.segments[1]?.y).toBe(0)
    expect(empty?.segments).toEqual([])
    expect(last?.total).toBe(2)
  })

  test('totals add up per band', () => {
    expect(bandTotals(volume)).toEqual({ error: 1, warn: 2, info: 3, debug: 0 })
  })
})

describe('brushing', () => {
  test('a span either way round covers whole buckets', () => {
    expect(brushWindow(volume, { start: 2, end: 1 })).toEqual({ from: 1_000, to: 3_000 })
    expect(brushWindow(volume, { start: 0, end: 0 })).toEqual({ from: 0, to: 1_000 })
  })

  test('the pointer maps to a bucket and clamps at the edges', () => {
    expect(bucketAt(50, 300, 3)).toBe(0)
    expect(bucketAt(299, 300, 3)).toBe(2)
    expect(bucketAt(-5, 300, 3)).toBe(0)
    expect(bucketAt(900, 300, 3)).toBe(2)
  })
})
