import {
  DEFAULT_REVIEW_MODELS,
  DEFAULT_VERIFY_MODELS,
  ReviewEffortSchema,
  type ReviewProviderId,
  ReviewProviderSchema,
  type WhiskersConfig,
} from '@code-whiskers/whiskers-domain'

function setting(env: NodeJS.ProcessEnv, name: string): string | undefined {
  const value = env[name]?.trim()
  return value ? value : undefined
}

function numeric(env: NodeJS.ProcessEnv, name: string): number | undefined {
  const value = setting(env, name)
  return value === undefined ? undefined : Number(value)
}

/** An unset provider is today's OpenRouter path; a typo fails the boot rather than reviewing elsewhere. */
export function reviewProviderFrom(env: NodeJS.ProcessEnv): ReviewProviderId {
  return ReviewProviderSchema.parse(setting(env, 'REVIEW_PROVIDER') ?? 'openrouter')
}

/** `REVIEW_VERIFY_MODEL=off` posts findings unchecked; unset keeps the provider's default checker. */
function verifyModelFrom(env: NodeJS.ProcessEnv, provider: ReviewProviderId): string | undefined {
  const value = setting(env, 'REVIEW_VERIFY_MODEL')
  if (value?.toLowerCase() === 'off') return undefined
  return value ?? DEFAULT_VERIFY_MODELS[provider]
}

/** `REVIEW_MODEL` overrides the active provider's default model, whichever provider that is. */
export function reviewConfigFrom(env: NodeJS.ProcessEnv): WhiskersConfig['review'] {
  const provider = reviewProviderFrom(env)
  return {
    provider,
    model: setting(env, 'REVIEW_MODEL') ?? DEFAULT_REVIEW_MODELS[provider],
    effort: ReviewEffortSchema.parse(setting(env, 'REVIEW_AGENT_EFFORT') ?? 'medium'),
    maxTurns: numeric(env, 'REVIEW_AGENT_MAX_TURNS') ?? 40,
    timeoutMs: numeric(env, 'REVIEW_AGENT_TIMEOUT_MS') ?? 600_000,
    maxBudgetUsd: numeric(env, 'REVIEW_AGENT_MAX_BUDGET_USD'),
    claudeExecutable: setting(env, 'CLAUDE_CODE_EXECUTABLE'),
    verifyModel: verifyModelFrom(env, provider),
  }
}

/**
 * Mentions and fix replies default to OpenRouter. `MENTION_MODEL` (or the older `OPENROUTER_MODEL`
 * on OpenRouter) names the model; otherwise they follow `REVIEW_MODEL` while on the review provider.
 */
export function mentionConfigFrom(env: NodeJS.ProcessEnv): WhiskersConfig['mention'] {
  const provider = ReviewProviderSchema.parse(setting(env, 'MENTION_PROVIDER') ?? 'openrouter')
  const legacy = provider === 'openrouter' ? setting(env, 'OPENROUTER_MODEL') : undefined
  const reviewModel =
    reviewProviderFrom(env) === provider ? setting(env, 'REVIEW_MODEL') : undefined
  return {
    provider,
    model:
      setting(env, 'MENTION_MODEL') ?? legacy ?? reviewModel ?? DEFAULT_REVIEW_MODELS[provider],
  }
}
