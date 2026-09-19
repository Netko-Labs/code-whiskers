import type { WhiskersIssue, WhiskersReview } from '@/integrations/whiskers'
import { formatAge } from '@/shared/format-date'
import type { ConsoleItem, ConsoleSeverity } from '../console-model'

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

  return {
    id: shortId(issue.id),
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
    fixLabel: 'Open suggested fix',
    evidenceLabel: 'Show recent events',
    tags: [
      { key: 'project', value: issue.projectId },
      { key: 'level', value: issue.level },
      { key: 'status', value: issue.status },
      { key: 'fingerprint', value: shortId(issue.fingerprint) },
    ],
    fix: {
      title: 'No patch yet',
      subtitle: 'Whiskers needs a linked repository to suggest one',
      note: 'Connect the repository this project ships from and Whiskers will write a patch against the failing frame.',
      file: issue.fingerprint,
      cta: 'Connect repository',
      hunk: [],
      steps: ['connect a repository', 're-run the review on the suspect commit'],
    },
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

  return {
    id: `#${review.prNumber}`,
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
    read: summary ?? NO_READ,
    fixLabel: 'Open on GitHub',
    evidenceLabel: 'Show findings',
    author: review.author ?? review.owner,
    fileCount: '—',
    diff: formatDiff(review),
    checks: review.status,
    files: [],
    hunk: [],
    fix: {
      title: 'Findings',
      subtitle: `${slug}#${review.prNumber}`,
      note: 'Open the review on GitHub to see every finding Whiskers posted inline.',
      file: `${slug}#${review.prNumber}`,
      cta: 'Open on GitHub',
      hunk: [],
      steps: ['review the inline comments', 'resolve or dismiss each finding'],
    },
  }
}

export function formatDiff(review: WhiskersReview): string {
  if (review.additions === null && review.deletions === null) return '—'
  return `+${(review.additions ?? 0).toLocaleString()} −${(review.deletions ?? 0).toLocaleString()}`
}
