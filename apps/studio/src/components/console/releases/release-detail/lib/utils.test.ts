import { describe, expect, test } from 'bun:test'
import type { WhiskersDeployEntry } from '@/integrations/whiskers'
import type { ReleaseSearchInput } from './types'
import { deployGroupsOf, parseReleaseSearch } from './utils'

const parse = (input: Record<string, string>) => parseReleaseSearch(input as ReleaseSearchInput)

const deploy = (
  id: string,
  environment: string,
  day: number,
  isThisRelease = false,
): WhiskersDeployEntry => ({
  id,
  releaseId: isThisRelease ? 'this' : 'other',
  environment,
  deployedAt: new Date(Date.UTC(2026, 9, day)),
  url: null,
  name: null,
  version: id,
  isActive: false,
  isThisRelease,
})

describe('release search', () => {
  test('an unknown tab falls back to the overview; the project is kept as given', () => {
    expect(parse({ project: ' 7 ', tab: 'nope' })).toEqual({
      project: '7',
      tab: 'overview',
    })
    expect(parse({ tab: 'deploys' })).toEqual({ project: '', tab: 'deploys' })
  })
})

describe('deploy groups', () => {
  test('environments this release reached lead, each newest first', () => {
    const groups = deployGroupsOf([
      deploy('p1', 'production', 1),
      deploy('s1', 'staging', 3, true),
      deploy('p2', 'production', 2),
    ])
    expect(groups.map((group) => group.environment)).toEqual(['staging', 'production'])
    expect(groups[1]?.deploys.map((d) => d.id)).toEqual(['p2', 'p1'])
  })

  test('without this release anywhere, the most recently deployed environment leads', () => {
    const groups = deployGroupsOf([deploy('p1', 'production', 1), deploy('s1', 'staging', 4)])
    expect(groups.map((group) => group.environment)).toEqual(['staging', 'production'])
  })
})
