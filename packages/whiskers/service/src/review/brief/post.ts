import { octokitFor, type PrRef } from '../github'
import { BRIEF_MARKER } from './constants'

const PAGE = 100

/** One brief per PR, edited in place each time the loop ends, so the thread never fills up. */
export async function upsertBriefComment(ref: PrRef, markdown: string): Promise<void> {
  const octokit = await octokitFor(ref.owner, ref.repo)
  const comments = await octokit.paginate(
    'GET /repos/{owner}/{repo}/issues/{issue_number}/comments',
    {
      owner: ref.owner,
      repo: ref.repo,
      issue_number: ref.prNumber,
      per_page: PAGE,
    },
  )
  const existing = comments.find((comment) => comment.body?.includes(BRIEF_MARKER))
  if (existing) {
    await octokit.request('PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}', {
      owner: ref.owner,
      repo: ref.repo,
      comment_id: existing.id,
      body: markdown,
    })
    return
  }
  await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
    owner: ref.owner,
    repo: ref.repo,
    issue_number: ref.prNumber,
    body: markdown,
  })
}
