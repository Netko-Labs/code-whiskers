import { describe, expect, test } from 'bun:test'
import { searchText } from './utils'

describe('searchText', () => {
  test('a numeric search value (a project id) survives the router parsing it as a number', () => {
    expect(searchText(1)).toBe('1')
    expect(searchText(' web ')).toBe('web')
    expect(searchText('')).toBeUndefined()
    expect(searchText(Number.NaN)).toBeUndefined()
    expect(searchText({})).toBeUndefined()
  })
})
