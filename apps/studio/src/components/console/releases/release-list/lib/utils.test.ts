import { describe, expect, test } from 'bun:test'
import type { WhiskersRelease } from '@/integrations/whiskers'
import { facetsOf, filterReleases, newIssueTone, releaseFilterOf, toggled } from './utils'

const release = (patch: Partial<WhiskersRelease>): WhiskersRelease => ({
  id: 'r',
  projectId: '1',
  release: '1.0.0',
  environment: null,
  environments: [],
  firstSeen: new Date('2026-10-01'),
  lastSeen: new Date('2026-10-02'),
  events: 0,
  issues: 0,
  newIssues: 0,
  newErrors: 0,
  trend: [],
  commitCount: 0,
  lastDeploy: null,
  repository: null,
  commitSha: null,
  ...patch,
})

const env = (name: string, isCurrent = false) => ({ name, isCurrent, deployedAt: null })

const RELEASES = [
  release({ id: 'a', release: 'web@2.0.0', environments: [env('production', true)] }),
  release({ id: 'b', release: 'web@1.9.0', projectId: '2', newIssues: 2, newErrors: 1 }),
  release({ id: 'c', release: 'api@1.0.0', environments: [env('staging')], newIssues: 1 }),
]

describe('release facets', () => {
  test('toggling a value adds it, toggling again drops it, an empty list leaves the URL', () => {
    expect(toggled(undefined, '1')).toBe('1')
    expect(toggled('1', '2')).toBe('1,2')
    expect(toggled('1,2', '1')).toBe('2')
    expect(toggled('2', '2')).toBeUndefined()
  })

  test('project, environment, search and the new-issues tab narrow together', () => {
    const ids = (tab: number, filters: Parameters<typeof releaseFilterOf>[1]) =>
      filterReleases(RELEASES, releaseFilterOf(tab, filters)).map((r) => r.id)
    expect(ids(0, {})).toEqual(['a', 'b', 'c'])
    expect(ids(0, { project: '1' })).toEqual(['a', 'c'])
    expect(ids(0, { environment: 'production,staging' })).toEqual(['a', 'c'])
    expect(ids(0, { q: 'WEB@' })).toEqual(['a', 'b'])
    expect(ids(1, {})).toEqual(['b', 'c'])
    expect(ids(1, { project: '1' })).toEqual(['c'])
  })

  test('facet options count releases, most common first', () => {
    const facets = facetsOf(RELEASES, (id) => `p${id}`)
    expect(facets.projects).toEqual([
      { value: '1', label: 'p1', count: 2 },
      { value: '2', label: 'p2', count: 1 },
    ])
    expect(facets.environments.map((option) => option.value)).toEqual(['production', 'staging'])
  })

  test('new errors read red, other new issues amber, none quiet', () => {
    expect(newIssueTone({ newIssues: 2, newErrors: 1 })).toBe('error')
    expect(newIssueTone({ newIssues: 1, newErrors: 0 })).toBe('warning')
    expect(newIssueTone({ newIssues: 0, newErrors: 0 })).toBe('neutral')
  })
})
