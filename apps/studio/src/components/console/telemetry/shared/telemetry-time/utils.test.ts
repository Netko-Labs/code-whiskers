import { describe, expect, test } from 'bun:test'
import { boundsOf, formatDuration, parseRangeSearch, searchText, windowSpecOf } from './utils'

describe('parseRangeSearch', () => {
  test('a known preset survives; an unknown one is dropped', () => {
    expect(parseRangeSearch({ range: '6h' })).toEqual({ range: '6h' })
    expect(parseRangeSearch({ range: '3y' })).toEqual({})
  })

  test('an exact window needs both ends in order and wins over the preset', () => {
    expect(parseRangeSearch({ range: '1h', from: '1000', to: 2000 })).toEqual({
      from: 1000,
      to: 2000,
    })
    expect(parseRangeSearch({ range: '1h', from: 3000, to: 2000 })).toEqual({ range: '1h' })
    expect(parseRangeSearch({ from: 1000 })).toEqual({})
  })
})

describe('windowSpecOf', () => {
  test('a preset slides with now unless anchored', () => {
    expect(windowSpecOf({ range: '15m' }, '1h')).toEqual({ sinceMs: 900_000 })
    expect(windowSpecOf({}, '1h', 10_000_000)).toEqual({ from: 6_400_000, to: 10_000_000 })
  })

  test('a pinned window ignores the anchor', () => {
    expect(windowSpecOf({ from: 1, to: 2 }, '1h', 99)).toEqual({ from: 1, to: 2 })
  })

  test('bounds turn a sliding window into concrete ends', () => {
    expect(boundsOf({ range: '1h' }, '24h', 4_000_000)).toEqual({ from: 400_000, to: 4_000_000 })
  })
})

describe('formatting', () => {
  test('durations pick a unit that keeps three significant figures', () => {
    expect(formatDuration(0.25)).toBe('0.25ms')
    expect(formatDuration(4.26)).toBe('4.3ms')
    expect(formatDuration(412.4)).toBe('412ms')
    expect(formatDuration(1520)).toBe('1.52s')
    expect(formatDuration(64_000)).toBe('1m 4s')
  })

  test('search text is trimmed and bounded', () => {
    expect(searchText('  checkout ')).toBe('checkout')
    expect(searchText('   ')).toBeUndefined()
    expect(searchText(500)).toBe('500')
    expect(searchText({})).toBeUndefined()
    expect(searchText('x'.repeat(300))?.length).toBe(200)
  })
})
