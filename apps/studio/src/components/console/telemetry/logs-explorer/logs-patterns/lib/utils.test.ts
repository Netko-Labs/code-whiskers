import { describe, expect, test } from 'bun:test'
import { literalOf, patternParts } from './utils'

describe('patterns', () => {
  test('placeholders split out as variable parts', () => {
    expect(patternParts('user <n> failed to pay <hex>')).toEqual([
      { text: 'user ', isVariable: false },
      { text: '<n>', isVariable: true },
      { text: ' failed to pay ', isVariable: false },
      { text: '<hex>', isVariable: true },
    ])
  })

  test('the longest literal run becomes the search; too short means none', () => {
    expect(literalOf('user <n> failed to pay <hex>')).toBe('failed to pay')
    expect(literalOf('<n> ok <n>')).toBeUndefined()
  })
})
