import { describe, expect, test } from 'bun:test'
import { overviewWindowOf } from '../src/queries/tracker'

const NOW = new Date('2026-10-04T12:34:56.000Z')
const HOUR = 60 * 60 * 1000

describe('overviewWindowOf', () => {
  test('24h is hourly and ends with the hour holding now', () => {
    const window = overviewWindowOf('24h', NOW)
    expect(window.length).toBe(24)
    expect(window.stepMs).toBe(HOUR)
    expect(window.start.toISOString()).toBe('2026-10-03T13:00:00.000Z')
    expect(window.start.getTime() + 23 * HOUR).toBe(new Date('2026-10-04T12:00:00.000Z').getTime())
  })

  test('7d is 28 six-hour buckets aligned to the step', () => {
    const window = overviewWindowOf('7d', NOW)
    expect(window.length).toBe(28)
    expect(window.start.getTime() % (6 * HOUR)).toBe(0)
    expect(window.start.toISOString()).toBe('2026-09-27T18:00:00.000Z')
  })

  test('30d is daily, starting at a UTC midnight', () => {
    const window = overviewWindowOf('30d', NOW)
    expect(window.length).toBe(30)
    expect(window.start.toISOString()).toBe('2026-09-05T00:00:00.000Z')
  })

  test('the same bucket answers for any instant inside it', () => {
    const later = new Date('2026-10-04T12:59:59.000Z')
    expect(overviewWindowOf('24h', later).start).toEqual(overviewWindowOf('24h', NOW).start)
  })
})
