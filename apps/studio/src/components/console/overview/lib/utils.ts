import type { RecentTriageActivity } from '@/integrations/studio-api'
import type {
  OverviewRange,
  WhiskersInstance,
  WhiskersOverview,
  WhiskersReview,
} from '@/integrations/whiskers'
import type { ConsoleItem } from '../../shared/console-model'
import type {
  ChartPoint,
  FeedEntry,
  IssueTitles,
  OverviewSearch,
  OverviewSearchInput,
  OverviewSignals,
  OverviewStat,
} from './types'
import { ACTIVITY_VERBS, DEFAULT_RANGE, RANGE_OPTIONS, REVIEW_VERBS, WHISKERS_NAME } from './values'

const HOUR_MS = 60 * 60 * 1000

export function parseOverviewSearch(search: OverviewSearchInput): OverviewSearch {
  return {
    range: RANGE_OPTIONS.find((option) => option.value === search.range)?.value ?? DEFAULT_RANGE,
  }
}

export function rangeLong(range: OverviewRange): string {
  return RANGE_OPTIONS.find((option) => option.value === range)?.long ?? range
}

export function greetingFor(name: string | undefined, now = new Date()): string {
  const hour = now.getHours()
  const part = hour < 5 ? 'evening' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
  const first = name?.trim().split(/\s+/)[0]
  return first ? `Good ${part}, ${first}` : `Good ${part}`
}

/** Ranged numbers come from the overview; blocking reviews and alerts are what holds right now. */
export function statsFor(
  range: OverviewRange,
  overview: WhiskersOverview | undefined,
  signals: OverviewSignals,
): OverviewStat[] {
  const totals = overview?.totals
  const series = overview?.series ?? []
  const column = (key: keyof (typeof series)[number]) => series.map((bucket) => Number(bucket[key]))
  const within = `in ${range}`
  return [
    {
      key: 'unresolved',
      label: 'Unresolved issues',
      value: totals?.unresolved ?? 0,
      hint: 'open right now',
      tone: 'error',
    },
    {
      key: 'new',
      label: 'New issues',
      value: totals?.newIssues ?? 0,
      hint: `first seen ${within}`,
      tone: 'warning',
      trend: column('newIssues'),
    },
    {
      key: 'regressions',
      label: 'Regressions',
      value: totals?.regressions ?? 0,
      hint: `came back ${within}`,
      tone: 'error',
      trend: column('regressions'),
    },
    {
      key: 'events',
      label: 'Error events',
      value: totals?.events ?? 0,
      hint: `ingested ${within}`,
      tone: 'info',
      trend: column('events'),
      isCompact: true,
    },
    {
      key: 'reviews',
      label: 'Reviews run',
      value: totals?.reviews ?? 0,
      hint: `pushes reviewed ${within}`,
      tone: 'info',
      trend: column('reviews'),
    },
    {
      key: 'blocking',
      label: 'Blocking reviews',
      value: signals.blockingReviews,
      hint: 'pull requests waiting on changes',
      tone: signals.blockingReviews > 0 ? 'warning' : 'neutral',
    },
    {
      key: 'failed',
      label: 'Failed reviews',
      value: totals?.failedReviews ?? 0,
      hint: `could not finish ${within}`,
      tone: 'warning',
      trend: column('failedReviews'),
    },
    {
      key: 'alerts',
      label: 'Alerts firing',
      value: signals.alertsFiring,
      hint: `${signals.alertsArmed} armed`,
      tone: signals.alertsFiring > 0 ? 'error' : 'neutral',
    },
  ]
}

