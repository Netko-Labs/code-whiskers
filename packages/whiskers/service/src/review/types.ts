import type { LlmFinding, LlmReview } from '@code-whiskers/whiskers-domain'
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

export type ThreadReply = {
  author: string
  body: string
}

/** One inline comment CodeWhiskers left on this PR, and what people did with it since. */
export type PriorThread = {
  path: string
  line: number | null
  title: string
  isResolved: boolean
  replies: ThreadReply[]
}

export type Suppressed = {
  file: string
  title: string
  note: string | null
}

export type SettledFindings = {
  fresh: LlmFinding[]
  repeated: LlmFinding[]
  settled: LlmFinding[]
}

export type RunReviewOptions = {
  force?: boolean
}
