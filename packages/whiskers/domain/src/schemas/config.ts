import { z } from 'zod'
import { DEFAULT_REVIEW_MODELS } from '../values/reviewer'
import { ReviewEffortSchema, ReviewProviderSchema } from './reviewer'

export const WhiskersConfigSchema = z.object({
  app: z.object({
    dev: z.boolean(),
    port: z.number().default(3002),
    cors: z.array(z.string()).default(['https://studio.localhost', 'http://localhost:3000']),
    webBaseUrl: z.string().default('https://studio.localhost'),
    internalToken: z.string().default(''),
  }),
  db: z.object({
    url: z.string(),
  }),
  github: z.object({
    token: z.string().default(''),
    webhookSecret: z.string().default(''),
    appId: z.string().default(''),
    appPrivateKey: z.string().default(''),
    botHandle: z.string().default('code-whiskers'),
  }),
  openrouter: z.object({
    apiKey: z.string().default(''),
    model: z.string().default(DEFAULT_REVIEW_MODELS.openrouter),
  }),
  openai: z.object({
    apiKey: z.string().default(''),
  }),
  aiGateway: z.object({
    apiKey: z.string().default(''),
  }),
  review: z.object({
    provider: ReviewProviderSchema.default('openrouter'),
    model: z.string().min(1),
    effort: ReviewEffortSchema.default('medium'),
    maxTurns: z.number().int().positive().default(40),
    timeoutMs: z.number().int().positive().default(600_000),
    maxBudgetUsd: z.number().positive().optional(),
    claudeExecutable: z.string().optional(),
  }),
  telemetry: z.object({
    retentionDays: z.number().int().positive().default(7),
    errorEventRetentionDays: z.number().int().positive().default(90),
  }),
  observability: z.object({
    serviceName: z.string(),
    release: z.string(),
    environment: z.string(),
    dsn: z.string().optional(),
  }),
  fix: z.object({
    maxTurns: z.number().int().positive().default(12),
    execTimeoutMs: z.number().int().positive().default(120_000),
  }),
})
export type WhiskersConfig = z.infer<typeof WhiskersConfigSchema>
