import type { Finding, LlmFinding, LoopVerdict } from '@code-whiskers/whiskers-domain'
import type { PrRef } from '../github'
import type { PriorThread } from '../types'

export type RoundInput = {
  ref: PrRef
  round: number
  fresh: LlmFinding[]
  repeated: LlmFinding[]
  raised: LlmFinding[]
  priorThreads: PriorThread[]
  stillBlocking: PriorThread[]
  previous: Finding[]
  delta: string | null
  isComplete: boolean
}

export type FindingIdentity = {
  fingerprint: string
  sinceRound: number
}

export type FixedInput = {
  threads: PriorThread[]
  raised: LlmFinding[]
  delta: string | null
  isComplete: boolean
}

/** The fields a contract reads, whether from this round in memory or from stored rows. */
export type ContractSource = Pick<Finding, 'file' | 'line' | 'severity' | 'title'> & {
  fingerprint: string | null
  sinceRound: number | null
  threadUrl: string | null
  doneWhen?: string | null
  evidence?: string | null
}

export type ContractInput = {
  ref: PrRef
  headSha: string
  round: number
  verdict: LoopVerdict
  fixed: string[]
  findings: ContractSource[]
}

export type FingerprintClaim = (
  identity: string,
  finding: Pick<LlmFinding, 'file' | 'title'>,
) => string
