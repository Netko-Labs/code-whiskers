import {
  DEFAULT_REVIEW_MODELS,
  ReviewEffortSchema,
  type ReviewProviderId,
  ReviewProviderSchema,
  ReviewSandboxModeSchema,
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
    sandbox: ReviewSandboxModeSchema.parse(setting(env, 'REVIEW_AGENT_SANDBOX') ?? 'auto'),
    sandboxImage: setting(env, 'REVIEW_AGENT_SANDBOX_IMAGE') ?? 'debian:bookworm-slim',
    sandboxExecutable: setting(env, 'CLAUDE_CODE_SANDBOX_EXECUTABLE'),
    jail: {
      uid: numeric(env, 'REVIEW_AGENT_JAIL_UID') ?? 65_534,
      cpuSeconds: numeric(env, 'REVIEW_AGENT_JAIL_CPU_SECONDS') ?? 1_200,
      memoryMb: numeric(env, 'REVIEW_AGENT_JAIL_MEMORY_MB') ?? 8_192,
      processes: numeric(env, 'REVIEW_AGENT_JAIL_PROCESSES') ?? 512,
      fileSizeMb: numeric(env, 'REVIEW_AGENT_JAIL_FILE_SIZE_MB') ?? 256,
      openFiles: numeric(env, 'REVIEW_AGENT_JAIL_OPEN_FILES') ?? 4_096,
    },
  }
}

/** Mentions and the fix agent stay on OpenRouter; they follow `REVIEW_MODEL` only while reviews do. */
export function openrouterModelFrom(env: NodeJS.ProcessEnv): string {
  const reviewModel = reviewProviderFrom(env) === 'openrouter' ? setting(env, 'REVIEW_MODEL') : null
  return setting(env, 'OPENROUTER_MODEL') ?? reviewModel ?? DEFAULT_REVIEW_MODELS.openrouter
}
