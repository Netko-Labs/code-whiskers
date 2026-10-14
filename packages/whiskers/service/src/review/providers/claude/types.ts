import type {
  HookCallback,
  SDKAssistantMessageError,
  SDKRateLimitInfo,
  SDKResultMessage,
} from '@anthropic-ai/claude-agent-sdk'
import type { ReviewerStatus, WhiskersConfig } from '@code-whiskers/whiskers-domain'
import type { ReviewerCredentials } from '../types'

export type ClaudeRunInput = {
  cwd: string
  env: Record<string, string>
  systemPrompt: string
  config: Pick<WhiskersConfig['review'], 'model' | 'effort' | 'maxTurns' | 'maxBudgetUsd'>
  executable: string | null
  abortController: AbortController
  guard: HookCallback
  stderr: (text: string) => void
  outputSchema?: Record<string, unknown>
}

export type ReviewSlice = {
  diff: string
  context: string
}

/** One agent run: the review itself, or the checker re-reading its findings. */
export type AgentCall = {
  prompt: string
  systemPrompt: string
  model: string
  outputSchema?: Record<string, unknown>
}

export type ClaudeSessionSpec = {
  config: WhiskersConfig['review']
  limits: Pick<WhiskersConfig['review'], 'maxTurns' | 'timeoutMs'>
  binary: string | null
  credentials: ReviewerCredentials
}

/** What a run told us before it ended, folded message by message. */
export type ClaudeRunState = {
  result: SDKResultMessage | null
  assistantError: SDKAssistantMessageError | null
  rateLimit: SDKRateLimitInfo | null
}

export type ResolvedExecutable = Pick<NonNullable<ReviewerStatus['executable']>, 'path' | 'source'>

export type ExecutableLookup = {
  configured: string | undefined
  mainDir: string
  exists: (path: string) => boolean
}
