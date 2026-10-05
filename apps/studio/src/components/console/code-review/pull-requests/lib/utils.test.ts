import { describe, expect, test } from 'bun:test'
import type { WhiskersReview } from '@/integrations/whiskers'
import { summarizePullRequests } from '../../shared/review-model'
import type { PullRequestSearchInput } from './types'
import {
  filterPullRequests,
  parsePullRequestSearch,
  sortPullRequests,
  toggledList,
  verdictsOf,
} from './utils'

function review(prNumber: number, extra: Partial<WhiskersReview> = {}): WhiskersReview {
  return {
    id: `r${prNumber}`,
    owner: 'acme',
    repo: 'web',
    prNumber,
    headSha: `sha${prNumber}`,
    headRef: `branch-${prNumber}`,
    title: `Change ${prNumber}`,
    author: 'ada',
    additions: null,
    deletions: null,
    status: 'completed',
    verdict: 'approve',
    summary: null,
    model: null,
    diffScope: 'full',
    deltaFrom: null,
    inputTokens: null,
    outputTokens: null,
    reasoningTokens: null,
    createdAt: new Date(prNumber * 1000),
    completedAt: new Date(prNumber * 1000 + 1),
    findingCount: 0,
    findingsBySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
    ...extra,
  }
}

const ROWS = summarizePullRequests([
  review(1),
  review(2, { repo: 'api', author: 'grace', verdict: 'request_changes' }),
  review(3, {
    findingsBySeverity: { critical: 0, high: 3, medium: 0, low: 0 },
    findingCount: 3,
    verdict: 'request_changes',
  }),
])

describe('search params', () => {
  test('unknown values fall away', () => {
    const input = { sort: 'nope', mine: 'yes', repo: ' acme/web ' } as PullRequestSearchInput
    expect(parsePullRequestSearch(input)).toEqual({
      repo: 'acme/web',
      verdict: undefined,
      mine: undefined,
      sort: undefined,
    })
  })

  test('facets toggle in a comma list and drop out when empty', () => {
    expect(toggledList(undefined, 'a/b')).toBe('a/b')
    expect(toggledList('a/b', 'c/d')).toBe('a/b,c/d')
    expect(toggledList('a/b', 'a/b')).toBeUndefined()
    expect(verdictsOf('approved,bogus')).toEqual(['approved'])
  })
})

describe('filter and sort', () => {
  test('repository, verdict, author and text narrow the list', () => {
    const base = { repos: [], verdicts: [], author: null, query: '' }
    expect(
      filterPullRequests(ROWS, { ...base, repos: ['ACME/api'] }).map((r) => r.prNumber),
    ).toEqual([2])
    expect(
      filterPullRequests(ROWS, { ...base, verdicts: ['changes_requested'] }).map((r) => r.prNumber),
    ).toEqual([3, 2])
    expect(filterPullRequests(ROWS, { ...base, author: 'Grace' })).toHaveLength(1)
    expect(filterPullRequests(ROWS, { ...base, query: 'branch-1' })).toHaveLength(1)
  })

  test('blockers first, recency breaks ties', () => {
    expect(sortPullRequests(ROWS, 'blockers').map((r) => r.prNumber)).toEqual([3, 2, 1])
    expect(sortPullRequests(ROWS, 'activity').map((r) => r.prNumber)).toEqual([3, 2, 1])
  })
})
