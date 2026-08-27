import { describe, expect, test } from 'bun:test'
import { buildFixReply, isBotMention, numberedExcerpt } from '../src/fix/utils'

describe('isBotMention', () => {
  test('matches the handle word-bounded and case-insensitive', () => {
    expect(isBotMention('hey @code-whiskers fix this', 'code-whiskers')).toBe(true)
    expect(isBotMention('@Code-Whiskers please fix', 'code-whiskers')).toBe(true)
    expect(isBotMention('@code-whiskers, fix it', 'code-whiskers')).toBe(true)
  })

  test('ignores other handles and prefix collisions', () => {
    expect(isBotMention('cc @code-whiskers-dev', 'code-whiskers')).toBe(false)
    expect(isBotMention('code-whiskers without the @', 'code-whiskers')).toBe(false)
    expect(isBotMention('mail@code-whiskers2.dev', 'code-whiskers')).toBe(false)
  })
})

describe('numberedExcerpt', () => {
  const source = Array.from({ length: 100 }, (_, i) => `line ${i + 1}`).join('\n')

  test('windows around the range with 1-indexed numbering', () => {
    const excerpt = numberedExcerpt(source, 50, 52, 2)
    expect(excerpt.split('\n')).toEqual([
      '48: line 48',
      '49: line 49',
      '50: line 50',
      '51: line 51',
      '52: line 52',
      '53: line 53',
      '54: line 54',
    ])
  })

  test('clamps at file boundaries', () => {
    expect(numberedExcerpt(source, 1, 1, 5).startsWith('1: line 1')).toBe(true)
    expect(numberedExcerpt(source, 100, 100, 5).endsWith('100: line 100')).toBe(true)
  })
})

describe('buildFixReply', () => {
  test('wraps the fix in a committable suggestion block', () => {
    const reply = buildFixReply({
      explanation: 'Use strict equality.',
      suggestion: 'if (a === b) {\n',
    })
    expect(reply).toBe('Use strict equality.\n\n```suggestion\nif (a === b) {\n```')
  })

  test('falls back to prose when there is no code change', () => {
    expect(buildFixReply({ explanation: 'Nothing to change here.', suggestion: null })).toBe(
      'Nothing to change here.',
    )
  })
})
