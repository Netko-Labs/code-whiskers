import { type WhiskersConfig, WhiskersConfigSchema } from '@code-whiskers/whiskers-domain'

const whiskersConfig: WhiskersConfig = {
  app: {
    dev: process.env.NODE_ENV !== 'production',
    port: Number(process.env.PORT ?? 3002),
    cors: process.env.CORS?.split(',') ?? ['http://localhost:3000'],
    webBaseUrl: process.env.WEB_BASE_URL ?? 'http://localhost:3000',
  },
  db: {
    url: process.env.DATABASE_URL ?? '',
  },
  github: {
    token: process.env.GITHUB_TOKEN ?? '',
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET ?? '',
    appId: process.env.GITHUB_APP_ID ?? '',
    appPrivateKey: Buffer.from(process.env.GITHUB_APP_PRIVATE_KEY_B64 ?? '', 'base64').toString(
      'utf8',
    ),
    botHandle: process.env.GITHUB_BOT_HANDLE ?? 'code-whiskers',
  },
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY ?? '',
    model: process.env.REVIEW_MODEL ?? 'anthropic/claude-sonnet-4.5',
    providerOrder: (process.env.REVIEW_PROVIDER_ORDER ?? '')
      .split(',')
      .map((slug) => slug.trim())
      .filter(Boolean),
  },
  review: {
    minSeverity: (process.env.REVIEW_MIN_SEVERITY ??
      'low') as WhiskersConfig['review']['minSeverity'],
  },
  fix: {
    maxTurns: Number(process.env.FIX_AGENT_MAX_TURNS ?? 12),
    execTimeoutMs: Number(process.env.FIX_AGENT_EXEC_TIMEOUT_MS ?? 120_000),
  },
}

export const whiskersEnvConfig = WhiskersConfigSchema.parse(whiskersConfig)
