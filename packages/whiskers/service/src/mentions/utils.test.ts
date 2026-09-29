import { describe, expect, test } from 'bun:test'
import { findingTitleOf, parseMention } from './utils'

const HANDLE = 'code-whiskers'

describe('parseMention', () => {
  test('the first word after the mention picks the command', () => {
    expect(parseMention('@code-whiskers fix', HANDLE)).toEqual({ command: 'fix', text: '' })
    expect(parseMention('@Code-Whiskers review please', HANDLE)).toEqual({
      command: 'review',
      text: 'please',
    })
    expect(parseMention('@code-whiskers re-review', HANDLE).command).toBe('review')
    expect(parseMention('@code-whiskers ignore: the preview warns instead', HANDLE)).toEqual({
      command: 'ignore',
      text: ': the preview warns instead',
    })
    expect(parseMention('@code-whiskers dismiss', HANDLE).command).toBe('ignore')
  })

  test('anything else is a question, even when a command word appears later', () => {
    expect(parseMention('@code-whiskers why does this fix fail?', HANDLE)).toEqual({
      command: 'question',
      text: 'why does this fix fail?',
    })
    expect(parseMention('hey @code-whiskers, is this safe?', HANDLE).command).toBe('question')
  })

  test('a bare mention still asks something', () => {
    expect(parseMention('@code-whiskers', HANDLE)).toEqual({
      command: 'question',
      text: '@code-whiskers',
    })
  })
})

describe('findingTitleOf', () => {
  test('reads the title from a posted finding comment', () => {
    expect(
      findingTitleOf('**High · bug** — Tenant barrel still exports the moved resolver\n\nBody'),
    ).toBe('Tenant barrel still exports the moved resolver')
    expect(findingTitleOf('just a human comment')).toBeNull()
  })
})
