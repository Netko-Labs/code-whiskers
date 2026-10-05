import { describe, expect, test } from 'bun:test'
import type { Member } from '@/integrations/studio-api'
import { filterMembers, sortMembers } from './utils'

const member = (id: string, name: string, patch: Partial<Member> = {}): Member => ({
  id,
  name,
  image: null,
  githubLogin: null,
  role: 'member',
  organizations: ['netko'],
  lastSyncedAt: new Date(),
  lastActiveAt: null,
  ...patch,
})

describe('sortMembers', () => {
  test('puts the viewer first, then sorts by name', () => {
    const sorted = sortMembers([member('a', 'Zoe'), member('b', 'Ana'), member('me', 'Mia')], 'me')
    expect(sorted.map((m) => m.name)).toEqual(['Mia', 'Ana', 'Zoe'])
  })
})

describe('filterMembers', () => {
  const members = [
    member('a', 'Ana', { githubLogin: 'ana-dev' }),
    member('b', 'Bo', { organizations: ['acme'] }),
  ]

  test('matches name, login or installation, case-insensitively', () => {
    expect(filterMembers(members, 'ANA-').map((m) => m.id)).toEqual(['a'])
    expect(filterMembers(members, 'acme').map((m) => m.id)).toEqual(['b'])
  })

  test('a blank query keeps everyone', () => {
    expect(filterMembers(members, '  ')).toHaveLength(2)
  })
})
