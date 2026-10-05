import { describe, expect, test } from 'bun:test'
import { formatCompact, formatInteger, sparkBars, sparklineGeometry } from './utils'

describe('sparklineGeometry', () => {
  test('nothing to draw for no values', () => {
    expect(sparklineGeometry([], 100, 20)).toEqual({ line: '', area: '' })
  })

  test('maps the max to the top and the min to the bottom, inset by the stroke', () => {
    const { line } = sparklineGeometry([0, 10], 100, 20)
    expect(line).toBe('M1.5,18.5 L98.5,1.5')
  })

  test('a flat series sits in the middle', () => {
    expect(sparklineGeometry([4, 4, 4], 10, 20).line).toBe('M1.5,10 L5,10 L8.5,10')
  })

  test('the area closes along the bottom edge', () => {
    expect(sparklineGeometry([0, 10], 100, 20).area.endsWith('L98.5,20 L1.5,20 Z')).toBe(true)
  })
})

describe('sparkBars', () => {
  test('scales to the tallest bar and keeps a stub for zero', () => {
    const bars = sparkBars([0, 5, 10], 32, 10, 1)
    expect(bars.map((bar) => bar.height)).toEqual([1, 5, 10])
    expect(bars[2]?.y).toBe(0)
  })
})

describe('number formats', () => {
  test('compact and integer', () => {
    expect(formatCompact(12_400)).toBe('12.4K')
    expect(formatInteger(1234.6)).toBe('1,235')
  })
})
