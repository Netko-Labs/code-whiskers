import { describe, expect, test } from 'bun:test'
import { handleMcpRequest } from './server'
import type { McpCaller } from './types'
import { parsePrRef } from './utils'

const caller: McpCaller = { keyId: 'k', name: 'laptop', userId: 'u', scope: 'loop' }

function rpc(method: string, params: Record<string, unknown> = {}, id = 1) {
  return new Request('https://whiskers.test/api/mcp', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      'mcp-protocol-version': '2025-06-18',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
  })
}

describe('handleMcpRequest', () => {
  test('introduces itself with the loop instructions', async () => {
    const response = await handleMcpRequest(
      rpc('initialize', {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'test', version: '0' },
      }),
      caller,
    )
    const body = (await response.json()) as {
      result: { serverInfo: { name: string }; instructions: string }
    }
    expect(body.result.serverInfo.name).toBe('code-whiskers')
    expect(body.result.instructions).toContain('wait_for_review')
  })

  test('lists the loop and memory tools', async () => {
    const response = await handleMcpRequest(rpc('tools/list'), caller)
    const body = (await response.json()) as { result: { tools: { name: string }[] } }
    expect(body.result.tools.map((tool) => tool.name).sort()).toEqual([
      'get_findings',
      'get_pr_context',
      'memory_search',
      'memory_write',
      'reply_to_finding',
      'review_status',
      'wait_for_review',
    ])
  })

  test('a malformed pull request reference is a tool error, not a crash', async () => {
    const response = await handleMcpRequest(
      rpc('tools/call', { name: 'review_status', arguments: { pr: 'not-a-pr' } }),
      caller,
    )
    const body = (await response.json()) as { result: { isError: boolean } }
    expect(body.result.isError).toBe(true)
  })
})

describe('parsePrRef', () => {
  test('reads owner/repo#number', () => {
    expect(parsePrRef('Netko-Labs/graphya#41')).toEqual({
      owner: 'Netko-Labs',
      repo: 'graphya',
      number: 41,
      slug: 'Netko-Labs/graphya',
    })
    expect(parsePrRef('graphya#41')).toBeNull()
  })
})
