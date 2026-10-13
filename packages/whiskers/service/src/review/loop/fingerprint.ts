import { createHash } from 'node:crypto'
import type { Finding } from '@code-whiskers/whiskers-domain'
import type { PrRef } from '../github'
import { isSameFinding } from '../settle'
import type { PriorClaim, PriorThread } from '../types'
import { FINGERPRINT_HEX_CHARS, FINGERPRINT_PREFIX } from './constants'
import type { FindingIdentity, FingerprintClaim } from './types'

export function lineageOf(ref: PrRef): string {
  return `${ref.owner}/${ref.repo}#${ref.prNumber}`
}

export function threadClaim(thread: PriorThread): PriorClaim {
  return { file: thread.path, line: thread.line, title: thread.title }
}

function normalizedTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** Deterministic, so a retried attempt names the same finding the same way. */
export function findingFingerprint(lineage: string, file: string, title: string): string {
  const digest = createHash('sha256')
    .update(`${lineage}\n${file}\n${normalizedTitle(title)}`)
    .digest('hex')
  return `${FINGERPRINT_PREFIX}${digest.slice(0, FINGERPRINT_HEX_CHARS)}`
}

/** Ids stay unique within a round: a second finding wanting a taken one gets its own. */
export function createFingerprintClaim(lineage: string): FingerprintClaim {
  const taken = new Set<string>()
  return (wanted, finding) => {
    let fingerprint = wanted
    for (let n = 2; taken.has(fingerprint); n += 1) {
      fingerprint = findingFingerprint(lineage, finding.file, `${finding.title} ${n}`)
    }
    taken.add(fingerprint)
    return fingerprint
  }
}

/** Rows and threads from before ids existed were raised in some earlier round. */
function earlierRound(round: number): number {
  return Math.max(1, round - 1)
}

export function identityOfFinding(prior: Finding, lineage: string, round: number): FindingIdentity {
  return {
    fingerprint: prior.fingerprint ?? findingFingerprint(lineage, prior.file, prior.title),
    sinceRound: prior.sinceRound ?? earlierRound(round),
  }
}

/** The id a thread's comment carries, else the stored finding it was posted from. */
export function identityOfThread(
  thread: PriorThread,
  previous: Finding[],
  lineage: string,
  round: number,
): FindingIdentity {
  if (thread.fingerprint) {
    return { fingerprint: thread.fingerprint, sinceRound: thread.round ?? earlierRound(round) }
  }
  const stored = previous.find((prior) => isSameFinding(prior, threadClaim(thread)))
  if (stored) return identityOfFinding(stored, lineage, round)
  return {
    fingerprint: findingFingerprint(lineage, thread.path, thread.title),
    sinceRound: earlierRound(round),
  }
}
