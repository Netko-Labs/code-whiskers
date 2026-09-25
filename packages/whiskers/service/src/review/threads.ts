import { isBotLogin } from '../fix/utils'
import { octokitFor, type PrRef } from './github'
import type { PriorThread } from './types'

const THREAD_PAGE = 100
const MAX_PAGES = 5
const FINDING_TITLE = /^\*\*[^*]+\*\*\s+—\s+(.+)$/m

interface ThreadsPage {
  repository: {
    pullRequest: {
      reviewThreads: {
        pageInfo: { hasNextPage: boolean; endCursor: string | null }
        nodes: Array<{
          isResolved: boolean
          path: string
          line: number | null
          originalLine: number | null
          comments: { nodes: Array<{ author: { login: string } | null; body: string }> }
        }>
      }
    }
  }
}

/**
 * Every inline thread CodeWhiskers opened on this PR, with whether it was resolved and what humans
 * replied. This is the reviewer's memory: REST has no resolved flag, so it is GraphQL.
 */
export async function fetchBotThreads(ref: PrRef, botHandle: string): Promise<PriorThread[]> {
  const octokit = await octokitFor(ref.owner, ref.repo)
  const threads: PriorThread[] = []
  let cursor: string | null = null

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const data: ThreadsPage = await octokit.graphql(
      `query($owner: String!, $repo: String!, $pr: Int!, $cursor: String, $size: Int!) {
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $pr) {
            reviewThreads(first: $size, after: $cursor) {
              pageInfo { hasNextPage endCursor }
              nodes {
                isResolved path line originalLine
                comments(first: 20) { nodes { author { login } body } }
              }
            }
          }
        }
      }`,
      { owner: ref.owner, repo: ref.repo, pr: ref.prNumber, cursor, size: THREAD_PAGE },
    )
    const { nodes, pageInfo } = data.repository.pullRequest.reviewThreads
    for (const node of nodes) {
      const [root, ...rest] = node.comments.nodes
      if (!root || !isBotLogin(root.author?.login, botHandle)) continue
      const title = FINDING_TITLE.exec(root.body)?.[1]?.trim()
      if (!title) continue
      threads.push({
        path: node.path,
        line: node.line ?? node.originalLine,
        title,
        isResolved: node.isResolved,
        replies: rest
          .filter((comment) => !isBotLogin(comment.author?.login, botHandle))
          .map((comment) => ({ author: comment.author?.login ?? 'someone', body: comment.body })),
      })
    }
    if (!pageInfo.hasNextPage) break
    cursor = pageInfo.endCursor
  }
  return threads
}
