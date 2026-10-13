import type { LlmFinding, LlmReview } from '@code-whiskers/whiskers-domain'

export type ReviewTarget = {
  owner: string
  repo: string
  headSha: string
}

export type ReviewCoverage = {
  reviewed: number
  total: number
}

export type CarriedFindings = {
  open: number
  settled: number
}

/** A finding as rendered; one that has been through a round carries its stable id. */
export type ReportFinding = LlmFinding & {
  fingerprint?: string
  sinceRound?: number
}

export type ReviewReport = {
  review: Omit<LlmReview, 'findings'> & { findings: ReportFinding[] }
  model: string
  coverage: ReviewCoverage
  carried?: CarriedFindings
}
