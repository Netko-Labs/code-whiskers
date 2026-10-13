import { describe, expect, test } from 'bun:test'
import { findingTitleOf, parseMention, parseRemember } from './utils'

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

describe('parseMention commands', () => {
  test('remember and learn save a note', () => {
    expect(parseMention('@code-whiskers remember rule: cents only', HANDLE)).toEqual({
      command: 'remember',
      text: 'rule: cents only',
    })
    expect(parseMention('@code-whiskers learn this', HANDLE).command).toBe('remember')
  })

  test('inherited object keys are not commands', () => {
    for (const word of ['constructor', 'toString', '__proto__', 'hasOwnProperty']) {
      expect(parseMention(`@code-whiskers ${word} what`, HANDLE).command).toBe('question')
    }
  })
})

describe('parseRemember', () => {
  test('a leading kind word picks the kind', () => {
    expect(parseRemember('rule: money is integer cents')).toEqual({
      kind: 'rule',
      body: 'money is integer cents',
    })
    expect(parseRemember("don't-flag icon sizes, Wallet scales them")).toEqual({
      kind: 'dont_flag',
      body: 'icon sizes, Wallet scales them',
    })
    expect(parseRemember('prefer early returns')?.kind).toBe('preference')
  })

  test('without a kind word it is context, whole text kept', () => {
    expect(parseRemember('the storefront is public')).toEqual({
      kind: 'context',
      body: 'the storefront is public',
    })
  })

  test('nothing to remember is null', () => {
    expect(parseRemember('')).toBeNull()
    expect(parseRemember('rule:')).toBeNull()
    expect(parseRemember('rule: x')).toBeNull()
  })

  test('a long note is clipped to what studio accepts', () => {
    expect(parseRemember(`context ${'a'.repeat(700)}`)?.body.length).toBe(600)
  })
})
