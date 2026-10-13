import { McpMemorySearchInputSchema, McpMemoryWriteInputSchema } from '@code-whiskers/studio-domain'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { learnMemoryNote } from '../mutations/memory'
import { getMemoryForRepository } from '../queries/memory'
import type { McpCaller } from './types'
import { accessibleRepository, fail, globMatches, ok } from './utils'

const SEARCH_LIMIT = 30

export function registerMemoryTools(server: McpServer, caller: McpCaller): void {
  server.registerTool(
    'memory_search',
    {
      title: 'Search repository memory',
      description:
        "Notes CodeWhiskers keeps about a repository: rules (breaking one blocks the merge), don't-flag, lessons from past bugs, context and preferences. Pass the files you will touch to get the ones that apply there.",
      inputSchema: McpMemorySearchInputSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ repo, query, paths }) => {
      if (!(await accessibleRepository(caller.userId, repo))) return fail(`No access to ${repo}.`)
      const notes = await getMemoryForRepository(repo, query)
      const relevant = notes
        .filter((note) => globMatches(note.paths, paths))
        .slice(0, SEARCH_LIMIT)
        .map(({ id, kind, body, paths: scope }) => ({ id, kind, body, paths: scope }))
      return ok(relevant)
    },
  )

  server.registerTool(
    'memory_write',
    {
      title: 'Add context to memory',
      description:
        'Records how part of the codebase works (e.g. "jobs/ runs on a cron, never inside a request") so later reviews read it. Context only: rules and don\'t-flag notes stay with people. It applies at once and a human can undo it.',
      inputSchema: McpMemoryWriteInputSchema,
    },
    async ({ repo, body, paths }) => {
      if (caller.scope !== 'loop')
        return fail('This key is read-only; create one with the review-loop scope.')
      if (!(await accessibleRepository(caller.userId, repo))) return fail(`No access to ${repo}.`)
      const note = await learnMemoryNote({
        repo,
        kind: 'context',
        body,
        paths,
        source: 'agent',
        actor: `${caller.name} (agent)`,
      })
      return note
        ? ok({ id: note.id, kind: 'context', status: 'active' })
        : fail(`Unknown repository ${repo}.`)
    },
  )
}
