import type { WhiskersReview } from '@/integrations/whiskers'
import type { PullRequestSummary, PullRequestVerdict, SeverityCounts } from '../types'
import { EMPTY_COUNTS } from '../values'

export function pullRequestKey(review: Pick<WhiskersReview, 'owner' | 'repo' | 'prNumber'>) {
  return `${review.owner}/${review.repo}#${review.prNumber}`.toLowerCase()
}

export function slugOf(review: Pick<WhiskersReview, 'owner' | 'repo'>): string {
  return `${review.owner}/${review.repo}`
}

export function pullRequestVerdict(review: WhiskersReview): PullRequestVerdict {
  if (review.status === 'pending' || review.status === 'running') return 'running'
  if (review.status === 'failed') return 'failed'
  if (review.verdict === 'approve') return 'approved'
  if (review.verdict === 'request_changes') return 'changes_requested'
  return 'commented'
}

export function blockerCount(counts: SeverityCounts): number {
  return counts.critical + counts.high
}

export function activityOf(review: WhiskersReview): Date {
  return review.completedAt ?? review.createdAt
}

/** Pushes arrive newest first or not at all ordered; each pull request keeps its newest. */
export function summarizePullRequests(reviews: WhiskersReview[]): PullRequestSummary[] {
  const byKey = new Map<string, WhiskersReview[]>()
  for (const review of reviews) {
    const key = pullRequestKey(review)
    byKey.set(key, [...(byKey.get(key) ?? []), review])
  }
  return [...byKey.entries()]
    .map(([key, pushes]) => {
      const sorted = [...pushes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      const latest = sorted[0] as WhiskersReview
      const settled = sorted.find((push) => push.status === 'completed')
      const lastActivity = sorted.reduce(
        (newest, push) => (activityOf(push) > newest ? activityOf(push) : newest),
        activityOf(latest),
      )
      return {
        key,
        slug: slugOf(latest),
        owner: latest.owner,
        repo: latest.repo,
        prNumber: latest.prNumber,
        title: sorted.find((push) => push.title)?.title ?? null,
        author: sorted.find((push) => push.author)?.author ?? null,
        latest,
        settled,
        verdict: pullRequestVerdict(latest),
        counts: settled?.findingsBySeverity ?? EMPTY_COUNTS,
        findingCount: settled?.findingCount ?? 0,
        pushes: new Set(sorted.map((push) => push.headSha)).size,
        lastActivity,
      }
    })
    .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
}

export function pullRequestUrl(slug: string, prNumber: number): string {
  return `https://github.com/${slug}/pull/${prNumber}`
}
