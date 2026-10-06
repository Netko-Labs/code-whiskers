import type { LanguageModelUsage } from 'ai'
import type { TokenSpend, TokenTally } from './types'

export function createTokenTally(): TokenTally {
  return { calls: 0, input: 0, cachedInput: 0, output: 0, reasoning: 0, turns: 0, costUsd: 0 }
}

/** Mutates `tally` — one per review, shared by every chunk and retry that spends against it. */
export function addUsage(tally: TokenTally, usage: LanguageModelUsage): void {
  tally.calls += 1
  tally.input += usage.inputTokens ?? 0
  tally.cachedInput += usage.inputTokenDetails.cacheReadTokens ?? 0
  tally.output += usage.outputTokens ?? 0
  tally.reasoning += usage.outputTokenDetails.reasoningTokens ?? 0
}

/** One call's spend, for providers whose usage does not arrive as an AI SDK `LanguageModelUsage`. */
export function addSpend(tally: TokenTally, spend: TokenSpend): void {
  tally.calls += 1
  tally.input += spend.input ?? 0
  tally.cachedInput += spend.cachedInput ?? 0
  tally.output += spend.output ?? 0
  tally.reasoning += spend.reasoning ?? 0
  tally.turns += spend.turns ?? 0
  tally.costUsd += spend.costUsd ?? 0
}
