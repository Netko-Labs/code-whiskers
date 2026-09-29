import { octokitFor, type PrRef } from '../review'
import type { ThreadRoot } from './types'

/** GitHub replies attach to the first comment of a thread, never to a reply. */
export async function fetchThreadRoot(ref: PrRef, commentId: number): Promise<ThreadRoot> {
  const octokit = await octokitFor(ref.owner, ref.repo)
  const read = async (id: number) =>
    (
      await octokit.request('GET /repos/{owner}/{repo}/pulls/comments/{comment_id}', {
        owner: ref.owner,
        repo: ref.repo,
        comment_id: id,
      })
    ).data
  const comment = await read(commentId)
  const root = comment.in_reply_to_id ? await read(Number(comment.in_reply_to_id)) : comment
  return {
    id: Number(root.id),
    path: root.path,
    line: root.line ?? root.original_line ?? null,
    body: root.body,
    author: root.user?.login ?? '',
  }
}

export async function acknowledge(ref: PrRef, commentId: number, isReviewComment: boolean) {
  const octokit = await octokitFor(ref.owner, ref.repo)
  const route = isReviewComment
    ? 'POST /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions'
    : 'POST /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions'
  await octokit.request(route, {
    owner: ref.owner,
    repo: ref.repo,
    comment_id: commentId,
    content: 'eyes',
  })
}
