import { describe, expect, test } from 'bun:test'
import { easeOutQuart, interpolate, isMotionReduced, parseMotionPreference } from './utils'

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

describe('motion preference', () => {
  test('anything unknown reads as system', () => {
    expect(parseMotionPreference('reduce')).toBe('reduce')
    expect(parseMotionPreference('fast')).toBe('system')
    expect(parseMotionPreference(null)).toBe('system')
  })

  test('either the app or the OS can still the console', () => {
    expect(isMotionReduced('system', false)).toBe(false)
    expect(isMotionReduced('system', true)).toBe(true)
    expect(isMotionReduced('reduce', false)).toBe(true)
  })
})
