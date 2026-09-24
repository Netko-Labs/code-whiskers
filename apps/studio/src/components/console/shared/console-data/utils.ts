import type { TriageItemRef, TriageRecord } from '@/integrations/studio-api'
import type { WhiskersIssue, WhiskersLogPattern, WhiskersReview } from '@/integrations/whiskers'
import { formatAge } from '@/shared/format-date'
import type { ConsoleItem, ConsoleSeverity, TriageBucket, TriageStatus } from '../console-model'

const ISSUE_SEVERITY: Record<string, ConsoleSeverity> = {
  fatal: 'critical',
  error: 'critical',
  warning: 'warning',
  info: 'info',
}

const VERDICT_SEVERITY: Record<string, ConsoleSeverity> = {
  request_changes: 'critical',
  comment: 'warning',
  approve: 'ok',
}

const NO_READ = 'Whiskers has not written a read for this one yet.'

function shortId(id: string) {
  return id.slice(0, 8)
}

export function issueToConsoleItem(issue: WhiskersIssue): ConsoleItem {
  const resolved = issue.status === 'resolved'
  const severity = resolved ? 'ok' : (ISSUE_SEVERITY[issue.level] ?? 'warning')
  const events = issue.eventCount.toLocaleString()

  const scope = `project:${issue.projectId}`

  return {
    id: `${scope}/${issue.id}`,
    handle: shortId(issue.id),
    triage: { scope, itemKind: 'issue', itemRef: issue.id },
    sourceId: issue.id,
    at: issue.lastSeen,
    kind: 'error',
    label: resolved ? 'Resolved' : issue.level,
    severity,
    age: formatAge(issue.lastSeen),
    title: issue.title,
    subtitle: `${issue.projectId} · ${issue.level} · first seen ${formatAge(issue.firstSeen)} ago`,
    meta: `${events} events`,
    events,
    users: '—',
    badge: resolved ? 'RESOLVED' : issue.level.toUpperCase(),
    badge2: '',
    confidence: 'from ingest',
    read: NO_READ,
    fixLabel: '',
    evidenceLabel: '',
    tags: [
      { key: 'project', value: issue.projectId },
      { key: 'level', value: issue.level },
      { key: 'status', value: issue.status },
      { key: 'fingerprint', value: shortId(issue.fingerprint) },
    ],
  }
}

export function reviewToConsoleItem(review: WhiskersReview): ConsoleItem {
  const failed = review.status === 'failed'
  const severity = failed
    ? 'critical'
    : review.verdict
      ? (VERDICT_SEVERITY[review.verdict] ?? 'info')
      : 'info'
  const slug = `${review.owner}/${review.repo}`
  const findings = review.findingCount
  // Cheap models drop `summary`, so it arrives as an empty string rather than null.
  const summary = review.summary?.trim()

  const handle = `#${review.prNumber}`

  return {
    id: `${slug}${handle}`,
    handle,
    triage: { scope: slug, itemKind: 'review', itemRef: handle },
    sourceId: review.id,
    url: `https://github.com/${slug}/pull/${review.prNumber}`,
    commit: review.headSha,
    at: review.completedAt ?? review.createdAt,
    kind: 'review',
    label: failed ? 'Review failed' : `Review · #${review.prNumber}`,
    severity,
    age: formatAge(review.completedAt ?? review.createdAt),
    title:
      review.title ?? (summary ? (summary.split('\n')[0] ?? slug) : `${slug}#${review.prNumber}`),
    subtitle: `${slug} · ${review.headSha.slice(0, 7)}`,
    meta: failed ? 'review failed' : findings === 0 ? 'no findings' : `${findings} findings`,
    badge: failed ? 'FAILED' : 'REVIEW',
    badge2: findings === 0 ? 'NO FINDINGS' : `${findings} FINDING${findings === 1 ? '' : 'S'}`,
    confidence: review.model ?? 'whiskers',
    read: summary || NO_READ,
    fixLabel: '',
    evidenceLabel: '',
    author: review.author ?? review.owner,
    fileCount: '—',
    diff: formatDiff(review),
    checks: review.status,
    files: [],
    hunk: [],
  }
}

export function formatDiff(review: WhiskersReview): string {
  if (review.additions === null && review.deletions === null) return '—'
  return `+${(review.additions ?? 0).toLocaleString()} −${(review.deletions ?? 0).toLocaleString()}`
}

