import type { Repository } from '@/integrations/studio-api'
import type { WhiskersReview } from '@/integrations/whiskers'
import { blockerCount, summarizePullRequests } from '../../shared/review-model'
import type { RepositoryGroup, RepositoryRow, RepositoryTab } from './types'
import { ACTIVE_WINDOW_MS } from './values'

/** Joined in the browser: the repositories are studio's, the reviews whiskers', on purpose. */
export function repositoryRows(
  repositories: Repository[],
  reviews: WhiskersReview[],
  now = new Date(),
): RepositoryRow[] {
  const pullRequests = summarizePullRequests(reviews)
  return repositories.map((repository) => {
    const slug = `${repository.owner}/${repository.name}`
    const own = pullRequests.filter((pr) => pr.slug.toLowerCase() === slug.toLowerCase())
    const active = own.filter((pr) => now.getTime() - pr.lastActivity.getTime() <= ACTIVE_WINDOW_MS)
    return {
      repository,
      slug,
      reviews: reviews.filter(
        (review) => `${review.owner}/${review.repo}`.toLowerCase() === slug.toLowerCase(),
      ).length,
      pullRequests: own.length,
      lastPullRequest: own[0],
      openBlockers: active.reduce((sum, pr) => sum + blockerCount(pr.counts), 0),
    }
  })
}

export function isOnTab(row: RepositoryRow, tab: RepositoryTab): boolean {
  if (tab === 'watched') return row.repository.isWatched
  if (tab === 'paused') return !row.repository.isWatched
  return true
}

/** Watched first, then by last review, then by name; grouped under their owner. */
export function groupByOwner(rows: RepositoryRow[]): RepositoryGroup[] {
  const sorted = [...rows].sort(
    (a, b) =>
      Number(b.repository.isWatched) - Number(a.repository.isWatched) ||
      (b.lastPullRequest?.lastActivity.getTime() ?? 0) -
        (a.lastPullRequest?.lastActivity.getTime() ?? 0) ||
      a.slug.localeCompare(b.slug),
  )
  const byOwner = new Map<string, RepositoryRow[]>()
  for (const row of sorted) {
    const owner = row.repository.owner
    byOwner.set(owner, [...(byOwner.get(owner) ?? []), row])
  }
  return [...byOwner.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([owner, list]) => ({ owner, rows: list }))
}

export function matchesRepository(row: RepositoryRow, query: string): boolean {
  const needle = query.trim().toLowerCase()
  return !needle || `${row.slug} ${row.repository.language ?? ''}`.toLowerCase().includes(needle)
}
