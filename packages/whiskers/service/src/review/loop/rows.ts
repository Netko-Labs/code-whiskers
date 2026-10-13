import type { FindingInsert } from '@code-whiskers/whiskers-domain'
import type { ClosedRound, ReviewedFinding } from '../types'
import { textOrNull } from './utils'

export function findingRows(reviewId: string, findings: ReviewedFinding[]): FindingInsert[] {
  return findings.map((f) => ({
    reviewId,
    file: f.file,
    line: f.line,
    severity: f.severity,
    category: f.category,
    title: f.title,
    body: f.body,
    suggestion: f.suggestion,
    fingerprint: f.fingerprint,
    doneWhen: textOrNull(f.doneWhen),
    evidence: textOrNull(f.evidence),
    sinceRound: f.sinceRound,
    threadUrl: f.threadUrl,
  }))
}

/** Fresh findings learn their thread only once GitHub has them. */
export function withThreadUrls(loop: ClosedRound, urls: Map<string, string>): ClosedRound {
  if (urls.size === 0) return loop
  const link = (f: ReviewedFinding) => ({ ...f, threadUrl: urls.get(f.fingerprint) ?? f.threadUrl })
  return { ...loop, fresh: loop.fresh.map(link), findings: loop.findings.map(link) }
}
