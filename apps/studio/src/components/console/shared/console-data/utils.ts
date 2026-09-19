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
  const severity = review.verdict ? (VERDICT_SEVERITY[review.verdict] ?? 'info') : 'info'
  const slug = `${review.owner}/${review.repo}`

  return {
    id: `#${review.prNumber}`,
    kind: 'review',
    label: `Review · #${review.prNumber}`,
    severity,
    age: formatAge(review.completedAt ?? review.createdAt),
    title: review.summary ?? `${slug}#${review.prNumber}`,
    subtitle: `${slug} · ${review.headSha.slice(0, 7)}`,
    meta: review.status === 'completed' ? (review.verdict ?? 'reviewed') : review.status,
    badge: 'REVIEW',
    badge2: review.verdict === 'approve' ? 'NO FINDINGS' : '',
    confidence: review.model ?? 'whiskers',
    read: review.summary ?? NO_READ,
    fixLabel: 'Apply suggestion',
    evidenceLabel: 'Show findings',
    author: review.owner,
    fileCount: '—',
    diff: '—',
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
