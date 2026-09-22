import type { LanguageModelUsage } from 'ai'
import type { TokenTally } from './types'

export function createTokenTally(): TokenTally {
  return { calls: 0, input: 0, cachedInput: 0, output: 0, reasoning: 0 }
}

/** Mutates `tally` — one per review, shared by every chunk and retry that spends against it. */
export function addUsage(tally: TokenTally, usage: LanguageModelUsage): void {
  tally.calls += 1
  tally.input += usage.inputTokens ?? 0
  tally.cachedInput += usage.inputTokenDetails.cacheReadTokens ?? 0
  tally.output += usage.outputTokens ?? 0
  tally.reasoning += usage.outputTokenDetails.reasoningTokens ?? 0
}
