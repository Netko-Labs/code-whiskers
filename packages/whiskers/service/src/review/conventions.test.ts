import { describe, expect, test } from 'bun:test'
import {
  applicableDirectories,
  buildConventionsContext,
  candidatePaths,
  importsOf,
} from './conventions'

describe('applicableDirectories', () => {
  test('the root and every ancestor of each changed file', () => {
    expect([...applicableDirectories(['apps/studio/src/a.ts', 'README.md'])].sort()).toEqual([
      '',
      'apps',
      'apps/studio',
      'apps/studio/src',
    ])
  })
})

describe('importsOf', () => {
  test('resolves @imports from the importing file, not the repo root', () => {
    expect(importsOf('See @docs/conventions.md for style.', 'CLAUDE.md')).toEqual([
      'docs/conventions.md',
    ])
    expect(importsOf('@../shared/rules.md', 'apps/studio/CLAUDE.md')).toEqual([
      'apps/shared/rules.md',
    ])
  })

  test('ignores emails, handles and paths that climb out of the repo', () => {
    expect(importsOf('mail juan@netko.dev or ping @juan', 'CLAUDE.md')).toEqual([])
    expect(importsOf('@../../outside.md', 'CLAUDE.md')).toEqual([])
  })
})

describe('buildConventionsContext', () => {
  test('nothing to say without files', () => {
    expect(buildConventionsContext([])).toBe('')
  })

  test('each file keeps its path, a long one is clipped', () => {
    const context = buildConventionsContext([
      { path: 'CLAUDE.md', content: 'Use Bun.' },
      { path: 'AGENTS.md', content: 'x'.repeat(20_000) },
    ])
    expect(context).toContain('### CLAUDE.md\nUse Bun.')
    expect(context).toContain('### AGENTS.md')
    expect(context.length).toBeLessThan(10_000)
  })
})

describe('candidatePaths', () => {
  test('a truncated tree probes the root first, then each ancestor', () => {
    expect(candidatePaths(applicableDirectories(['apps/studio/a.ts']))).toEqual([
      'CLAUDE.md',
      'AGENTS.md',
      'apps/CLAUDE.md',
      'apps/AGENTS.md',
      'apps/studio/CLAUDE.md',
      'apps/studio/AGENTS.md',
    ])
  })
})
