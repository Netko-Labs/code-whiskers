import { describe, expect, test } from 'bun:test'
import type { Repository } from '@/integrations/studio-api'
import type { WhiskersReview } from '@/integrations/whiskers'
import { groupByOwner, isOnTab, repositoryRows } from './utils'

const DAY = 24 * 60 * 60 * 1000
const NOW = new Date(100 * DAY)

function repo(id: number, owner: string, name: string, isWatched = true): Repository {
  return {
    id,
    installationId: 1,
    owner,
    name,
    isPrivate: false,
    isWatched,
    language: 'TypeScript',
    defaultBranch: 'main',
    pushedAt: null,
    syncedAt: new Date(0),
  }
}

function review(prNumber: number, daysAgo: number, high: number): WhiskersReview {
  const at = new Date(NOW.getTime() - daysAgo * DAY)
  return {
    id: `r${prNumber}`,
    owner: 'Acme',
    repo: 'web',
    prNumber,
    headSha: `s${prNumber}`,
    headRef: null,
    title: null,
    author: null,
    additions: null,
    deletions: null,
    status: 'completed',
    verdict: high ? 'request_changes' : 'approve',
    summary: null,
    model: null,
    diffScope: 'full',
    deltaFrom: null,
    inputTokens: null,
    outputTokens: null,
    reasoningTokens: null,
    createdAt: at,
    completedAt: at,
    findingCount: high,
    findingsBySeverity: { critical: 0, high, medium: 0, low: 0 },
  }
}

describe('repositoryRows', () => {
  test('blockers count only recently active pull requests', () => {
    const [web] = repositoryRows([repo(1, 'acme', 'web')], [review(1, 2, 2), review(2, 30, 5)], NOW)
    expect(web?.reviews).toBe(2)
    expect(web?.pullRequests).toBe(2)
    expect(web?.openBlockers).toBe(2)
    expect(web?.lastPullRequest?.prNumber).toBe(1)
  })

  test('watched repositories lead their owner group', () => {
    const rows = repositoryRows(
      [repo(1, 'b', 'one', false), repo(2, 'b', 'two'), repo(3, 'a', 'three')],
      [],
      NOW,
    )
    const groups = groupByOwner(rows)
    expect(groups.map((group) => group.owner)).toEqual(['a', 'b'])
    expect(groups[1]?.rows.map((row) => row.repository.name)).toEqual(['two', 'one'])
    expect(rows.filter((row) => isOnTab(row, 'paused'))).toHaveLength(1)
  })
})
