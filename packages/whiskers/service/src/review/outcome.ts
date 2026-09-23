import { createLogger } from '@code-whiskers/logger'
import type { TokenTally } from '../shared/llm'
import { splitChunk } from './chunk'
import { mergeReviews, reviewChunk } from './llm'
import type { ChunkOutcome, ReviewOutcome } from './types'

const logger = createLogger('whiskers-review')

// A malformed sample counts as transient too: cheap models emit unparseable JSON
// a few percent of the time, and a fresh sample almost always parses.
const TRANSIENT_ERROR =
  /timed out|timeout|abort|429|5\d\d|overloaded|rate limit|no object generated|could not parse|did not match schema/i
// A timeout says the prompt was too big for the window, not that the provider is
// unwell — the same chunk will time out again, so that retry splits instead.
const TIMEOUT_ERROR = /timed out|timeout|abort/i
const MAX_ATTEMPTS = 3
const RETRY_BASE_MS = 1_500
// Halving twice turns one 24k chunk into four; past that the timeout is not size.
const MAX_SPLIT_DEPTH = 2
const NOTHING_REVIEWABLE =
  'Nothing reviewable changed — the diff is empty or only touches skipped files (lockfiles, generated or vendored code, binaries).'

/** Full jitter — four chunks retrying in lockstep would re-create the congestion. */
function backoffMs(attempt: number): number {
  const ceiling = RETRY_BASE_MS * 2 ** (attempt - 1)
  return Math.round(ceiling * (0.5 + Math.random() * 0.5))
}

function combineOutcomes(outcomes: ChunkOutcome[]): ChunkOutcome {
  const usable = outcomes.flatMap((o) => (o.review ? [o.review] : []))
  return {
    review: usable.length > 0 ? mergeReviews(usable) : null,
    reviewed: outcomes.reduce((sum, o) => sum + o.reviewed, 0),
    attempted: outcomes.reduce((sum, o) => sum + o.attempted, 0),
  }
}

/**
 * Up to three attempts per chunk with jittered backoff. A chunk that still
 * fails resolves to a `null` review rather than throwing: one unlucky section
 * must not discard the findings from every other one.
 */
export async function reviewChunkWithRetry(
  chunk: string,
  context: string,
  tokens: TokenTally,
  depth = 0,
): Promise<ChunkOutcome> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return { review: await reviewChunk(chunk, context, tokens), reviewed: 1, attempted: 1 }
    } catch (error) {
      const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
      const last = attempt === MAX_ATTEMPTS
      if (!TRANSIENT_ERROR.test(message) || last) {
        logger.warn({ err: message, attempt }, 'chunk failed — skipping this section')
        return { review: null, reviewed: 0, attempted: 1 }
      }

      if (TIMEOUT_ERROR.test(message) && depth < MAX_SPLIT_DEPTH) {
        const halves = splitChunk(chunk)
        if (halves.length > 1) {
          logger.warn({ attempt, depth, chars: chunk.length }, 'chunk timed out — splitting')
          return combineOutcomes(
            await Promise.all(
              halves.map((half) => reviewChunkWithRetry(half, context, tokens, depth + 1)),
            ),
          )
        }
      }

      await new Promise((resolve) => setTimeout(resolve, backoffMs(attempt)))
      logger.warn({ err: message, attempt }, 'transient chunk failure — retrying')
    }
  }
  return { review: null, reviewed: 0, attempted: 1 }
}

/**
 * No chunks means nothing reviewable, which approves. Every section failing is
 * a real failure; some failing is a partial review, and a partial review beats
 * telling the author to push again for nothing.
 */
export function resolveOutcome(outcomes: ChunkOutcome[]): ReviewOutcome {
  if (outcomes.length === 0) {
    return {
      review: { findings: [], summary: NOTHING_REVIEWABLE, verdict: 'approve' },
      coverage: { reviewed: 0, total: 0 },
    }
  }

  const { review, reviewed, attempted } = combineOutcomes(outcomes)
  if (!review) throw new Error(`all ${attempted} diff sections failed to review`)
  return { review, coverage: { reviewed, total: attempted } }
}
