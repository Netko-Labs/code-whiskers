import { describe, expect, test } from 'bun:test'
import { repairJsonText } from './repair'

describe('repairJsonText', () => {
  test('strips markdown fences', () => {
    expect(repairJsonText('```json\n{"a":1}\n```')).toBe('{"a":1}')
  })

  test('drops prose around the object', () => {
    expect(repairJsonText('Here you go:\n{"a":1}\nHope this helps.')).toBe('{"a":1}')
  })

  test('returns null when the text is already the bare object', () => {
    expect(repairJsonText('{"a":1}')).toBeNull()
  })

  test('returns null when no object is present', () => {
    expect(repairJsonText('nothing here')).toBeNull()
  })
})
