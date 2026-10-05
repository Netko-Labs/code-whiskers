import { describe, expect, test } from 'bun:test'
import type { StudioStorage } from '@/integrations/studio-api'
import type { WhiskersInstance } from '@/integrations/whiskers'
import { formatBytes, mergeStores, perReview } from './utils'

const worker = {
  stores: [{ table: 'event', bytes: 4096, rows: 10, isEstimate: true, oldest: null }],
} as unknown as WhiskersInstance
const studio: StudioStorage = {
  databaseBytes: 0,
  stores: [{ table: 'user', bytes: 8192, rows: 2, oldest: null }],
}

describe('mergeStores', () => {
  test('tags each table with its database, largest first', () => {
    expect(mergeStores(worker, studio).map((s) => [s.table, s.database, s.isEstimate])).toEqual([
      ['user', 'studio', false],
      ['event', 'whiskers', true],
    ])
  })

  test('either side may be missing', () => {
    expect(mergeStores(undefined, undefined)).toEqual([])
    expect(mergeStores(worker, undefined)).toHaveLength(1)
  })
})

describe('formatBytes', () => {
  test('one decimal under ten, whole numbers above', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(20 * 1024 * 1024)).toBe('20 MB')
  })
})

describe('perReview', () => {
  test('blank rather than a fake zero when nothing was measured', () => {
    expect(perReview(1000, 0)).toBe('—')
    expect(perReview(1000, 4)).toBe('250')
  })
})
