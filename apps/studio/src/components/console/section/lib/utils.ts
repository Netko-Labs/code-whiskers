import type { WhiskersReview } from '@/integrations/whiskers'
import { formatAge } from '@/shared/format-date'
import { formatDiff, latestReviewPerPullRequest } from '../../shared/console-data'
import type { PillTone, SectionCell } from '../../shared/console-model'

export type PullRequestRow = {
  review: WhiskersReview
  slug: string
}

/** One row per pull request: the newest review wins, older pushes fall away. */
export function latestPerPullRequest(reviews: WhiskersReview[]): PullRequestRow[] {
  return latestReviewPerPullRequest(reviews).map((review) => ({
    review,
    slug: `${review.owner}/${review.repo}`,
  }))
}

export function verdictCell(review: WhiskersReview): SectionCell {
  if (review.status === 'failed') return { kind: 'pill', text: 'failed', tone: 'bad' }
  if (review.status !== 'completed') return { kind: 'pill', text: review.status, tone: 'neutral' }
  if (review.findingCount === 0) return { kind: 'pill', text: 'No findings', tone: 'ok' }

  const tone: PillTone = review.verdict === 'request_changes' ? 'bad' : 'warn'
  const label = review.verdict === 'request_changes' ? 'blocker' : 'suggestion'
  const plural = review.findingCount === 1 ? '' : 's'
  return { kind: 'pill', text: `${review.findingCount} ${label}${plural}`, tone }
}

export function reviewSeverityDot(review: WhiskersReview) {
  if (review.status === 'failed') return 'critical' as const
  if (review.status !== 'completed') return 'info' as const
  if (review.findingCount === 0) return 'ok' as const
  return review.verdict === 'request_changes' ? ('critical' as const) : ('warning' as const)
}

export function reviewAge(review: WhiskersReview): string {
  return formatAge(review.completedAt ?? review.createdAt)
}

export function reviewDiff(review: WhiskersReview): string {
  return formatDiff(review)
}

/** Median wall-clock time from review start to completion, as a compact label. */
export function medianReviewDuration(reviews: WhiskersReview[]): string {
  const durations = reviews
    .filter((r) => r.completedAt !== null)
    .map((r) => (r.completedAt as Date).getTime() - r.createdAt.getTime())
    .filter((ms) => ms > 0)
    .sort((a, b) => a - b)
  if (durations.length === 0) return '—'

  const middle = durations[Math.floor(durations.length / 2)] ?? 0
  const seconds = Math.round(middle / 1000)
  return seconds < 90 ? `${seconds}s` : `${Math.round(seconds / 60)}m`
}
