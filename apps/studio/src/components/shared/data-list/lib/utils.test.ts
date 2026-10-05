import { describe, expect, test } from 'bun:test'
import { nextIndex } from './utils'

describe('nextIndex', () => {
  test('steps and clamps at both ends', () => {
    expect(nextIndex(0, 1, 3)).toBe(1)
    expect(nextIndex(2, 1, 3)).toBe(2)
    expect(nextIndex(0, -1, 3)).toBe(0)
  })

  test('jumps to the edges', () => {
    expect(nextIndex(1, 'first', 3)).toBe(0)
    expect(nextIndex(1, 'last', 3)).toBe(2)
  })

  test('enters from outside the list at the matching end', () => {
    expect(nextIndex(-1, 1, 3)).toBe(0)
    expect(nextIndex(-1, -1, 3)).toBe(2)
  })

  test('an empty list has nowhere to go', () => {
    expect(nextIndex(0, 1, 0)).toBe(-1)
  })
})
