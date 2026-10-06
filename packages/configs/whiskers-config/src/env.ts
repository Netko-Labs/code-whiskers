import { dsnOf, environmentOf, releaseOf } from '@code-whiskers/observability'
import { type WhiskersConfig, WhiskersConfigSchema } from '@code-whiskers/whiskers-domain'
import { openrouterModelFrom, reviewConfigFrom } from './review'

const whiskersConfig: WhiskersConfig = {
  app: {
    dev: process.env.NODE_ENV !== 'production',
    port: Number(process.env.PORT ?? 3002),
    cors: process.env.CORS?.split(',') ?? ['https://studio.localhost', 'http://localhost:3000'],
    webBaseUrl: process.env.WEB_BASE_URL ?? 'https://studio.localhost',
    // Presented to studio's /api/internal/*; empty disables the call entirely.
    internalToken: process.env.INTERNAL_TOKEN ?? '',
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
    model: openrouterModelFrom(process.env),
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
  },
  aiGateway: {
    apiKey: process.env.AI_GATEWAY_API_KEY ?? '',
  },
  review: reviewConfigFrom(process.env),
  telemetry: {
    retentionDays: Number(process.env.TELEMETRY_RETENTION_DAYS ?? 7),
    errorEventRetentionDays: Number(process.env.ERROR_EVENT_RETENTION_DAYS ?? 90),
  },
  observability: {
    serviceName: 'whiskers',
    release: releaseOf(process.env),
    environment: environmentOf(process.env),
    dsn: dsnOf(process.env.SENTRY_DSN),
  },
}

export const whiskersEnvConfig = WhiskersConfigSchema.parse(whiskersConfig)