/** One row per pull request: every push gets a review, the newest one speaks for the PR. */
export function latestReviewPerPullRequest(reviews: WhiskersReview[]): WhiskersReview[] {
  const newest = new Map<string, WhiskersReview>()
  for (const review of reviews) {
    const key = `${review.owner}/${review.repo}#${review.prNumber}`.toLowerCase()
    const seen = newest.get(key)
    if (!seen || review.createdAt > seen.createdAt) newest.set(key, review)
  }
  return [...newest.values()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export function triageKey(ref: TriageItemRef): string {
  return `${ref.scope.toLowerCase()}|${ref.itemKind}|${ref.itemRef}`
}

/** The dismissal key the reviewer matches on: file and title survive a re-review, ids do not. */
export function findingRef(scope: string, finding: { file: string; title: string }): TriageItemRef {
  return { scope, itemKind: 'finding', itemRef: `${finding.file}:${finding.title}` }
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const letters = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : [name.slice(0, 2)]
  return letters
    .map((part) => part?.[0] ?? '')
    .join('')
    .toUpperCase()
}

const UNDECIDED: TriageStatus = {
  resolved: false,
  regressed: false,
  approved: false,
  tracked: false,
  snoozedUntil: null,
  assigneeUserId: null,
  decidedAt: null,
  done: false,
}

export function statusFor(
  item: ConsoleItem,
  records: Map<string, TriageRecord>,
  now = new Date(),
): TriageStatus {
  const record = item.triage ? records.get(triageKey(item.triage)) : undefined
  if (!record) return UNDECIDED
  const regressed =
    record.status === 'resolved' &&
    item.kind === 'error' &&
    !!item.at &&
    item.at.getTime() > record.updatedAt.getTime()
  const resolved = record.status === 'resolved' && !regressed
  const approved = record.status === 'approved'
  const tracked = record.status === 'tracked'
  const isSnoozing =
    record.status === 'snoozed' && record.snoozedUntil !== null && record.snoozedUntil > now
  return {
    resolved,
    regressed,
    approved,
    tracked,
    snoozedUntil: isSnoozing ? record.snoozedUntil : null,
    assigneeUserId: record.assigneeUserId,
    decidedAt: record.updatedAt,
    done: resolved || approved || tracked,
  }
}

/** Inbox hides running snoozes; Assigned is the viewer's; Snoozed is only running snoozes. */
export function inBucket(
  status: TriageStatus,
  bucket: TriageBucket,
  viewerId: string | undefined,
): boolean {
  if (bucket === 'assigned') return !!viewerId && status.assigneeUserId === viewerId
  if (bucket === 'snoozed') return status.snoozedUntil !== null
  return status.snoozedUntil === null
}

const LOG_AXIS = ['-24h', '-18h', '-12h', '-6h', 'now']

function logLevel(level: string): 'ERROR' | 'WARN' | 'INFO' {
  if (level === 'ERROR' || level === 'FATAL') return 'ERROR'
  return level === 'WARN' ? 'WARN' : 'INFO'
}

/** One triage item per error-log shape: what it says, where, and how often across the day. */
export function logPatternToConsoleItem(pattern: WhiskersLogPattern): ConsoleItem {
  const scope = `project:${pattern.projectId}`
  const peak = Math.max(1, ...pattern.hourly)
  const lastHour = pattern.hourly[pattern.hourly.length - 1] ?? 0
  return {
    id: `${scope}/log:${pattern.hash}`,
    handle: `log ${pattern.hash.slice(0, 6)}`,
    triage: { scope, itemKind: 'log', itemRef: pattern.hash },
    at: pattern.lastSeen,
    kind: 'log',
    label: `Logs · ${pattern.service}`,
    severity: lastHour > 0 ? 'critical' : 'warning',
    age: formatAge(pattern.lastSeen),
    title: pattern.pattern,
    subtitle: `${pattern.service} · project ${pattern.projectId} · first ${formatAge(pattern.firstSeen)} ago`,
    meta: `${pattern.count} ${pattern.count === 1 ? 'line' : 'lines'} in 24h`,
    badge: 'LOG PATTERN',
    badge2: `${pattern.count} ${pattern.count === 1 ? 'LINE' : 'LINES'}`,
    confidence: 'grouped by message shape',
    read: `${pattern.count} error lines from ${pattern.service} share this shape; ${lastHour} in the last hour.`,
    fixLabel: '',
    evidenceLabel: '',
    metricLabel: 'Matching lines per hour',
    metricSub: 'last 24 hours',
    metric: pattern.count.toLocaleString(),
    metricDelta: lastHour ? `${lastHour} this hour` : 'quiet this hour',
    matchCount: `${pattern.samples.length} newest of ${pattern.count}`,
    bars: pattern.hourly.map((count) => ({
      percent: Math.round((count / peak) * 100),
      hot: count === peak && count > 0,
    })),
    axis: LOG_AXIS,
    lines: pattern.samples.map((line) => ({
      time: line.timestamp.toLocaleTimeString(undefined, { hour12: false }),
      level: logLevel(line.level),
      message: line.message,
    })),
  }
}
