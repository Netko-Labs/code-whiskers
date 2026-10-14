/** Mirrors whiskers' providers; whiskers validates what it reads and falls back to env on a mismatch. */
export const REVIEWER_PROVIDERS = ['openrouter', 'ai-gateway', 'openai', 'claude'] as const
export const REVIEWER_EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max'] as const

export const REVIEWER_CREDENTIALS = [
  'OPENROUTER_API_KEY',
  'AI_GATEWAY_API_KEY',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'CLAUDE_CODE_OAUTH_TOKEN',
] as const

export const REVIEWER_MODEL_MAX = 200
export const REVIEWER_CREDENTIAL_MAX = 8_000
export const REVIEWER_MAX_TURNS_LIMIT = 200
export const REVIEWER_MAX_BUDGET_LIMIT_USD = 100
