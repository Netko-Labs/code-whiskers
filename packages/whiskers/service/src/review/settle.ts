import type { LlmFinding, LlmReview } from '@code-whiskers/whiskers-domain'
import { BLOCKING_SEVERITIES } from './render'
import type { Suppression } from './suppressions'
import type { PriorClaim, PriorThread, SettledFindings, Suppressed } from './types'

// A model rewords the same finding on every run; titles are compared as word sets.
const SAME_TITLE = 0.5
const NEARBY_TITLE = 0.3
const LINE_WINDOW = 6
// The same claim re-anchored on a sibling file — the hook, then the page, then the types.
const CROSS_FILE_TITLE = 0.55
const CROSS_FILE_SHARED_DIRS = 3
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
  'their',
])

/** `matches`, `matched` and `matching` are one word to a reader. */
function stem(word: string): string {
  const base = word.replace(/['’]s$/, '')
  if (base.length > 5 && base.endsWith('ing')) return base.slice(0, -3)
  if (base.length > 4 && (base.endsWith('ed') || base.endsWith('es'))) return base.slice(0, -2)
  if (base.length > 4 && base.endsWith('s')) return base.slice(0, -1)
  return base
}

function titleWords(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[`'"()[\]{}.,:;!?]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOPWORDS.has(word))
      .map(stem),
  )
}

/**
 * One feature: both files in the same folder, or the deeper one inside the shallower one's folder
 * (at most two levels down) and named after it — `todos-example.tsx` and
 * `lib/hooks/use-todos-example.ts` are, `components/todos-example.tsx` and
 * `components/chat/chat-example.tsx` are not.
 */
function isSameFeature(a: string, b: string): boolean {
  const [shallow, deep] = a.split('/').length <= b.split('/').length ? [a, b] : [b, a]
  const shallowDirs = shallow.split('/').length - 1
  const deepDirs = deep.split('/').length - 1
  const shared = sharedDirectories(a, b)
  if (shared < CROSS_FILE_SHARED_DIRS || shared !== shallowDirs) return false
  if (deepDirs === shallowDirs) return true
  const stem = (shallow.split('/').pop() ?? '').replace(/\.[^.]+$/, '')
  const rest = deep.split('/').slice(shared).join('/')
  return deepDirs - shallowDirs <= 2 && stem.length > 2 && rest.includes(stem)
}

function sharedDirectories(a: string, b: string): number {
  const left = a.split('/').slice(0, -1)
  const right = b.split('/').slice(0, -1)
  let depth = 0
  while (depth < left.length && left[depth] === right[depth]) depth += 1
  return depth
}

export function titleSimilarity(a: string, b: string): number {
  const left = titleWords(a)
  const right = titleWords(b)
  if (left.size === 0 || right.size === 0) return 0
  let shared = 0
  for (const word of left) if (right.has(word)) shared += 1
  return shared / (left.size + right.size - shared)
}

export function isSameFinding(finding: LlmFinding, prior: PriorClaim): boolean {
  const score = titleSimilarity(finding.title, prior.title)
  if (finding.file !== prior.file) {
    return isSameFeature(finding.file, prior.file) && score >= CROSS_FILE_TITLE
  }
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
 * A finding a human already answered — resolved its thread, replied to it, reacted 👎, or dismissed
 * it in the console — is settled and never raised again. One still waiting on an answer is a repeat: kept,
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
    const isAnswered =
      thread !== undefined && (thread.isResolved || thread.isDownvoted || thread.replies.length > 0)
    if (isDismissed || isAnswered) {
      result.settled.push(finding)
    } else if (thread) {
      result.repeated.push(finding)
    } else {
      result.fresh.push(finding)
    }
  }
  return result
}

/**
 * A blocking thread from an earlier round nobody has answered, whose code has not changed since.
 * A delta review cannot see it, so it must keep the PR blocked on its own.
 */
export function openBlockers(threads: PriorThread[]): PriorThread[] {
  return threads.filter(
    (t) =>
      t.severity !== null &&
      BLOCKING_SEVERITIES.has(t.severity) &&
      !t.isResolved &&
      !t.isOutdated &&
      !t.isDownvoted &&
      t.replies.length === 0,
  )
}

/**
 * Settling can remove every blocker, so the verdict is recomputed from what is left — with the
 * same binary policy as `resolveVerdict`: a bare COMMENT review is never posted. An unanswered
 * blocker from an earlier round still blocks.
 */
export function settledVerdict(
  remaining: LlmFinding[],
  blockedBefore: PriorThread[] = [],
): LlmReview['verdict'] {
  const isBlocked =
    blockedBefore.length > 0 || remaining.some((f) => BLOCKING_SEVERITIES.has(f.severity))
  return isBlocked ? 'request_changes' : 'approve'
}

/**
 * A review that skipped sections vouches for nothing: it never approves — an approval would lift
 * the bot's own earlier block or satisfy a required review — so it keeps an earlier block, or
 * posts as a plain comment. The one exception to the approve-or-block rule.
 */
export function partialVerdict(
  verdict: LlmReview['verdict'],
  isComplete: boolean,
  previous: LlmReview['verdict'] | null,
): LlmReview['verdict'] {
  if (isComplete || verdict !== 'approve') return verdict
  return previous === 'request_changes' ? 'request_changes' : 'comment'
}
