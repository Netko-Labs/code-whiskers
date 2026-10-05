import type { LlmFinding, LlmReview, Review } from '@code-whiskers/whiskers-domain'
import type { ReviewCoverage, ReviewReport } from './render'

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
  severity: LlmFinding['severity'] | null
  isResolved: boolean
  isOutdated: boolean
  isDownvoted: boolean
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

export type ConventionFile = {
  path: string
  content: string
}

/** `deltaFrom` is the last reviewed commit when only what changed since it was read. */
export type PipelineResult = {
  report: ReviewReport
  merged: LlmReview
  deltaFrom: string | null
}

export type ReviewUsage = Pick<Review, 'model'> &
  Partial<Pick<Review, 'inputTokens' | 'outputTokens' | 'reasoningTokens'>>

/** Carried across attempts of one review, so a retry never repeats what already reached GitHub. */
export type PipelineAttempt = {
  isPosted: boolean
}

export type HttpFailure = {
  status?: number
  statusCode?: number
}

export type GroundedFindings = {
  kept: LlmFinding[]
  outsideSlice: number
  unquoted: number
}

export type ShownLine = {
  number: number
  text: string
}

export type TypecheckOutcome = 'passed' | 'failed' | 'unknown'

export type PriorClaim = {
  file: string
  line: number | null
  title: string
}

export type VerdictInput = {
  remaining: LlmFinding[]
  priorThreads: PriorThread[]
  isComplete: boolean
}

export type ReviewVerdict = {
  verdict: LlmReview['verdict']
  stillBlocking: PriorThread[]
}

/** One entry of GitHub's `GET /pulls/{n}/files` — the fields a unified diff is rebuilt from. */
export type PrFile = {
  filename: string
  status: string
  previousFilename?: string
  patch?: string
}
