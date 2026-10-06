import type { HookCallback, Options } from '@anthropic-ai/claude-agent-sdk'
import { isEscapingPattern, reviewJsonSchema } from '../agent'
import { CLAUDE_DENIED_TOOLS, CLAUDE_TOOLS } from './constants'
import type { ClaudeRunInput } from './types'

const ALLOWED: ReadonlySet<string> = new Set(CLAUDE_TOOLS)

function deny(reason: string) {
  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse' as const,
      permissionDecision: 'deny' as const,
      permissionDecisionReason: reason,
    },
  }
}

function field(input: unknown, name: string): string | undefined {
  const value = (input as Record<string, unknown> | null)?.[name]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

/**
 * Runs before every tool call, ahead of permission rules: a tool outside the read-only three, a
 * path outside the checkout, or a glob that climbs out is refused whatever else allows it.
 */
export function readOnlyGuard(isInside: (path: string) => Promise<boolean>): HookCallback {
  return async (input) => {
    if (input.hook_event_name !== 'PreToolUse') return {}
    if (!ALLOWED.has(input.tool_name)) return deny(`${input.tool_name} is not available here`)
    const path = field(input.tool_input, input.tool_name === 'Read' ? 'file_path' : 'path')
    if (path && !(await isInside(path))) return deny('only files inside the checkout can be read')
    const pattern = field(input.tool_input, input.tool_name === 'Glob' ? 'pattern' : 'glob')
    if (pattern && isEscapingPattern(pattern)) return deny('patterns must stay inside the checkout')
    return {}
  }
}

/**
 * Read-only by construction: three tools, everything else removed, nothing pre-approved (reads
 * inside `cwd` need no approval; anything that would prompt is denied), no settings, CLAUDE.md,
 * hooks or MCP from disk, and no session written.
 */
export function buildClaudeOptions(input: ClaudeRunInput): Options {
  const { model, effort, maxTurns, maxBudgetUsd } = input.config
  return {
    cwd: input.cwd,
    env: input.env,
    model,
    effort,
    maxTurns,
    ...(maxBudgetUsd === undefined ? {} : { maxBudgetUsd }),
    tools: [...CLAUDE_TOOLS],
    disallowedTools: [...CLAUDE_DENIED_TOOLS],
    permissionMode: 'dontAsk',
    settingSources: [],
    strictMcpConfig: true,
    mcpServers: {},
    persistSession: false,
    systemPrompt: input.systemPrompt,
    outputFormat: { type: 'json_schema', schema: reviewJsonSchema() },
    hooks: { PreToolUse: [{ hooks: [input.guard] }] },
    abortController: input.abortController,
    ...(input.executable ? { pathToClaudeCodeExecutable: input.executable } : {}),
    ...(input.spawn ? { spawnClaudeCodeProcess: input.spawn } : {}),
  }
}
