import type { SDKMessage, SDKResultMessage } from '@anthropic-ai/claude-agent-sdk'
import { type LlmReview, LlmReviewSchema } from '@code-whiskers/whiskers-domain'
import type { TokenSpend } from '../../../shared/llm'
import { ReviewProviderError } from '../errors'
import {
  AUTH_FAILURE_TEXT,
  MISSING_BINARY_TEXT,
  PERMANENT_CLAUDE_ERRORS,
  TRANSIENT_CLAUDE_ERRORS,
} from './constants'
import type { ClaudeRunState } from './types'

export function emptyRunState(): ClaudeRunState {
  return { result: null, assistantError: null, rateLimit: null }
}

/** Keeps what decides the outcome: the result, the last assistant error, a rejected rate limit. */
export function observe(state: ClaudeRunState, message: SDKMessage): ClaudeRunState {
  if (message.type === 'result') return { ...state, result: message }
  if (message.type === 'assistant' && message.error) {
    return { ...state, assistantError: message.error }
  }
  if (message.type === 'rate_limit_event' && message.rate_limit_info.status === 'rejected') {
    return { ...state, rateLimit: message.rate_limit_info }
  }
  return state
}

/** `resetsAt` arrives in epoch seconds. */
function retryAtMs(resetsAt: number | undefined): number | undefined {
  if (resetsAt === undefined) return undefined
  return resetsAt < 1e12 ? resetsAt * 1000 : resetsAt
}

/** `modelUsage` covers every call the run made; `usage` only the main loop. */
export function spendOf(result: SDKResultMessage): TokenSpend {
  const models = Object.values(result.modelUsage ?? {})
  const sum = (pick: (usage: (typeof models)[number]) => number | undefined) =>
    models.reduce((total, usage) => total + (pick(usage) ?? 0), 0)
  return {
    input: sum((u) => u.inputTokens + u.cacheReadInputTokens + u.cacheCreationInputTokens),
    cachedInput: sum((u) => u.cacheReadInputTokens),
    output: sum((u) => u.outputTokens),
    reasoning: sum((u) => u.thinkingTokens),
    turns: result.num_turns,
    costUsd: result.total_cost_usd,
  }
}

function providerFailure(state: ClaudeRunState, text: string): ReviewProviderError | null {
  const error = state.assistantError
  if (state.rateLimit) {
    const retryAt = retryAtMs(state.rateLimit.resetsAt)
    const when = retryAt ? ` until ${new Date(retryAt).toISOString()}` : ''
    return new ReviewProviderError(`Claude usage limit reached${when}`, {
      kind: 'transient',
      retryAtMs: retryAt,
    })
  }
  if (error && TRANSIENT_CLAUDE_ERRORS.has(error)) {
    return new ReviewProviderError(
      `Claude is ${error === 'overloaded' ? 'overloaded' : 'rate limited'}`,
      {
        kind: 'transient',
      },
    )
  }
  const permanent = error ? PERMANENT_CLAUDE_ERRORS[error] : undefined
  if (permanent) return new ReviewProviderError(permanent, { kind: 'permanent' })
  if (AUTH_FAILURE_TEXT.test(text)) {
    return new ReviewProviderError(PERMANENT_CLAUDE_ERRORS.authentication_failed ?? text, {
      kind: 'permanent',
    })
  }
  return null
}

/**
 * The structured answer, or why there is none. Provider-wide trouble (limits, a dead token) ends
 * the whole attempt; anything else fails this slice alone.
 */
export function reviewFromRun(state: ClaudeRunState): LlmReview {
  const { result } = state
  const text = result
    ? result.subtype === 'success'
      ? result.result
      : result.errors.join('; ')
    : ''
  const failure = providerFailure(state, text)
  if (failure) throw failure
  if (!result) throw new Error('the Claude agent ended without a result')
  if (result.subtype === 'error_max_turns') {
    throw new Error(`the Claude agent ran out of turns (${result.num_turns}) before answering`)
  }
  if (result.subtype === 'error_max_budget_usd') {
    throw new Error('the Claude agent hit REVIEW_AGENT_MAX_BUDGET_USD before answering')
  }
  if (result.subtype === 'error_max_structured_output_retries') {
    throw new Error('the Claude agent never produced output matching the review schema')
  }
  if (result.subtype !== 'success') {
    throw new Error(`the Claude agent failed: ${text.slice(0, 300) || 'no detail'}`)
  }
  if (result.is_error) throw new Error(`the Claude agent failed: ${text.slice(0, 300)}`)
  if (result.structured_output === undefined) {
    const denied = [...new Set((result.permission_denials ?? []).map((d) => d.tool_name))]
    const detail = denied.length > 0 ? ` (denied: ${denied.join(', ')})` : ''
    throw new Error(`the Claude agent finished without structured output${detail}`)
  }
  const parsed = LlmReviewSchema.safeParse(result.structured_output)
  if (!parsed.success) throw new Error('the Claude agent output did not match the review schema')
  return parsed.data
}

/** A throw from the SDK itself: a missing binary or a refused credential is not worth a retry. */
export function classifySdkError(error: unknown, stderr = ''): unknown {
  const message = `${error instanceof Error ? error.message : String(error)} ${stderr}`
  if (MISSING_BINARY_TEXT.test(message)) {
    return new ReviewProviderError(
      'Claude Code binary not found — set CLAUDE_CODE_EXECUTABLE or rebuild whiskers',
      { kind: 'permanent', cause: error },
    )
  }
  if (AUTH_FAILURE_TEXT.test(message)) {
    return new ReviewProviderError(PERMANENT_CLAUDE_ERRORS.authentication_failed ?? message, {
      kind: 'permanent',
      cause: error,
    })
  }
  if (!stderr) return error
  return new Error(`${error instanceof Error ? error.message : String(error)}: ${stderr}`, {
    cause: error,
  })
}
