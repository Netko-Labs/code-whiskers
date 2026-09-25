import type { LlmReview } from '@code-whiskers/whiskers-domain'

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

export type ReviewReport = {
  review: LlmReview
  model: string
  coverage: ReviewCoverage
  carried?: CarriedFindings
}
