import { describe, expect, test } from 'bun:test'
import { buildDescriptionContext } from './delta'

describe('buildDescriptionContext', () => {
  test('drops template comments and says nothing for an empty body', () => {
    expect(buildDescriptionContext('<!-- fill me in -->\n  ')).toBe('')
    expect(buildDescriptionContext('Backfill runs in 0004.<!-- hidden -->')).toContain(
      'Backfill runs in 0004.',
    )
  })

  test('a long description is clipped', () => {
    expect(buildDescriptionContext('x'.repeat(5_000)).length).toBeLessThan(2_200)
  })
})
