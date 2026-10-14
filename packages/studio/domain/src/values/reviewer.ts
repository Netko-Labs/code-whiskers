/** Mirrors whiskers' providers; whiskers validates what it reads and falls back to env on a mismatch. */
export const REVIEWER_PROVIDERS = ['openrouter', 'ai-gateway', 'openai', 'claude'] as const
export const REVIEWER_EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max'] as const

export const REVIEWER_CREDENTIALS = [
  'OPENROUTER_API_KEY',
  'AI_GATEWAY_API_KEY',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
] as const

export const REVIEWER_MODEL_MAX = 200
export const REVIEWER_CREDENTIAL_MAX = 8_000
export const REVIEWER_MAX_TURNS_LIMIT = 200
export const REVIEWER_MAX_BUDGET_LIMIT_USD = 100

export const MODELS_DEV_URL = 'https://models.dev/api.json'

/** Which models.dev provider lists the ids each reviewer provider accepts. */
export const MODELS_DEV_PROVIDER = {
  openrouter: 'openrouter',
  'ai-gateway': 'vercel',
  openai: 'openai',
  claude: 'anthropic',
} as const satisfies Record<(typeof REVIEWER_PROVIDERS)[number], string>
