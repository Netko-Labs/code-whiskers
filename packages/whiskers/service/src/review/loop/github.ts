import { createLogger } from '@code-whiskers/logger'
import { linkFindingThreads } from '../../mutations'
import { octokitFor, type PrRef } from '../github'
import { FINDING_MARKER, renderFixedReply } from '../render'
import type { PriorThread } from '../types'

const logger = createLogger('whiskers-review')

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** Each inline comment of the review just posted, by the finding id it carries. */
export async function linkPostedThreads(
  ref: PrRef,
  reviewId: string,
  githubReviewId: number,
): Promise<Map<string, string>> {
  const octokit = await octokitFor(ref.owner, ref.repo)
  const comments = await octokit.paginate(
    'GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments',
    {
      owner: ref.owner,
      repo: ref.repo,
      pull_number: ref.prNumber,
      review_id: githubReviewId,
      per_page: 100,
    },
  )
  const urls = new Map<string, string>()
  for (const comment of comments) {
    const fingerprint = FINDING_MARKER.exec(comment.body)?.[1]
    if (fingerprint) urls.set(fingerprint, comment.html_url)
  }
  await linkFindingThreads(reviewId, urls)
  return urls
}

/**
 * Says "Fixed in <sha>." on each fixed blocker's thread and resolves it. Needs the App's pull
 * requests write permission, which posting reviews already takes. Never throws: a thread left
 * open is the safe failure.
 */
export async function resolveFixedThreads(
  ref: PrRef,
  headSha: string,
  threads: PriorThread[],
): Promise<number> {
  const resolvable = threads.filter((thread) => thread.id)
  if (resolvable.length === 0) return 0
  const octokit = await octokitFor(ref.owner, ref.repo).catch((error: unknown) => {
    logger.warn({ ...ref, err: messageOf(error) }, 'fixed threads left open')
    return null
  })
  if (!octokit) return 0
  let resolved = 0
  for (const thread of resolvable) {
    try {
      await octokit.graphql(
        `mutation($id: ID!, $body: String!) {
          addPullRequestReviewThreadReply(input: { pullRequestReviewThreadId: $id, body: $body }) {
            comment { id }
          }
          resolveReviewThread(input: { threadId: $id }) { thread { id } }
        }`,
        { id: thread.id, body: renderFixedReply(headSha) },
      )
      resolved += 1
    } catch (error) {
      logger.warn({ ...ref, thread: thread.url, err: messageOf(error) }, 'fixed thread left open')
    }
  }
  return resolved
}
