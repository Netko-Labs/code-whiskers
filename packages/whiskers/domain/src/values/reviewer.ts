export const REVIEW_PROVIDERS = ['openrouter', 'ai-gateway', 'openai', 'claude'] as const

export const REVIEW_EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max'] as const

export const DEFAULT_REVIEW_MODELS = {
  openrouter: 'openai/gpt-6-luna',
  'ai-gateway': 'openai/gpt-6-luna',
  openai: 'gpt-6-luna',
  claude: 'claude-opus-5-5',
} as const satisfies Record<(typeof REVIEW_PROVIDERS)[number], string>

/** Credentials each provider can authenticate with; any one of them is enough. */
export const REVIEW_PROVIDER_CREDENTIALS = {
  openrouter: ['OPENROUTER_API_KEY'],
  'ai-gateway': ['AI_GATEWAY_API_KEY'],
  openai: ['OPENAI_API_KEY'],
  claude: ['CLAUDE_CODE_OAUTH_TOKEN', 'ANTHROPIC_API_KEY'],
} as const satisfies Record<(typeof REVIEW_PROVIDERS)[number], readonly string[]>
