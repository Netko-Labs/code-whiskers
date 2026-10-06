import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import type { ReviewerTestResult, WhiskersConfig } from '@code-whiskers/whiskers-domain'
import { createTokenTally } from '../../shared/llm'
import { createClaudeProvider } from './claude'
import { singleShotSpec } from './models'
import { createSingleShotProvider } from './single-shot'
import type { ReviewProvider } from './types'

export function createReviewProvider(config: WhiskersConfig = whiskersEnvConfig): ReviewProvider {
  const { provider } = config.review
  return provider === 'claude'
    ? createClaudeProvider(config)
    : createSingleShotProvider(singleShotSpec(provider, config))
}

let active: ReviewProvider | undefined

/** The configured provider, built once per process. */
export function reviewProvider(): ReviewProvider {
  active ??= createReviewProvider()
  return active
}

/** A tiny review through the active provider: proves the credential and model answer, nothing more. */
export async function testReviewer(provider = reviewProvider()): Promise<ReviewerTestResult> {
  const started = performance.now()
  const result = { provider: provider.id, model: provider.model }
  try {
    await provider.probe(createTokenTally())
    return {
      ...result,
      isOk: true,
      latencyMs: Math.round(performance.now() - started),
      error: null,
    }
  } catch (error) {
    return {
      ...result,
      isOk: false,
      latencyMs: Math.round(performance.now() - started),
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
