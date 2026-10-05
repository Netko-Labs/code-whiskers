import type { WhiskersReview } from '@/integrations/whiskers'
import type { PushCoverage, SeverityCounts } from '../types'
import { PARTIAL_PATTERN, SEVERITY_ORDER } from '../values'

export function shortSha(sha: string): string {
  return sha.slice(0, 7)
}

export function isPartialReview(summary: string | null): boolean {
  return !!summary && PARTIAL_PATTERN.test(summary)
}

export function pushCoverage(summary: string | null): PushCoverage | null {
  const match = summary?.match(PARTIAL_PATTERN)
  if (!match) return null
  return { skipped: Number(match[1]), total: Number(match[2]) }
}

/** The summary as bullets, without the partial-review preamble the timeline already shows. */
export function summaryLines(summary: string | null): string[] {
  if (!summary) return []
  const lines = summary.split('\n')
  const body = isPartialReview(summary) ? lines.slice(1) : lines
  return body.map((line) => line.replace(/^\s*[•\-*]\s*/, '').trim()).filter(Boolean)
}

export function countsLabel(counts: SeverityCounts): string {
  return SEVERITY_ORDER.filter((severity) => counts[severity] > 0)
    .map((severity) => `${counts[severity]} ${severity}`)
    .join(' · ')
}

export function reviewDuration(review: WhiskersReview): string | null {
  if (!review.completedAt) return null
  const seconds = Math.round((review.completedAt.getTime() - review.createdAt.getTime()) / 1000)
  return seconds < 90 ? `${seconds}s` : `${Math.round(seconds / 60)}m`
}

export function splitPath(file: string): { directory: string; name: string } {
  const at = file.lastIndexOf('/')
  return at === -1
    ? { directory: '', name: file }
    : { directory: file.slice(0, at + 1), name: file.slice(at + 1) }
}

export function blobUrl(slug: string, sha: string, file: string, line?: number | null): string {
  const anchor = line ? `#L${line}` : ''
  return `https://github.com/${slug}/blob/${sha}/${encodeURI(file)}${anchor}`
}

export function diffLabel(review: WhiskersReview): string | null {
  if (review.additions === null && review.deletions === null) return null
  return `+${(review.additions ?? 0).toLocaleString()} −${(review.deletions ?? 0).toLocaleString()}`
}
