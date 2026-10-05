import type { WhiskersFinding, WhiskersReview } from '@/integrations/whiskers'
import type { FileGroup, FindingClaim, ReviewedFinding } from '../types'
import { LINE_WINDOW, NEARBY_TITLE, SAME_TITLE, SEVERITY_RANK, TITLE_STOPWORDS } from '../values'
import { isPartialReview } from './format'

function titleWords(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[`'"()[\]{}.,:;!?]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !TITLE_STOPWORDS.has(word)),
  )
}

export function titleSimilarity(a: string, b: string): number {
  const left = titleWords(a)
  const right = titleWords(b)
  if (left.size === 0 || right.size === 0)
    return a.trim().toLowerCase() === b.trim().toLowerCase() ? 1 : 0
  let shared = 0
  for (const word of left) if (right.has(word)) shared += 1
  return shared / (left.size + right.size - shared)
}

/** Same file, and either a similar title or a looser one a few lines away. */
export function isSameFinding(a: FindingClaim, b: FindingClaim): boolean {
  if (a.file !== b.file) return false
  const score = titleSimilarity(a.title, b.title)
  if (score >= SAME_TITLE) return true
  const isNearby = a.line !== null && b.line !== null && Math.abs(a.line - b.line) <= LINE_WINDOW
  return isNearby && score >= NEARBY_TITLE
}

/** A complete full read vouches for what it no longer reports; a delta or partial one does not. */
function isFullRead(push: WhiskersReview): boolean {
  return push.diffScope === 'full' && !isPartialReview(push.summary)
}

/** The push whose findings a page shows: the chosen one once done, else the last done before it. */
export function basisPush(
  pushes: WhiskersReview[],
  selectedId: string,
): WhiskersReview | undefined {
  const selected = pushes.find((push) => push.id === selectedId)
  if (!selected) return undefined
  if (selected.status === 'completed') return selected
  return pushes
    .filter((push) => push.status === 'completed' && push.createdAt < selected.createdAt)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
}

/**
 * Every finding as of `basis`: its own are open; an earlier push's finding nobody re-reported is
 * resolved when a complete full read came after it, outdated when only deltas did.
 */
export function findingsAsOf(
  pushes: WhiskersReview[],
  findings: WhiskersFinding[],
  basis: WhiskersReview,
  isDismissed: (finding: WhiskersFinding) => boolean,
): ReviewedFinding[] {
  const done = pushes
    .filter((push) => push.status === 'completed' && push.createdAt <= basis.createdAt)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  const result: ReviewedFinding[] = findings
    .filter((finding) => finding.reviewId === basis.id)
    .map((finding) => ({ finding, status: 'open', reportedBy: basis, settledBy: null }))

  done.forEach((push, index) => {
    if (push.id === basis.id) return
    const later = done.slice(0, index).reverse()
    const settledBy = later.find(isFullRead) ?? later[0] ?? null
    for (const finding of findings) {
      if (finding.reviewId !== push.id) continue
      if (result.some((known) => isSameFinding(known.finding, finding))) continue
      const status = later.some(isFullRead) ? 'resolved' : 'outdated'
      result.push({ finding, status, reportedBy: push, settledBy })
    }
  })

  return result.map((entry) =>
    isDismissed(entry.finding) ? { ...entry, status: 'dismissed' } : entry,
  )
}

/** Findings a push raised that the done push before it did not. */
export function newFindingCount(
  push: WhiskersReview,
  previous: WhiskersReview | undefined,
  findings: WhiskersFinding[],
): number {
  const own = findings.filter((finding) => finding.reviewId === push.id)
  if (!previous) return own.length
  const before = findings.filter((finding) => finding.reviewId === previous.id)
  return own.filter((finding) => !before.some((prior) => isSameFinding(prior, finding))).length
}

/** Files ordered by their worst finding, then by how many; findings by severity, then line. */
export function groupByFile(entries: ReviewedFinding[]): FileGroup[] {
  const byFile = new Map<string, ReviewedFinding[]>()
  for (const entry of entries) {
    byFile.set(entry.finding.file, [...(byFile.get(entry.finding.file) ?? []), entry])
  }
  return [...byFile.entries()]
    .map(([file, list]) => {
      const sorted = [...list].sort(
        (a, b) =>
          SEVERITY_RANK[a.finding.severity] - SEVERITY_RANK[b.finding.severity] ||
          (a.finding.line ?? 0) - (b.finding.line ?? 0),
      )
      return { file, findings: sorted, worst: sorted[0]?.finding.severity ?? 'low' }
    })
    .sort(
      (a, b) =>
        SEVERITY_RANK[a.worst] - SEVERITY_RANK[b.worst] ||
        b.findings.length - a.findings.length ||
        a.file.localeCompare(b.file),
    )
}
