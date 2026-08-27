import { describe, expect, test } from 'bun:test'
import {
  buildAgentRequest,
  buildCommitMessage,
  buildFixReply,
  isBotMention,
  isProtectedPath,
  numberedExcerpt,
} from '../src/fix/utils'
import { assertSafeRelPath, assertSafeWritePath } from '../src/fix/workspace'

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

  test('ignores email addresses and npm-scope references', () => {
    expect(isBotMention('mail me@code-whiskers.io please', 'code-whiskers')).toBe(false)
    expect(isBotMention('use @code-whiskers/logger here', 'code-whiskers')).toBe(false)
    expect(isBotMention('foo@code-whiskers.dev in CI', 'code-whiskers')).toBe(false)
  })
})

describe('isProtectedPath', () => {
  test('blocks CI entrypoints, manifests, and lockfiles', () => {
    for (const path of [
      '.github/workflows/ci.yml',
      '.gitlab-ci.yml',
      'bun.lock',
      'tools/action.yml',
      'ci/action.yaml',
      '.gitattributes',
      'packages/a/.gitattributes',
      '.gitmodules',
      'package.json',
      'apps/studio/package.json',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
    ]) {
      expect(isProtectedPath(path)).toBe(true)
    }
  })

  test('allows ordinary source paths', () => {
    for (const path of ['src/app.ts', 'packages/a/src/index.ts', 'docs/github/notes.md']) {
      expect(isProtectedPath(path)).toBe(false)
    }
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

  test('keeps the closing fence on its own line without a trailing newline', () => {
    expect(buildFixReply({ explanation: 'x', suggestion: 'if (a === b) {' })).toBe(
      'x\n\n```suggestion\nif (a === b) {\n```',
    )
  })
})

describe('assertSafeRelPath', () => {
  test('accepts normal repo-relative paths', () => {
    expect(() => assertSafeRelPath('src/app.ts')).not.toThrow()
    expect(() => assertSafeRelPath('packages/a/b.test.ts')).not.toThrow()
  })

  test('rejects escapes, absolute paths, quotes, and .git', () => {
    for (const path of [
      '',
      '/etc/passwd',
      '../x',
      'a/../../x',
      "a'b",
      'a\\b',
      '.git',
      '.git/config',
    ]) {
      expect(() => assertSafeRelPath(path)).toThrow('unsafe path')
    }
  })
})

describe('buildAgentRequest', () => {
  const base = { commentId: 1, body: '@code-whiskers fix the null check', author: 'peje' }

  test('anchors to the commented lines when known', () => {
    const request = buildAgentRequest({ ...base, path: 'src/a.ts', startLine: 3, line: 5 })
    expect(request).toContain('src/a.ts, lines 3-5')
    expect(request).toContain('@peje')
    expect(request).toContain('fix the null check')
  })

  test('omits the anchor for PR-level requests', () => {
    const request = buildAgentRequest({
      ...base,
      commentId: null,
      path: null,
      startLine: null,
      line: null,
    })
    expect(request).not.toContain('lines')
  })
})

describe('buildCommitMessage', () => {
  const target = (body: string) => ({
    commentId: null,
    path: null,
    startLine: null,
    line: null,
    body,
    author: 'peje',
  })

  test('uses the first line with the mention stripped', () => {
    expect(
      buildCommitMessage(target('@code-whiskers please fix the race\ndetails'), 'code-whiskers'),
    ).toBe('🐛 fix: please fix the race')
  })

  test('falls back when the comment is only the mention', () => {
    expect(buildCommitMessage(target('@code-whiskers'), 'code-whiskers')).toBe(
      '🐛 fix: address PR comment',
    )
  })

  test('truncates long subjects', () => {
    const message = buildCommitMessage(target(`fix ${'x'.repeat(100)}`), 'code-whiskers')
    expect(message.length).toBeLessThanOrEqual('🐛 fix: '.length + 60)
  })
})

describe('assertSafeWritePath', () => {
  test('additionally rejects protected paths', () => {
    expect(() => assertSafeWritePath('.github/workflows/ci.yml')).toThrow('protected path')
    expect(() => assertSafeWritePath('package.json')).toThrow('protected path')
    expect(() => assertSafeWritePath('src/app.ts')).not.toThrow()
  })

  test('still composes the rel-path safety check', () => {
    expect(() => assertSafeWritePath('../x')).toThrow('unsafe path')
    expect(() => assertSafeWritePath('.git/config')).toThrow('unsafe path')
  })
})
