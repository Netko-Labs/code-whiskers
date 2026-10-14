import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import type { ReviewerTestResult, WhiskersConfig } from '@code-whiskers/whiskers-domain'
import type { LanguageModel } from 'ai'
import { createTokenTally } from '../../shared/llm'
import { createClaudeProvider } from './claude'
import { languageModelOf, singleShotSpec } from './models'
import { envCredentials, fingerprintOf, resolveReviewer } from './settings'
import { createSingleShotProvider } from './single-shot'
import type { ReviewerCredentials, ReviewProvider } from './types'

export function createReviewProvider(
  config: WhiskersConfig = whiskersEnvConfig,
  credentials: ReviewerCredentials = envCredentials(),
): ReviewProvider {
  const { provider } = config.review
  return provider === 'claude'
    ? createClaudeProvider(config, credentials)
    : createSingleShotProvider(singleShotSpec(provider, config, credentials))
}

let active: { fingerprint: string; provider: ReviewProvider } | undefined

/** The provider the console's settings describe, rebuilt only when they change. */
export async function reviewProvider(fresh = false): Promise<ReviewProvider> {
  const resolved = await resolveReviewer(fresh)
  const fingerprint = fingerprintOf(resolved)
  if (active?.fingerprint !== fingerprint) {
    active = { fingerprint, provider: createReviewProvider(resolved.config, resolved.credentials) }
  }
  return active.provider
}

/** Mentions and fix replies answer through their own provider, keyed like the reviewer. */
export async function mentionModel(): Promise<LanguageModel> {
  const { config, credentials } = await resolveReviewer()
  return languageModelOf(config.mention.provider, config.mention.model, config, credentials)
}

/** A tiny review through the active provider: proves the credential and model answer, nothing more. */
export async function testReviewer(provider?: ReviewProvider): Promise<ReviewerTestResult> {
  const target = provider ?? (await reviewProvider(true))
  const started = performance.now()
  const result = { provider: target.id, model: target.model }
  try {
    await target.probe(createTokenTally())
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
