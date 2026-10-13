import { type Finding, type LlmFinding, LlmFindingSchema } from '@code-whiskers/whiskers-domain'
import { isSameFinding } from '../settle'
import type { ClosedRound, PriorThread, ReviewedFinding } from '../types'
import { SEVERITY_RANK } from './constants'
import {
  createFingerprintClaim,
  findingFingerprint,
  identityOfFinding,
  identityOfThread,
  lineageOf,
  threadClaim,
} from './fingerprint'
import { fixedThreads } from './fixed'
import type { FingerprintClaim, RoundInput } from './types'
import { loopVerdict } from './verdict'

function matchingThread(finding: LlmFinding, threads: PriorThread[]): PriorThread | undefined {
  const isSame = (thread: PriorThread) => isSameFinding(finding, threadClaim(thread))
  return threads.find((thread) => !thread.isFixed && isSame(thread)) ?? threads.find(isSame)
}

/** A repeat the model now rates lower still reads as the blocker GitHub shows. */
function severityOf(finding: LlmFinding, thread: PriorThread | undefined, input: RoundInput) {
  const shown = thread?.severity
  if (!thread || !shown || !input.stillBlocking.includes(thread)) return finding.severity
  return SEVERITY_RANK[shown] > SEVERITY_RANK[finding.severity] ? shown : finding.severity
}

function track(
  finding: LlmFinding,
  isFresh: boolean,
  input: RoundInput,
  claim: FingerprintClaim,
): ReviewedFinding {
  const lineage = lineageOf(input.ref)
  const thread = matchingThread(finding, input.priorThreads)
  const prior = thread ? undefined : input.previous.find((row) => isSameFinding(finding, row))
  const identity = thread
    ? identityOfThread(thread, input.previous, lineage, input.round)
    : prior && identityOfFinding(prior, lineage, input.round)
  return {
    ...finding,
    severity: severityOf(finding, thread, input),
    fingerprint: claim(
      identity?.fingerprint ?? findingFingerprint(lineage, finding.file, finding.title),
      finding,
    ),
    sinceRound: identity?.sinceRound ?? input.round,
    threadUrl: isFresh ? null : (thread?.url ?? prior?.threadUrl ?? null),
  }
}

/** An open blocker from an earlier round this review did not see again, as a finding row. */
function carry(thread: PriorThread, input: RoundInput, claim: FingerprintClaim): ReviewedFinding {
  const identity = identityOfThread(thread, input.previous, lineageOf(input.ref), input.round)
  const stored: Finding | undefined =
    input.previous.find((row) => row.fingerprint === identity.fingerprint) ??
    input.previous.find((row) => isSameFinding(row, threadClaim(thread)))
  const title = stored?.title ?? thread.title
  return {
    file: thread.path,
    line: thread.line,
    severity: thread.severity ?? 'high',
    category: LlmFindingSchema.shape.category.parse(stored?.category ?? thread.category),
    title,
    body: stored?.body ?? '',
    suggestion: stored?.suggestion ?? null,
    evidence: stored?.evidence ?? '',
    doneWhen: stored?.doneWhen ?? null,
    fingerprint: claim(identity.fingerprint, { file: thread.path, title }),
    sinceRound: identity.sinceRound,
    threadUrl: thread.url ?? stored?.threadUrl ?? null,
  }
}

/**
 * Gives every open finding its id across rounds, carries forward blockers this review could not
 * see, picks out the ones the push fixed, and says where the loop stands.
 */
export function closeRound(input: RoundInput): ClosedRound {
  const lineage = lineageOf(input.ref)
  const claim = createFingerprintClaim(lineage)
  const repeated = input.repeated.map((finding) => track(finding, false, input, claim))
  const raisedAgain = [...input.fresh, ...input.repeated]
  const carried = input.stillBlocking
    .filter((thread) => !raisedAgain.some((f) => isSameFinding(f, threadClaim(thread))))
    .map((thread) => carry(thread, input, claim))
  const fresh = input.fresh.map((finding) => track(finding, true, input, claim))
  const findings = [...fresh, ...repeated, ...carried]
  const fixed = fixedThreads({
    threads: input.priorThreads,
    raised: input.raised,
    delta: input.delta,
    isComplete: input.isComplete,
  })
  const fixedFingerprints = fixed.map(
    (thread) => identityOfThread(thread, input.previous, lineage, input.round).fingerprint,
  )
  return {
    round: input.round,
    verdict: loopVerdict(findings, input.isComplete),
    fresh,
    findings,
    fixed,
    fixedFingerprints: [...new Set(fixedFingerprints)],
  }
}
