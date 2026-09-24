import { describe, expect, test } from 'bun:test'
import { type AlertRule, isCoolingDown } from '../src/alerts'

const rule = (overrides: Partial<AlertRule> = {}): AlertRule => ({
  id: 'r1',
  name: 'Error burst',
  kind: 'error_rate',
  projectId: null,
  threshold: 10,
  windowMinutes: 10,
  state: 'armed',
  lastFiredAt: null,
  ...overrides,
})

const NOW = new Date('2026-09-24T06:00:00Z')

describe('isCoolingDown', () => {
  test('a rate rule that fired inside its window holds off', () => {
    expect(isCoolingDown(rule({ lastFiredAt: '2026-09-24T05:55:00Z' }), NOW)).toBe(true)
  })

  test('once the window passes it may fire again', () => {
    expect(isCoolingDown(rule({ lastFiredAt: '2026-09-24T05:49:00Z' }), NOW)).toBe(false)
  })

  test('event-shaped rules never cool down — each new event is news', () => {
    expect(
      isCoolingDown(rule({ kind: 'new_issue', lastFiredAt: '2026-09-24T05:59:00Z' }), NOW),
    ).toBe(false)
  })
})
