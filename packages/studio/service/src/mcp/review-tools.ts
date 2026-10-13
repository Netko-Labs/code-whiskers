import {
  McpPrInputSchema,
  McpReplyInputSchema,
  McpWaitInputSchema,
} from '@code-whiskers/studio-domain'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getMemoryForRepository } from '../queries/memory'
import { fetchLoopReview, postLoopReply } from './loop-client'
import type { McpCaller, PrRef, ToolResult } from './types'
import { accessibleRepository, fail, ok, parsePrRef } from './utils'

const POLL_MS = 5_000

async function withPr(
  caller: McpCaller,
  value: string,
  run: (pr: PrRef) => Promise<ToolResult>,
): Promise<ToolResult> {
  const pr = parsePrRef(value)
  if (!pr) return fail('Write the pull request as owner/repo#number.')
  if (!(await accessibleRepository(caller.userId, pr.slug))) {
    return fail(`No access to ${pr.slug}: the key's owner is not in the installation that has it.`)
  }
  return run(pr)
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function registerReviewTools(server: McpServer, caller: McpCaller): void {
  server.registerTool(
    'review_status',
    {
      title: 'Review status',
      description:
        'Where the latest CodeWhiskers review of a pull request stands: verdict (mergeable, needs_changes, blocked, needs_human), round, and how many blockers are open. Cheap; call it first.',
      inputSchema: McpPrInputSchema,
      annotations: { readOnlyHint: true },
    },
    ({ pr }) =>
      withPr(caller, pr, async (ref) => {
        const answer = await fetchLoopReview(ref)
        if ('error' in answer) return fail(answer.error)
        if (!answer.review) return ok({ pr, reviewed: false })
        const { head, round, verdict, blockers, suggestions } = answer.review
        return ok({
          pr,
          head,
          round,
          verdict,
          blockers: blockers.length,
          suggestions: suggestions.length,
        })
      }),
  )

  server.registerTool(
    'get_findings',
    {
      title: 'Get findings',
      description:
        'The blockers and suggestions from the latest review, each with a stable id, file, line, a "done_when" condition and its GitHub thread. Fix every blocker until done_when holds, or reply_to_finding with kind "disagree" and the evidence.',
      inputSchema: McpPrInputSchema,
      annotations: { readOnlyHint: true },
    },
    ({ pr }) =>
      withPr(caller, pr, async (ref) => {
        const answer = await fetchLoopReview(ref)
        if ('error' in answer) return fail(answer.error)
        return answer.review ? ok(answer.review) : ok(`${pr} has not been reviewed yet.`)
      }),
  )

  server.registerTool(
    'wait_for_review',
    {
      title: 'Wait for review',
      description:
        'After you push, blocks until CodeWhiskers has reviewed that commit (pushes start a review on their own), then returns the verdict. Times out after timeoutSeconds.',
      inputSchema: McpWaitInputSchema,
      annotations: { readOnlyHint: true },
    },
    ({ pr, sha, timeoutSeconds }) =>
      withPr(caller, pr, async (ref) => {
        const deadline = Date.now() + timeoutSeconds * 1_000
        while (Date.now() < deadline) {
          const answer = await fetchLoopReview(ref)
          if ('error' in answer) return fail(answer.error)
          const review = answer.review
          if (review?.head.startsWith(sha) || (review && sha.startsWith(review.head))) {
            return ok({
              pr,
              head: review.head,
              round: review.round,
              verdict: review.verdict,
              blockers: review.blockers.length,
            })
          }
          await sleep(POLL_MS)
        }
        return fail(`No review of ${sha.slice(0, 7)} yet after ${timeoutSeconds}s; call again.`)
      }),
  )

  server.registerTool(
    'reply_to_finding',
    {
      title: 'Reply to a finding',
      description:
        'Answers a finding on its GitHub thread, labelled as you, so the pull request keeps the whole conversation. kind "fixed" names the commit, "disagree" gives evidence (a separate checker rules on it next round; arguing never adds a don\'t-flag note), "question" asks.',
      inputSchema: McpReplyInputSchema,
    },
    ({ pr, id, kind, message }) =>
      withPr(caller, pr, async () => {
        if (caller.scope !== 'loop')
          return fail('This key is read-only; create one with the review-loop scope.')
        const posted = await postLoopReply({ pr, id, kind, message, agent: caller.name })
        return 'error' in posted ? fail(posted.error) : ok({ posted: posted.url })
      }),
  )

  server.registerTool(
    'get_pr_context',
    {
      title: 'Pull request context',
      description:
        'What the reviewer knows about this repository (team rules, things not to flag, lessons, how the code works) plus where the latest review stands. Read it before changing code so the first push already follows the rules.',
      inputSchema: McpPrInputSchema,
      annotations: { readOnlyHint: true },
    },
    ({ pr }) =>
      withPr(caller, pr, async (ref) => {
        const [notes, answer] = await Promise.all([
          getMemoryForRepository(ref.slug),
          fetchLoopReview(ref),
        ])
        return ok({
          memory: notes.map(({ id, kind, body, paths }) => ({ id, kind, body, paths })),
          review: 'error' in answer ? { error: answer.error } : answer.review,
        })
      }),
  )
}
