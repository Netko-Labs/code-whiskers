import type { LlmFinding } from '@code-whiskers/whiskers-domain'
import { octokitFor, type PrRef } from './github'
import type { TypecheckOutcome } from './types'

// Names CI jobs use for "the code compiles": typecheck, build, the repo's quality gate.
const TYPECHECK_CHECK = /type|tsc|check-types|quality|build|compile/i
const OWN_CHECK = /code-whiskers/i
const POLL_MS = 20_000
const WAIT_MS = 4 * 60 * 1000

/**
 * A claim a compiler settles: callers or consumers not updated, a contract or signature that no
 * longer matches, something missing, unexported or unresolvable. A green typecheck disproves it.
 */
const COMPILE_CLAIM =
  /\b(type[- ]?check|compil(e|es|ation)|type error|cannot (resolve|find)|not exported|no longer (match|type|compile|satisf)|callers?|consumers?|signature|contract|missing (file|module|export|import|migration|key)|removed (field|export|prop)|does not (exist|export)|(still )?exports? (a |an |the )?(deleted|removed|moved|missing))/i

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
  const deadline = Date.now() + waitMs
  for (;;) {
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/commits/{ref}/check-runs', {
      owner: ref.owner,
      repo: ref.repo,
      ref: sha,
      per_page: 100,
    })
    const runs = data.check_runs.filter(
      (run) => TYPECHECK_CHECK.test(run.name) && !OWN_CHECK.test(run.name),
    )
    if (runs.length === 0) return 'unknown'
    if (runs.some((run) => run.conclusion === 'failure')) return 'failed'
    const isDone = runs.every((run) => run.status === 'completed')
    if (isDone) return runs.some((run) => run.conclusion === 'success') ? 'passed' : 'unknown'
    if (Date.now() + POLL_MS > deadline) return 'unknown'
    await new Promise((resolve) => setTimeout(resolve, POLL_MS))
  }
}
