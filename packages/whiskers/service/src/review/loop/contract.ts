import type {
  ContractFinding,
  Finding,
  Review,
  ReviewContract,
} from '@code-whiskers/whiskers-domain'
import { isPartialSummary } from '../delta'
import type { PrRef } from '../github'
import { BLOCKING_SEVERITIES } from '../render'
import type { ClosedRound } from '../types'
import { SEVERITY_RANK } from './constants'
import { findingFingerprint, lineageOf } from './fingerprint'
import type { ContractInput, ContractSource } from './types'
import { textOrNull } from './utils'
import { loopVerdict } from './verdict'

function byWeight(a: ContractFinding, b: ContractFinding): number {
  return (
    SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] ||
    a.file.localeCompare(b.file) ||
    (a.line ?? 0) - (b.line ?? 0)
  )
}

function entryOf(finding: ContractSource, lineage: string, round: number): ContractFinding {
  return {
    id: finding.fingerprint ?? findingFingerprint(lineage, finding.file, finding.title),
    since_round: finding.sinceRound ?? round,
    file: finding.file,
    line: finding.line,
    severity: finding.severity,
    title: finding.title,
    done_when: textOrNull(finding.doneWhen),
    evidence: textOrNull(finding.evidence),
    thread: finding.threadUrl,
  }
}

/** The reviewer's half of the fix loop, as the check run and `/v1` hand it to a coding agent. */
export function buildReviewContract(input: ContractInput): ReviewContract {
  const { ref } = input
  const lineage = lineageOf(ref)
  const entries = input.findings.map((f) => entryOf(f, lineage, input.round)).sort(byWeight)
  return {
    pr: lineage,
    head: input.headSha,
    round: input.round,
    verdict: input.verdict,
    blockers: entries.filter((entry) => BLOCKING_SEVERITIES.has(entry.severity)),
    suggestions: entries.filter((entry) => !BLOCKING_SEVERITIES.has(entry.severity)),
    fixed_since_last_round: input.fixed,
  }
}

/** A stored review; one from before the loop existed gets its verdict and round derived. */
export function contractOfReview(review: Review, findings: Finding[]): ReviewContract {
  return buildReviewContract({
    ref: { owner: review.owner, repo: review.repo, prNumber: review.prNumber },
    headSha: review.headSha,
    round: review.round ?? 1,
    verdict: review.loopVerdict ?? loopVerdict(findings, !isPartialSummary(review.summary)),
    fixed: review.fixedSinceLastRound,
    findings,
  })
}

export function contractOfRound(ref: PrRef, headSha: string, loop: ClosedRound): ReviewContract {
  return buildReviewContract({
    ref,
    headSha,
    round: loop.round,
    verdict: loop.verdict,
    fixed: loop.fixedFingerprints,
    findings: loop.findings,
  })
}
