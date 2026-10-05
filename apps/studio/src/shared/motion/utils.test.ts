import { describe, expect, test } from 'bun:test'
import { easeOutQuart, interpolate } from './utils'

describe('easeOutQuart', () => {
  test('starts at 0, ends at 1, front-loads progress', () => {
    expect(easeOutQuart(0)).toBe(0)
    expect(easeOutQuart(1)).toBe(1)
    expect(easeOutQuart(0.5)).toBeGreaterThan(0.9)
  })
})

describe('interpolate', () => {
  test('walks between both ends, in either direction', () => {
    expect(interpolate(10, 20, 0.5)).toBe(15)
    expect(interpolate(20, 10, 0.25)).toBe(17.5)
  })
})
