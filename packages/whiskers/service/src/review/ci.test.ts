import { describe, expect, test } from 'bun:test'
import type { LlmFinding } from '@code-whiskers/whiskers-domain'
import { isCompileClaim } from './ci'

function finding(title: string, body = ''): LlmFinding {
  return {
    file: 'a.ts',
    line: 1,
    severity: 'high',
    category: 'bug',
    title,
    body,
    suggestion: null,
    evidence: '',
  }
}

describe('isCompileClaim', () => {
  test('claims a green typecheck disproves — the field report’s repeats', () => {
    for (const title of [
      'Existing todo components no longer match the changed props',
      'The todos example no longer matches its hook’s return contract',
      'Existing callers no longer compile without an enabled argument',
      'The existing hook caller no longer type-checks',
      'The lib barrel still exports the deleted utility',
      'The send form contract no longer matches its unchanged consumers',
    ]) {
      expect(isCompileClaim(finding(title))).toBe(true)
    }
  })

  test('runtime problems stay', () => {
    for (const title of [
      'Other todo writes can erase an unfinished create form',
      'A failed active-PR query becomes an unhandled rejection',
      'A different reaction can authorize the command',
    ]) {
      expect(isCompileClaim(finding(title))).toBe(false)
    }
  })
})
