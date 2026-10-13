import type {
  LlmFinding,
  LlmReview,
  LoopVerdict,
  Review,
  ReviewContract,
} from '@code-whiskers/whiskers-domain'
import type { CheckOutput } from './github'
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

export type AgentReplyKind = 'fixed' | 'disagree' | 'question'

/** A coding agent's answer, posted through the App over MCP: never a human decision. */
export type AgentReply = {
  agent: string
  kind: AgentReplyKind
  body: string
}

export type AgentReplyInput = {
  pr: string
  id: string
  kind: AgentReplyKind
  message: string
  agent: string
}

/**
 * One inline comment CodeWhiskers left on this PR, and what people did with it since. The optional
 * fields come from GitHub only; a thread rebuilt from the last review's findings has none.
 */
export type PriorThread = {
  path: string
  line: number | null
  title: string
  severity: LlmFinding['severity'] | null
  isResolved: boolean
  isOutdated: boolean
  isDownvoted: boolean
  replies: ThreadReply[]
  agentReplies?: AgentReply[]
  id?: string
  url?: string
  category?: string
  fingerprint?: string
  round?: number
  isFixed?: boolean
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
  loop: ClosedRound
}

/** A finding with the identity it keeps across rounds. */
export type ReviewedFinding = LlmFinding & {
  fingerprint: string
  sinceRound: number
  threadUrl: string | null
}

/** Where this round leaves the fix loop. `findings` are every open one, carried blockers included. */
export type ClosedRound = {
  round: number
  verdict: LoopVerdict
  fresh: ReviewedFinding[]
  findings: ReviewedFinding[]
  fixed: PriorThread[]
  fixedFingerprints: string[]
}

export type CheckCompletion = {
  conclusion: 'success' | 'failure' | 'neutral'
  output: CheckOutput
}

export type CheckResult = { report: ReviewReport; contract: ReviewContract } | { error: string }

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

export type MemoryKind = 'rule' | 'preference' | 'dont_flag' | 'context' | 'lesson'

export type MemoryNote = {
  id: string
  kind: MemoryKind
  body: string
  paths: string[]
  isRepositoryNote: boolean
  rank: number
}

export type MemoryContext = {
  text: string
  noteIds: string[]
  dropped: number
}
