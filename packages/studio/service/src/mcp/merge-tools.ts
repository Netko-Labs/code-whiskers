import { McpPrInputSchema, repository } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { eq } from 'drizzle-orm'
import { fetchMergeBrief, fetchReadiness } from './loop-client'
import type { McpCaller } from './types'
import { accessibleRepository, fail, ok, parsePrRef } from './utils'

type Readiness = { isReady: boolean; verdict: string; ci: string; isCurrentHead: boolean }

function whyNot(readiness: Readiness): string {
  if (!readiness.isCurrentHead) return 'the latest push has not been reviewed yet'
  if (readiness.verdict !== 'mergeable') return `the verdict is ${readiness.verdict}`
  if (readiness.ci === 'failing') return 'CI is failing'
  if (readiness.ci === 'pending') return 'CI is still running'
  return 'the pull request is closed or a draft'
}

export function registerMergeTools(server: McpServer, caller: McpCaller): void {
  server.registerTool(
    'merge_readiness',
    {
      title: 'Merge readiness',
      description:
        'Whether this pull request may be merged now and by whom: the verdict on the current head, CI, and whether this repository lets agents merge. If may_merge is false, stop and hand the PR to a human with the merge brief.',
      inputSchema: McpPrInputSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ pr }) => {
      const ref = parsePrRef(pr)
      if (!ref) return fail('Write the pull request as owner/repo#number.')
      const repo = await accessibleRepository(caller.userId, ref.slug)
      if (!repo) return fail(`No access to ${ref.slug}.`)
      const answer = await fetchReadiness(ref)
      if ('error' in answer) return fail(answer.error)
      if (!answer.value) return ok({ pr, may_merge: false, reason: 'not reviewed yet' })
      const readiness = answer.value as Readiness
      const [settings] = await db
        .select({ isAgentMergeAllowed: repository.isAgentMergeAllowed })
        .from(repository)
        .where(eq(repository.id, repo.id))
      const isAllowed = settings?.isAgentMergeAllowed ?? false
      const reason = !readiness.isReady
        ? whyNot(readiness)
        : isAllowed
          ? 'mergeable, CI green, and this repository lets agents merge'
          : 'mergeable and CI green, but a human merges in this repository'
      return ok({
        pr,
        ...readiness,
        agent_merge_allowed: isAllowed,
        may_merge: readiness.isReady && isAllowed,
        reason,
      })
    },
  )

  server.registerTool(
    'get_merge_brief',
    {
      title: 'Merge brief',
      description:
        'The card a human reads before merging: where the loop ended and why, what it fixed round by round, what is still open, files to look at, and the team notes applied. Also posted on the PR.',
      inputSchema: McpPrInputSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ pr }) => {
      const ref = parsePrRef(pr)
      if (!ref) return fail('Write the pull request as owner/repo#number.')
      if (!(await accessibleRepository(caller.userId, ref.slug)))
        return fail(`No access to ${ref.slug}.`)
      const answer = await fetchMergeBrief(ref)
      if ('error' in answer) return fail(answer.error)
      return answer.value ? ok(answer.value) : ok(`${pr} has not been reviewed yet.`)
    },
  )
}
