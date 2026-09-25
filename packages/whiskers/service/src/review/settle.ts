import type { LlmFinding, LlmReview } from '@code-whiskers/whiskers-domain'
import { BLOCKING_SEVERITIES } from './render'
import type { Suppression } from './suppressions'
import type { PriorThread, SettledFindings, Suppressed } from './types'

// A model rewords the same finding on every run; titles are compared as word sets.
const SAME_TITLE = 0.5
const NEARBY_TITLE = 0.3
const LINE_WINDOW = 6
const STOPWORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'that',
  'this',
  'from',
  'into',
  'when',
  'can',
  'not',
  'are',
  'but',
  'its',
  'still',
  'may',
  'will',
  'without',
  'instead',
  'than',
  'then',
  'only',
  'now',
])

type Prior = { file: string; line: number | null; title: string }

function titleWords(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[`'"()[\]{}.,:;!?]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOPWORDS.has(word)),
  )
}

export function titleSimilarity(a: string, b: string): number {
  const left = titleWords(a)
  const right = titleWords(b)
  if (left.size === 0 || right.size === 0) return 0
  let shared = 0
  for (const word of left) if (right.has(word)) shared += 1
  return shared / (left.size + right.size - shared)
}

export function isSameFinding(finding: LlmFinding, prior: Prior): boolean {
  if (finding.file !== prior.file) return false
  const score = titleSimilarity(finding.title, prior.title)
  if (score >= SAME_TITLE) return true
  const isNearby =
    finding.line !== null &&
    prior.line !== null &&
    Math.abs(finding.line - prior.line) <= LINE_WINDOW
  return isNearby && score >= NEARBY_TITLE
}

/** Console dismissals are keyed `file:title` — the file never holds a colon, the title may. */
export function suppressedFindings(suppressions: Suppression[]): Suppressed[] {
  return suppressions
    .filter((s) => s.itemKind === 'finding')
    .map((s) => {
      const at = s.itemRef.indexOf(':')
      return { file: s.itemRef.slice(0, at), title: s.itemRef.slice(at + 1), note: s.note }
    })
    .filter((s) => s.file && s.title)
}

/**
 * A finding a human already answered — resolved its thread, replied to it, or dismissed it in the
 * console — is settled and never raised again. One still waiting on an answer is a repeat: kept,
 * but not posted a second time.
 */
export function settleFindings(
  findings: LlmFinding[],
  threads: PriorThread[],
  suppressed: Suppressed[],
): SettledFindings {
  const result: SettledFindings = { fresh: [], repeated: [], settled: [] }
  for (const finding of findings) {
    const isDismissed = suppressed.some((s) =>
      isSameFinding(finding, { file: s.file, line: null, title: s.title }),
    )
    const thread = threads.find((t) =>
      isSameFinding(finding, { file: t.path, line: t.line, title: t.title }),
    )
    if (isDismissed || thread?.isResolved || (thread && thread.replies.length > 0)) {
      result.settled.push(finding)
    } else if (thread) {
      result.repeated.push(finding)
    } else {
      result.fresh.push(finding)
    }
  }
  return result
}

/** Settling can remove every blocker; the verdict must not keep blocking on what humans closed. */
export function settledVerdict(
  verdict: LlmReview['verdict'],
  remaining: LlmFinding[],
): LlmReview['verdict'] {
  if (verdict !== 'request_changes') return verdict
  return remaining.some((f) => BLOCKING_SEVERITIES.has(f.severity)) ? verdict : 'comment'
}
