import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { isBotLogin } from '../fix/utils'
import { fetchPrHead, octokitFor, type PrRef } from './github'

/**
 * GitHub keeps a reviewer's "changes requested" standing until that reviewer dismisses it. Once
 * a later commit reviews clean, the bot's own earlier blocks are dismissed so they stop gating
 * the merge.
 */
export async function dismissStaleBlocks(ref: PrRef, headSha: string): Promise<number> {
  const octokit = await octokitFor(ref.owner, ref.repo)
  const reviews = await octokit.paginate('GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews', {
    owner: ref.owner,
    repo: ref.repo,
    pull_number: ref.prNumber,
    per_page: 100,
  })
  const stale = reviews.filter(
    (review) =>
      review.state === 'CHANGES_REQUESTED' &&
      isBotLogin(review.user?.login, whiskersEnvConfig.github.botHandle),
  )
  for (const review of stale) {
    await octokit.request(
      'PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/dismissals',
      {
        owner: ref.owner,
        repo: ref.repo,
        pull_number: ref.prNumber,
        review_id: review.id,
        message: `Superseded — ${headSha.slice(0, 7)} reviewed clean.`,
        event: 'DISMISS',
      },
    )
  }
  return stale.length
}

/**
 * Whether the bot's verdict still stands as an approval. Replies post as COMMENTED reviews and say
 * nothing; a ruleset that dismisses stale approvals on push leaves the last verdict DISMISSED.
 */
export function isApprovalStanding(states: string[]): boolean {
  const verdicts = states.filter((state) => state !== 'COMMENTED')
  return verdicts.at(-1) === 'APPROVED'
}

export async function hasStandingApproval(ref: PrRef): Promise<boolean> {
  const octokit = await octokitFor(ref.owner, ref.repo)
  const reviews = await octokit.paginate('GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews', {
    owner: ref.owner,
    repo: ref.repo,
    pull_number: ref.prNumber,
    per_page: 100,
  })
  return isApprovalStanding(
    reviews
      .filter((review) => isBotLogin(review.user?.login, whiskersEnvConfig.github.botHandle))
      .map((review) => review.state),
  )
}

/**
 * Whether this commit is still the PR's head. A slow review of an older push must not post over,
 * or dismiss the block of, the review of a newer one. Unknown counts as current.
 */
export async function isStillHead(ref: PrRef, sha: string): Promise<boolean> {
  return await fetchPrHead(ref)
    .then((head) => head.sha === sha)
    .catch(() => true)
}
