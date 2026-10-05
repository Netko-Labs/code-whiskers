import { describe, expect, test } from 'bun:test'
import { isCombo, keyLabel } from './utils'

function keydown(key: string, init: Partial<KeyboardEvent> = {}): KeyboardEvent {
  return {
    key,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    ...init,
  } as KeyboardEvent
}

describe('keyLabel', () => {
  test('mod reads as the platform modifier', () => {
    expect(keyLabel('mod', true)).toBe('⌘')
    expect(keyLabel('mod', false)).toBe('Ctrl')
  })

  test('plain keys are uppercased, named keys get a glyph', () => {
    expect(keyLabel('k', true)).toBe('K')
    expect(keyLabel('enter', false)).toBe('↵')
  })
})

describe('isCombo', () => {
  test('mod accepts either meta or ctrl', () => {
    expect(isCombo(keydown('k', { metaKey: true }), 'mod+k')).toBe(true)
    expect(isCombo(keydown('K', { ctrlKey: true }), 'mod+k')).toBe(true)
  })

  test('extra or missing modifiers do not match', () => {
    expect(isCombo(keydown('k'), 'mod+k')).toBe(false)
    expect(isCombo(keydown('k', { metaKey: true, shiftKey: true }), 'mod+k')).toBe(false)
    expect(isCombo(keydown('?', { shiftKey: true }), 'shift+?')).toBe(true)
  })
})
