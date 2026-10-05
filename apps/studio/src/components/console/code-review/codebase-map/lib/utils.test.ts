import { describe, expect, test } from 'bun:test'
import type { WhiskersHotspot } from '@/integrations/whiskers'
import { hotspotRows, treeUrl } from './utils'

function spot(directory: string, critical: number, low: number): WhiskersHotspot {
  return {
    repository: 'acme/web',
    directory,
    owners: [],
    findings: critical + low,
    critical,
    high: 0,
    medium: 0,
    low,
    pullRequests: 1,
    lastSeen: new Date(0),
  }
}

describe('hotspotRows', () => {
  test('bars share the busiest directory as their scale', () => {
    const rows = hotspotRows([spot('src/a', 2, 2), spot('src/b', 0, 1)], {
      isBlockingOnly: false,
      query: '',
    })
    expect(rows[0]?.segments.map((s) => s.percent)).toEqual([50, 50])
    expect(rows[1]?.segments.map((s) => s.percent)).toEqual([25])
  })

  test('blocking only keeps directories with critical or high findings', () => {
    const rows = hotspotRows([spot('src/a', 1, 0), spot('src/b', 0, 3)], {
      isBlockingOnly: true,
      query: '',
    })
    expect(rows.map((row) => row.spot.directory)).toEqual(['src/a'])
  })

  test('the root directory links to the repository tree', () => {
    expect(treeUrl({ repository: 'acme/web', directory: '.' })).toBe(
      'https://github.com/acme/web/tree/HEAD/',
    )
  })
})
