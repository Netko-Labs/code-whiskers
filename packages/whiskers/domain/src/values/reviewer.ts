export const REVIEW_PROVIDERS = ['openrouter', 'ai-gateway', 'openai', 'claude'] as const

export const REVIEW_EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max'] as const

export const DEFAULT_REVIEW_MODELS = {
  openrouter: 'openai/gpt-6-luna',
  'ai-gateway': 'openai/gpt-6-luna',
  openai: 'gpt-6-luna',
  claude: 'claude-haiku-5-5',
} as const satisfies Record<(typeof REVIEW_PROVIDERS)[number], string>

/**
 * The model that re-checks each finding in the checkout before it is posted. Agentic providers
 * only; measured on 11 labelled PRs, Haiku finding + Sonnet checking kept 75% precision with no
 * false blockers at ~$0.03 a review.
 */
export const DEFAULT_VERIFY_MODELS: Partial<Record<(typeof REVIEW_PROVIDERS)[number], string>> = {
  claude: 'claude-sonnet-5-5',
}

/** Credentials each provider can authenticate with; any one of them is enough. */
export const REVIEW_PROVIDER_CREDENTIALS = {
  openrouter: ['OPENROUTER_API_KEY'],
  'ai-gateway': ['AI_GATEWAY_API_KEY'],
  openai: ['OPENAI_API_KEY'],
  claude: ['ANTHROPIC_API_KEY'],
} as const satisfies Record<(typeof REVIEW_PROVIDERS)[number], readonly string[]>

export const REVIEW_CREDENTIAL_NAMES = [
  ...new Set(Object.values(REVIEW_PROVIDER_CREDENTIALS).flat()),
] as readonly string[]
