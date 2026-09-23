import { describe, expect, test } from 'bun:test'
import { parseRepositoryScope } from '../src/shared/repository-scope'

describe('parseRepositoryScope', () => {
  test('owner/name', () => {
    expect(parseRepositoryScope('netko/api')).toEqual({ owner: 'netko', name: 'api' })
  })

  test('anything that is not exactly owner/name names no repository', () => {
    for (const scope of ['netko', 'netko/', '/api', 'a/b/c', 'src/auth/session.ts:118', '']) {
      expect(parseRepositoryScope(scope)).toBeNull()
    }
  })
})
