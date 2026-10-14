import { createHash } from 'node:crypto'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import {
  DEFAULT_REVIEW_MODELS,
  DEFAULT_VERIFY_MODELS,
  REVIEW_CREDENTIAL_NAMES,
  type StudioReviewer,
  StudioReviewerSchema,
  type WhiskersConfig,
} from '@code-whiskers/whiskers-domain'
import { dropStudioCache, readFromStudio } from '../studio-client'
import type { ResolvedReviewer, ReviewerCredentials } from './types'

const STUDIO_PATH = 'reviewer'

export function envCredentials(env: NodeJS.ProcessEnv = process.env): ReviewerCredentials {
  return Object.fromEntries(
    REVIEW_CREDENTIAL_NAMES.flatMap((name) => {
      const value = env[name]?.trim()
      return value ? [[name, value]] : []
    }),
  )
}

function verifyModelOf(value: string | null, inherited: string | undefined): string | undefined {
  if (value === null) return inherited
  return value.toLowerCase() === 'off' ? undefined : value
}

/**
 * Studio's settings over the worker's env. Switching provider in studio drops the env's models,
 * which name the env's provider; studio's own models always win.
 */
export function applyStudioReviewer(
  base: WhiskersConfig,
  studio: StudioReviewer | null,
  env: NodeJS.ProcessEnv = process.env,
): ResolvedReviewer {
  const fromEnv = envCredentials(env)
  if (!studio) return { config: base, credentials: fromEnv }
  const { settings } = studio
  const stored = Object.fromEntries(
    Object.entries(studio.credentials).filter(
      ([name, value]) => REVIEW_CREDENTIAL_NAMES.includes(name) && value.trim(),
    ),
  )
  const credentials: ReviewerCredentials = { ...fromEnv, ...stored }
  const provider = settings.provider ?? base.review.provider
  const isSwitched = provider !== base.review.provider
  const model = settings.model ?? (isSwitched ? DEFAULT_REVIEW_MODELS[provider] : base.review.model)
  const inheritedVerify = isSwitched ? DEFAULT_VERIFY_MODELS[provider] : base.review.verifyModel
  const mentionProvider = settings.mentionProvider ?? base.mention.provider
  const isMentionSwitched = mentionProvider !== base.mention.provider
  const isMentionOnReview = mentionProvider === provider && (!!settings.model || isMentionSwitched)
  const mentionModel =
    settings.mentionModel ??
    (isMentionOnReview
      ? model
      : isMentionSwitched
        ? DEFAULT_REVIEW_MODELS[mentionProvider]
        : base.mention.model)
  return {
    config: {
      ...base,
      openrouter: {
        ...base.openrouter,
        apiKey: credentials.OPENROUTER_API_KEY ?? '',
      },
      openai: { ...base.openai, apiKey: credentials.OPENAI_API_KEY ?? '' },
      aiGateway: { ...base.aiGateway, apiKey: credentials.AI_GATEWAY_API_KEY ?? '' },
      review: {
        ...base.review,
        provider,
        model,
        verifyModel: verifyModelOf(settings.verifyModel, inheritedVerify),
        effort: settings.effort ?? base.review.effort,
        maxTurns: settings.maxTurns ?? base.review.maxTurns,
        maxBudgetUsd: settings.maxBudgetUsd ?? base.review.maxBudgetUsd,
      },
      mention: { provider: mentionProvider, model: mentionModel },
    },
    credentials,
  }
}

/** Cached with the rest of studio's reads; `fresh` drops the cache so a console save shows at once. */
export async function resolveReviewer(fresh = false): Promise<ResolvedReviewer> {
  if (fresh) dropStudioCache(STUDIO_PATH)
  const { value } = await readFromStudio<unknown>(STUDIO_PATH, {}, null)
  const parsed = value === null ? null : StudioReviewerSchema.safeParse(value)
  return applyStudioReviewer(whiskersEnvConfig, parsed?.success ? parsed.data : null)
}

/** Changes whenever anything that shapes a provider does, credentials included. */
export function fingerprintOf({ config, credentials }: ResolvedReviewer): string {
  return createHash('sha256')
    .update(JSON.stringify([config.review, config.mention, config.openrouter, credentials]))
    .digest('hex')
}