function bucketLabel(bucket: Date, stepMs: number): string {
  if (stepMs <= HOUR_MS) {
    return bucket.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  }
  if (stepMs < HOUR_MS * 24) {
    return bucket.toLocaleString(undefined, { weekday: 'short', hour: '2-digit' })
  }
  return bucket.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function chartPoints(overview: WhiskersOverview | undefined): ChartPoint[] {
  if (!overview) return []
  return overview.series.map((bucket) => ({
    label: bucketLabel(bucket.bucket, overview.stepMs),
    events: bucket.events,
    newIssues: bucket.newIssues,
  }))
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function activityIssueIds(activity: RecentTriageActivity[]): string[] {
  const ids = activity
    .filter((entry) => entry.itemKind === 'issue' && UUID.test(entry.itemRef))
    .map((entry) => entry.itemRef)
  return [...new Set(ids)].sort()
}

function activityEntry(entry: RecentTriageActivity, titles: IssueTitles): FeedEntry {
  const isIssue = entry.itemKind === 'issue'
  const isWhiskers = entry.actorUserId === null
  return {
    id: `activity:${entry.id}`,
    at: entry.createdAt,
    actor: {
      name: isWhiskers ? WHISKERS_NAME : (entry.actorName ?? 'Former member'),
      image: entry.actorImage,
      isWhiskers,
    },
    verb: ACTIVITY_VERBS[entry.kind] ?? entry.kind,
    subject: isIssue
      ? (titles.get(entry.itemRef) ?? `issue ${entry.itemRef.slice(0, 8)}`)
      : `${entry.scope}${entry.itemRef.startsWith('#') ? '' : ' '}${entry.itemRef}`,
    tone: entry.kind === 'regressed' ? 'error' : entry.kind === 'resolved' ? 'resolved' : 'neutral',
    link: isIssue ? { kind: 'issue', issueId: entry.itemRef } : null,
  }
}

function reviewEntry(review: WhiskersReview): FeedEntry | null {
  if (review.status !== 'completed' && review.status !== 'failed') return null
  const verdict = review.status === 'failed' ? 'failed' : (review.verdict ?? 'comment')
  const slug = `${review.owner}/${review.repo}`
  return {
    id: `review:${review.id}`,
    at: review.completedAt ?? review.createdAt,
    actor: { name: WHISKERS_NAME, image: null, isWhiskers: true },
    verb: REVIEW_VERBS[verdict],
    subject: `${slug}#${review.prNumber}${review.title ? ` · ${review.title}` : ''}`,
    tone:
      verdict === 'failed' || verdict === 'request_changes'
        ? 'warning'
        : verdict === 'approve'
          ? 'resolved'
          : 'info',
    link: { kind: 'external', href: `https://github.com/${slug}/pull/${review.prNumber}` },
  }
}

/** Humans' decisions, whiskers' regressions and finished reviews, as one newest-first stream. */
export function toFeedEntries(
  activity: RecentTriageActivity[],
  reviews: WhiskersReview[],
  titles: IssueTitles,
  limit: number,
): FeedEntry[] {
  return [
    ...activity.map((entry) => activityEntry(entry, titles)),
    ...reviews.flatMap((review) => reviewEntry(review) ?? []),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, limit)
}

export function isBlockingReview(item: ConsoleItem): boolean {
  return item.kind === 'review' && item.badge !== 'FAILED' && item.severity === 'critical'
}

/** Loudest first: firing alerts, regressions, spikes, blocked or failed reviews, then new. */
export function attentionRank(item: ConsoleItem): number {
  if (item.kind === 'alert') return 0
  const badges = item.issue?.badges ?? []
  if (badges.includes('regressed')) return 1
  if (badges.includes('spiking')) return 2
  if (item.kind === 'review') return 3
  return item.issue ? 4 : 5
}

export function rankAttention(items: ConsoleItem[]): ConsoleItem[] {
  return [...items].sort(
    (a, b) =>
      attentionRank(a) - attentionRank(b) || (b.at?.getTime() ?? 0) - (a.at?.getTime() ?? 0),
  )
}

/** No review and no error event yet: the dashboard would be all zeros, so setup leads instead. */
export function isFreshInstance(worker: WhiskersInstance | undefined): boolean {
  if (!worker) return false
  const rows = (table: string) => worker.stores.find((store) => store.table === table)?.rows ?? 0
  return rows('review') === 0 && rows('event') === 0
}
