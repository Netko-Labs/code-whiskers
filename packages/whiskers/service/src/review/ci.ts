import { createLogger } from '@code-whiskers/logger'
import type { LlmFinding } from '@code-whiskers/whiskers-domain'
import { octokitFor, type PrRef } from './github'
import type { TypecheckOutcome } from './types'

// Names CI jobs use for "the code compiles": typecheck, build, the repo's quality gate.
const TYPECHECK_CHECK = /type|tsc|check-types|quality|build|compile/i
const OWN_CHECK = /code-whiskers/i
// A docs build, a linter or a preview deploy proves nothing about types.
const NOT_TYPECHECK = /lint|doc|format|preview/i
const logger = createLogger('whiskers-review')
const POLL_MS = 20_000
const WAIT_MS = 4 * 60 * 1000
// A review can start before GitHub has created the push's check runs.
const APPEAR_GRACE_MS = 60_000

/**
 * A claim only a compiler settles: something no longer compiles or type-checks, a shape that no
 * longer matches its use, a module missing, unexported or unresolvable. Runtime words like
 * "contract" or "callers" alone are not enough — a green typecheck cannot disprove those.
 */
const COMPILE_CLAIM =
  /\b((no longer|does not|doesn['’]t|will not|won['’]t) (compile|type[- ]?check)|compil(e|ation) (error|fail)|type error|cannot (resolve|find) (module|name|import)|not exported|no longer (match|matches|satisf\w*)\b[^.]{0,40}\b(types?|props?|signature|interface|return|shape|consumers|callers|usage)|(still )?exports? (a |an |the )?(deleted|removed|moved|missing)|missing (file|module|export|import|migration)|does not export|callers? (were|was|are|is) not updated|not updated (for|to match) the (new|changed) (signature|type|props))/i

export function isCompileClaim(finding: LlmFinding): boolean {
  return COMPILE_CLAIM.test(`${finding.title} ${finding.body}`)
}

/**
 * Whether the head's typecheck-like checks passed. Waits a few minutes for running ones — the
 * review usually lands before CI does — and answers "unknown" rather than guess.
 */
export async function typecheckOutcome(
  ref: PrRef,
  sha: string,
  waitMs = WAIT_MS,
): Promise<TypecheckOutcome> {
  const octokit = await octokitFor(ref.owner, ref.repo)
  const started = Date.now()
  const deadline = started + waitMs
  for (;;) {
    // Every page: a pending or failing typecheck past the first hundred runs still counts.
    const checkRuns = await octokit.paginate('GET /repos/{owner}/{repo}/commits/{ref}/check-runs', {
      owner: ref.owner,
      repo: ref.repo,
      ref: sha,
      per_page: 100,
    })
    const runs = checkRuns.filter(
      (run) =>
        TYPECHECK_CHECK.test(run.name) &&
        !OWN_CHECK.test(run.name) &&
        !NOT_TYPECHECK.test(run.name),
    )
    const hasWaitedToAppear = Date.now() - started >= APPEAR_GRACE_MS
    if (runs.length === 0 && hasWaitedToAppear) return 'unknown'
    if (runs.some((run) => run.conclusion === 'failure')) return 'failed'
    const isDone = runs.length > 0 && runs.every((run) => run.status === 'completed')
    // Every matching run must succeed — a cancelled or skipped typecheck proves nothing.
    if (isDone) return runs.every((run) => run.conclusion === 'success') ? 'passed' : 'unknown'
    if (Date.now() + POLL_MS > deadline) return 'unknown'
    await new Promise((resolve) => setTimeout(resolve, POLL_MS))
  }
}

/**
 * The review step: when any finding is a compile claim, wait for the head's typecheck, and drop
 * those claims once it is green — the compiler already proved them wrong.
 */
export async function withoutDisprovedCompileClaims(
  ref: PrRef,
  sha: string,
  findings: LlmFinding[],
): Promise<LlmFinding[]> {
  if (!findings.some(isCompileClaim)) return findings
  const outcome = await typecheckOutcome(ref, sha).catch(() => 'unknown' as const)
  if (outcome !== 'passed') return findings
  const kept = findings.filter((finding) => !isCompileClaim(finding))
  logger.info(
    { ...ref, dropped: findings.length - kept.length },
    'compile claims dropped — the head typechecks',
  )
  return kept
}
