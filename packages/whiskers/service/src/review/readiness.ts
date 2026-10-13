import { getPullRequestContract } from '../queries'
import { CHECK_NAME } from './constants'
import { octokitFor, type PrRef } from './github'
import type { CiState, LoopReadiness } from './types'

const FAILED = new Set(['failure', 'timed_out', 'cancelled', 'action_required', 'startup_failure'])

/** Everyone else's checks on the head commit; the reviewer's own verdict is counted separately. */
async function ciOf(ref: PrRef, headSha: string): Promise<{ state: CiState; failing: string[] }> {
  const octokit = await octokitFor(ref.owner, ref.repo)
  const runs = await octokit.paginate('GET /repos/{owner}/{repo}/commits/{ref}/check-runs', {
    owner: ref.owner,
    repo: ref.repo,
    ref: headSha,
    per_page: 100,
  })
  const others = runs.filter((run) => run.name !== CHECK_NAME)
  const failing = others
    .filter((run) => run.conclusion && FAILED.has(run.conclusion))
    .map((run) => run.name)
  if (failing.length > 0) return { state: 'failing', failing }
  if (others.some((run) => run.status !== 'completed')) return { state: 'pending', failing }
  return { state: others.length > 0 ? 'green' : 'none', failing }
}

/**
 * Can this pull request be merged right now, as far as the loop knows: the latest review is of
 * the current head, its verdict, and CI on that head. Whether an agent may merge is studio's call.
 */
export async function loopReadiness(ref: PrRef): Promise<LoopReadiness | null> {
  const contract = await getPullRequestContract(ref.owner, ref.repo, ref.prNumber)
  if (!contract) return null
  const octokit = await octokitFor(ref.owner, ref.repo)
  const { data: pull } = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
    owner: ref.owner,
    repo: ref.repo,
    pull_number: ref.prNumber,
  })
  const ci = await ciOf(ref, pull.head.sha)
  const isCurrentHead = pull.head.sha === contract.head
  return {
    pr: contract.pr,
    head: pull.head.sha,
    reviewedHead: contract.head,
    isCurrentHead,
    verdict: contract.verdict,
    round: contract.round,
    ci: ci.state,
    failingChecks: ci.failing,
    isOpen: pull.state === 'open' && !pull.draft,
    isReady:
      isCurrentHead &&
      contract.verdict === 'mergeable' &&
      (ci.state === 'green' || ci.state === 'none') &&
      pull.state === 'open' &&
      !pull.draft,
  }
}
