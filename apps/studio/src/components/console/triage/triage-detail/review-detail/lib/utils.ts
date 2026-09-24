import type { WhiskersFinding, WhiskersReview } from '@/integrations/whiskers'
import type { FileGroup, FindingSeverity, ReviewOutcome } from './types'
import { SEVERITY_ORDER, SEVERITY_RANK } from './values'

export function severityCounts(findings: WhiskersFinding[]): Record<FindingSeverity, number> {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 }
  for (const finding of findings) counts[finding.severity] += 1
  return counts
}

export function countsLabel(findings: WhiskersFinding[]): string {
  const counts = severityCounts(findings)
  return SEVERITY_ORDER.filter((severity) => counts[severity] > 0)
    .map((severity) => `${counts[severity]} ${severity}`)
    .join(' · ')
}

/** Files ordered by their worst finding, then by how many; findings by severity, then line. */
export function groupByFile(findings: WhiskersFinding[]): FileGroup[] {
  const byFile = new Map<string, WhiskersFinding[]>()
  for (const finding of findings)
    byFile.set(finding.file, [...(byFile.get(finding.file) ?? []), finding])
  return [...byFile.entries()]
    .map(([file, list]) => {
      const sorted = [...list].sort(
        (a, b) =>
          SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || (a.line ?? 0) - (b.line ?? 0),
      )
      return { file, findings: sorted, worst: sorted[0]?.severity ?? 'low' }
    })
    .sort(
      (a, b) =>
        SEVERITY_RANK[a.worst] - SEVERITY_RANK[b.worst] ||
        b.findings.length - a.findings.length ||
        a.file.localeCompare(b.file),
    )
}

export function reviewOutcome(
  review: WhiskersReview | undefined,
  open: WhiskersFinding[],
): ReviewOutcome {
  if (!review) return { tone: 'info', title: 'Sample review', note: 'Connect a repository' }
  if (review.status === 'failed')
    return { tone: 'bad', title: 'Review failed', note: 'Run it again, or read the worker logs' }
  if (review.status !== 'completed')
    return { tone: 'info', title: 'Reviewing this push…', note: 'Findings land in a minute or two' }
  if (open.length === 0)
    return { tone: 'ok', title: 'Nothing to fix', note: 'No open findings on this push' }
  const blocking = open.filter((f) => f.severity === 'critical' || f.severity === 'high').length
  return blocking > 0
    ? { tone: 'bad', title: `${blocking} to fix before merge`, note: countsLabel(open) }
    : { tone: 'warn', title: `${open.length} worth a look`, note: countsLabel(open) }
}

export function splitPath(file: string): { directory: string; name: string } {
  const at = file.lastIndexOf('/')
  return at === -1
    ? { directory: '', name: file }
    : { directory: file.slice(0, at + 1), name: file.slice(at + 1) }
}

export function readBullets(read: string): string[] {
  return read
    .split('\n')
    .map((line) => line.replace(/^\s*[•\-*]\s*/, '').trim())
    .filter(Boolean)
}

export function reviewDuration(review: WhiskersReview): string {
  if (!review.completedAt) return '—'
  const seconds = Math.round((review.completedAt.getTime() - review.createdAt.getTime()) / 1000)
  return seconds < 90 ? `${seconds}s` : `${Math.round(seconds / 60)}m`
}

export function compactCount(value: number | null): string {
  if (value === null) return '—'
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value)
}

export function blobUrl(slug: string, sha: string, file: string, line?: number | null): string {
  const anchor = line ? `#L${line}` : ''
  return `https://github.com/${slug}/blob/${sha}/${encodeURI(file)}${anchor}`
}

export function pushDot(push: WhiskersReview): string {
  if (push.status === 'failed') return 'bg-severity-error'
  if (push.status !== 'completed') return 'bg-severity-info'
  if (push.findingCount === 0) return 'bg-severity-resolved'
  return push.verdict === 'request_changes' ? 'bg-severity-error' : 'bg-severity-warning'
}
