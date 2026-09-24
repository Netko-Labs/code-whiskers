import { describe, expect, test } from 'bun:test'
import { directoryOf, logPattern } from '../src/queries/insights'

describe('directoryOf', () => {
  test('keeps the first three directory levels', () => {
    expect(directoryOf('apps/studio/src/components/console/x.tsx')).toBe('apps/studio/src')
  })

  test('a shallow file keeps what it has', () => {
    expect(directoryOf('packages/cli/index.ts')).toBe('packages/cli')
  })

  test('a root file sits in the root', () => {
    expect(directoryOf('README.md')).toBe('.')
  })
})

describe('logPattern', () => {
  test('ids, counts and quoted values collapse so the same failure groups', () => {
    const a = logPattern('user 42 failed to pay order 7f3c9a1b2d "gold plan" at 10.5s')
    const b = logPattern('user 97 failed to pay order 0a1b2c3d4e "trial" at 3s')
    expect(a).toBe(b)
    expect(a).toBe('user <n> failed to pay order <hex> <str> at <n>s')
    expect(logPattern('sha256 mismatch on v2')).toBe('sha256 mismatch on v2')
  })

  test('uuids and emails are placeholders too', () => {
    expect(logPattern('lookup 550e8400-e29b-41d4-a716-446655440000 for jo@x.io')).toBe(
      'lookup <uuid> for <email>',
    )
  })
})
