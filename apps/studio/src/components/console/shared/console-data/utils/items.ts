import type {
  WhiskersIssue,
  WhiskersLogPattern,
  WhiskersProject,
  WhiskersReview,
} from '@/integrations/whiskers'
import { formatAge } from '@/shared/format-date'
import type { ConsoleItem, ConsoleSeverity } from '../../console-model'

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

function projectLabel(projectId: string, project: WhiskersProject | undefined): string {
  return project?.name ?? `project ${projectId}`
}

export function issueToConsoleItem(
  issue: WhiskersIssue,
  project: WhiskersProject | undefined,
): ConsoleItem {
  const isOpen = issue.status === 'unresolved'
  const severity = isOpen ? (ISSUE_SEVERITY[issue.level] ?? 'warning') : 'ok'
  const name = projectLabel(issue.projectId, project)
  const scope = `project:${issue.projectId}`
  const where = issue.culprit ? ` · ${issue.culprit}` : ''

  return {
    id: `${scope}/${issue.id}`,
    handle: shortId(issue.id),
    triage: { scope, itemKind: 'issue', itemRef: issue.id },
    sourceId: issue.id,
    at: issue.lastSeen,
    kind: 'error',
    repository: project?.repository ?? null,
    projectId: issue.projectId,
    scopeLabel: name,
    label: issue.level,
    severity,
    age: formatAge(issue.lastSeen),
    title: issue.title,
    subtitle: `${name} · ${issue.level}${where}`,
    meta: `${issue.eventCount.toLocaleString()} events`,
    badge: issue.level.toUpperCase(),
    badge2: '',
    confidence: 'from ingest',
    read: NO_READ,
    fixLabel: '',
    evidenceLabel: '',
    issue,
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
    repository: slug,
    scopeLabel: review.repo,
    label: failed ? 'Review failed' : `Review · #${review.prNumber}`,
    severity,
    age: formatAge(review.completedAt ?? review.createdAt),
    title:
      review.title ?? (summary ? (summary.split('\n')[0] ?? slug) : `${slug}#${review.prNumber}`),
    subtitle: `${review.author ?? review.owner} · ${review.headSha.slice(0, 7)} · ${formatDiff(review)}`,
    meta: failed ? 'review failed' : findings === 0 ? 'no findings' : `${findings} findings`,
    badge: failed ? 'FAILED' : 'REVIEW',
    badge2: findings === 0 ? 'NO FINDINGS' : `${findings} FINDING${findings === 1 ? '' : 'S'}`,
    confidence: review.model ?? 'whiskers',
    read: summary
      ? summary
          .split('\n')
          .filter((line) => line.trim())
          .map((line) => `• ${line.trim()}`)
          .join('\n')
      : NO_READ,
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

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const letters = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : [name.slice(0, 2)]
  return letters
    .map((part) => part?.[0] ?? '')
    .join('')
    .toUpperCase()
}

const LOG_AXIS = ['-24h', '-18h', '-12h', '-6h', 'now']

function logLevel(level: string): 'ERROR' | 'WARN' | 'INFO' {
  if (level === 'ERROR' || level === 'FATAL') return 'ERROR'
  return level === 'WARN' ? 'WARN' : 'INFO'
}

/** One triage item per error-log shape: what it says, where, and how often across the day. */
export function logPatternToConsoleItem(
  pattern: WhiskersLogPattern,
  project: WhiskersProject | undefined,
): ConsoleItem {
  const scope = `project:${pattern.projectId}`
  const name = projectLabel(pattern.projectId, project)
  const peak = Math.max(1, ...pattern.hourly)
  const lastHour = pattern.hourly[pattern.hourly.length - 1] ?? 0
  return {
    id: `${scope}/log:${pattern.hash}`,
    handle: `log ${pattern.hash.slice(0, 6)}`,
    triage: { scope, itemKind: 'log', itemRef: pattern.hash },
    at: pattern.lastSeen,
    kind: 'log',
    repository: project?.repository ?? null,
    projectId: pattern.projectId,
    scopeLabel: name,
    label: `Logs · ${pattern.service}`,
    severity: lastHour > 0 ? 'critical' : 'warning',
    age: formatAge(pattern.lastSeen),
    title: pattern.pattern,
    subtitle: `${pattern.service} · ${name} · first ${formatAge(pattern.firstSeen)} ago`,
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
