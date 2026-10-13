import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { registerMemoryTools } from './memory-tools'
import { registerReviewTools } from './review-tools'
import type { McpCaller } from './types'

const INSTRUCTIONS = `CodeWhiskers reviews every push to a pull request and says when it is mergeable.
Loop: get_pr_context before you start → push → wait_for_review(sha) → get_findings → fix each
blocker until its done_when holds (or reply_to_finding "disagree" with evidence) → push again.
Stop at verdict "mergeable" (a human merges unless the repo allows otherwise) or "needs_human".`

/**
 * Stateless: a fresh server and transport per request, so any studio replica answers any call
 * and nothing about the caller outlives it.
 */
export async function handleMcpRequest(request: Request, caller: McpCaller): Promise<Response> {
  const server = new McpServer(
    { name: 'code-whiskers', version: '1.0.0' },
    { instructions: INSTRUCTIONS },
  )
  registerReviewTools(server, caller)
  registerMemoryTools(server, caller)
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  })
  await server.connect(transport)
  try {
    return await transport.handleRequest(request)
  } finally {
    void server.close()
  }
}
