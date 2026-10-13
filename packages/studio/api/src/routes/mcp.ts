import { handleMcpRequest, resolveApiKey } from '@code-whiskers/studio-service'
import { Elysia } from 'elysia'

const unauthorized = () =>
  Response.json(
    { error: 'Send a CodeWhiskers API key: Authorization: Bearer cw_…' },
    { status: 401, headers: { 'www-authenticate': 'Bearer' } },
  )

/**
 * The review loop for coding agents (Claude Code: `claude mcp add --transport http`). Keys only,
 * never a browser session; each tool checks the key holder can see the repository it names.
 */
export const mcpRoutes = new Elysia({ name: 'mcp' }).all('/mcp', async ({ request }) => {
  const bearer = request.headers.get('authorization')?.match(/^Bearer (cw_\S+)$/)?.[1]
  const caller = bearer ? await resolveApiKey(bearer) : null
  if (!caller) return unauthorized()
  return handleMcpRequest(request, caller)
})
