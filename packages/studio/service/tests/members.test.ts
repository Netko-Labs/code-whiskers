import { describe, expect, test } from 'bun:test'
import type { MemberRow } from '../src/queries/member/types'
import { membersFromRows } from '../src/queries/member/utils'

const row = (patch: Partial<MemberRow>): MemberRow => ({
  id: 'u1',
  name: 'Juan',
  image: null,
  githubLogin: 'juan',
  login: 'netko',
  accountType: 'Organization',
  syncedAt: new Date('2026-10-01T00:00:00Z'),
  ...patch,
})

describe('membersFromRows', () => {
  test('folds installations into one member with the freshest sync', () => {
    const [member] = membersFromRows(
      [row({}), row({ login: 'acme', syncedAt: new Date('2026-10-03T00:00:00Z') })],
      new Map(),
    )
    expect(member?.organizations).toEqual(['netko', 'acme'])
    expect(member?.lastSyncedAt.toISOString()).toBe('2026-10-03T00:00:00.000Z')
    expect(member?.lastActiveAt).toBeNull()
  })

  test('owns a personal installation whose login matches, case-insensitively', () => {
    const members = membersFromRows(
      [
        row({ login: 'Juan', accountType: 'User' }),
        row({ id: 'u2', name: 'Ana', githubLogin: 'ana', login: 'Juan', accountType: 'User' }),
      ],
      new Map(),
    )
    expect(members.map((m) => [m.name, m.role])).toEqual([
      ['Ana', 'member'],
      ['Juan', 'owner'],
    ])
  })

  test('an unknown login is never an owner', () => {
    const [member] = membersFromRows(
      [row({ githubLogin: null, login: 'juan', accountType: 'User' })],
      new Map(),
    )
    expect(member?.role).toBe('member')
  })

  test('carries last activity from sessions', () => {
    const seen = new Date('2026-10-04T12:00:00Z')
    const [member] = membersFromRows([row({})], new Map([['u1', seen]]))
    expect(member?.lastActiveAt).toBe(seen)
  })
})
