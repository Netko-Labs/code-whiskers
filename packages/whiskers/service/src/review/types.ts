import type { LlmReview } from '@code-whiskers/whiskers-domain'
import type { ReviewCoverage } from './render'

/** `reviewed`/`attempted` count leaf sections, so a split chunk reports each half. */
export type ChunkOutcome = {
  review: LlmReview | null
  reviewed: number
  attempted: number
}

export type ReviewOutcome = {
  review: LlmReview
  coverage: ReviewCoverage
}
