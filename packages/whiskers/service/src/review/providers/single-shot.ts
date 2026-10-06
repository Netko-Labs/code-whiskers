import { type LlmReview, LlmReviewSchema } from '@code-whiskers/whiskers-domain'
import { generateObject } from 'ai'
import { addUsage, type TokenTally } from '../../shared/llm'
import { REVIEW_SYSTEM, reviewPrompt } from '../prompt'
import { repairReviewText } from '../repair'
import { PROBE_DIFF, SINGLE_SHOT_RETRY, SINGLE_SHOT_TIMEOUT_MS } from './constants'
import { credentialPresence } from './credentials'
import type { ReviewProvider, ReviewSession, SingleShotSpec } from './types'

/** The AI Gateway reports what a call cost in its provider metadata; other providers report nothing. */
export function gatewayCostUsd(metadata: unknown): number {
  const gateway = (metadata as { gateway?: { cost?: unknown } } | undefined)?.gateway
  const cost = Number(gateway?.cost ?? 0)
  return Number.isFinite(cost) ? cost : 0
}

/** One `generateObject` per slice: what OpenRouter has always done, with the model swapped in. */
export function createSingleShotProvider(spec: SingleShotSpec): ReviewProvider {
  const review = async (diff: string, context: string, tokens: TokenTally): Promise<LlmReview> => {
    const { object, usage, providerMetadata } = await generateObject({
      model: spec.languageModel(),
      schema: LlmReviewSchema,
      system: REVIEW_SYSTEM,
      prompt: reviewPrompt(diff, context),
      abortSignal: AbortSignal.timeout(SINGLE_SHOT_TIMEOUT_MS),
      repairText: repairReviewText,
      ...(spec.providerOptions ? { providerOptions: spec.providerOptions } : {}),
    })
    addUsage(tokens, usage)
    tokens.costUsd += gatewayCostUsd(providerMetadata)
    return object
  }
  const session: ReviewSession = { retry: SINGLE_SHOT_RETRY, review, close: async () => {} }

  return {
    id: spec.id,
    model: spec.model,
    isAgentic: false,
    chunkChars: undefined,
    concurrency: undefined,
    open: async () => session,
    probe: (tokens) => review(PROBE_DIFF, '', tokens),
    status: async () => ({
      provider: spec.id,
      model: spec.model,
      isAgentic: false,
      credentials: credentialPresence(spec.credentials),
      executable: null,
      problems: credentialPresence(spec.credentials).some((c) => c.isSet)
        ? []
        : [`set ${spec.credentials.join(' or ')} — every review will fail without it`],
    }),
  }
}
