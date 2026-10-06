import type {
  HookCallback,
  SDKAssistantMessageError,
  SDKRateLimitInfo,
  SDKResultMessage,
} from '@anthropic-ai/claude-agent-sdk'
import type { ReviewerStatus, WhiskersConfig } from '@code-whiskers/whiskers-domain'

export type ClaudeRunInput = {
  cwd: string
  env: Record<string, string>
  systemPrompt: string
  config: Pick<WhiskersConfig['review'], 'model' | 'effort' | 'maxTurns' | 'maxBudgetUsd'>
  executable: string | null
  abortController: AbortController
  guard: HookCallback
  stderr: (text: string) => void
}

export type ReviewSlice = {
  diff: string
  context: string
}

export type ClaudeSessionSpec = {
  config: WhiskersConfig['review']
  limits: Pick<WhiskersConfig['review'], 'maxTurns' | 'timeoutMs'>
  isDev: boolean
  binary: string | null
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
