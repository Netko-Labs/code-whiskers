import { describe, expect, test } from 'bun:test'
import type { ApiKey } from '@/integrations/studio-api'
import { groupApiKeys, markRevoked, mcpCommand } from './utils'

const key = (id: string, revokedAt: Date | null = null): ApiKey => ({
  id,
  name: id,
  prefix: 'cw_abcdefg',
  scope: 'read',
  lastUsedAt: null,
  revokedAt,
  createdAt: new Date('2026-10-01T00:00:00Z'),
})

describe('groupApiKeys', () => {
  test('splits live keys from revoked ones, keeping order', () => {
    const groups = groupApiKeys([key('a'), key('b', new Date()), key('c')])
    expect(groups.active.map((k) => k.id)).toEqual(['a', 'c'])
    expect(groups.revoked.map((k) => k.id)).toEqual(['b'])
  })
})

describe('markRevoked', () => {
  test('revokes only the named live key', () => {
    const at = new Date('2026-10-05T00:00:00Z')
    const keys = markRevoked([key('a'), key('b')], 'a', at)
    expect(keys[0]?.revokedAt).toBe(at)
    expect(keys[1]?.revokedAt).toBeNull()
  })

  test('an already revoked key keeps its original time', () => {
    const first = new Date('2026-10-01T00:00:00Z')
    const [revoked] = markRevoked([key('a', first)], 'a', new Date())
    expect(revoked?.revokedAt).toBe(first)
  })
})

describe('mcpCommand', () => {
  test('connects Claude Code to this instance with the key', () => {
    expect(mcpCommand('https://whiskers.example', 'cw_abc')).toBe(
      'claude mcp add --transport http code-whiskers https://whiskers.example/api/mcp --header "Authorization: Bearer cw_abc"',
    )
  })
})
