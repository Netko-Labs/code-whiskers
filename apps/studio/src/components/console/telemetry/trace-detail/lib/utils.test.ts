import { describe, expect, test } from 'bun:test'
import type { WhiskersSpan } from '@/integrations/whiskers'
import { axisTicks, buildWaterfall, rootOf } from './utils'

const span = (
  spanId: string,
  parentSpanId: string | null,
  start: number,
  durationMs: number,
  service = 'api',
): WhiskersSpan => ({
  spanId,
  parentSpanId,
  service,
  name: spanId,
  kind: 0,
  status: 'ok',
  startTime: new Date(start),
  durationMs,
  attributes: {},
  events: [],
})

const spans = [
  span('db', 'handler', 30, 20, 'postgres'),
  span('root', null, 0, 100),
  span('handler', 'root', 10, 80),
  span('cache', 'handler', 15, 5, 'redis'),
  span('orphan', 'missing', 50, 10, 'worker'),
]

describe('buildWaterfall', () => {
  test('depth-first, children by start time, orphans drawn as roots', () => {
    const waterfall = buildWaterfall(spans)
    expect(waterfall.rows.map((row) => [row.span.spanId, row.depth])).toEqual([
      ['root', 0],
      ['handler', 1],
      ['cache', 2],
      ['db', 2],
      ['orphan', 0],
    ])
    expect(waterfall.durationMs).toBe(100)
    expect(waterfall.services).toEqual(['api', 'redis', 'postgres', 'worker'])
  })

  test('offsets and widths are shares of the whole trace', () => {
    const db = buildWaterfall(spans).rows.find((row) => row.span.spanId === 'db')
    expect(db).toMatchObject({ offsetMs: 30, startPercent: 30, widthPercent: 20, colorIndex: 2 })
  })

  test('a collapsed span hides its subtree but keeps its child count', () => {
    const rows = buildWaterfall(spans, new Set(['handler'])).rows
    expect(rows.map((row) => row.span.spanId)).toEqual(['root', 'handler', 'orphan'])
    expect(rows[1]?.childCount).toBe(2)
  })

  test('nothing in, nothing out', () => {
    expect(buildWaterfall([]).rows).toEqual([])
  })
})

describe('helpers', () => {
  test('ticks run from zero to the full duration', () => {
    expect(axisTicks(200, 3)).toEqual([
      { percent: 0, label: '0ms' },
      { percent: 50, label: '100ms' },
      { percent: 100, label: '200ms' },
    ])
  })

  test('the root is the span without a parent', () => {
    expect(rootOf(spans)?.spanId).toBe('root')
    expect(rootOf([span('a', 'gone', 0, 1)])?.spanId).toBe('a')
  })
})
