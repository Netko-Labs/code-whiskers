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
  },
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY ?? '',
    model: process.env.REVIEW_MODEL ?? 'anthropic/claude-sonnet-4.5',
  },
}

export const whiskersEnvConfig = WhiskersConfigSchema.parse(whiskersConfig)
