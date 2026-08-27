import { z } from 'zod'

export const WhiskersConfigSchema = z.object({
  app: z.object({
    dev: z.boolean(),
    port: z.number().default(3002),
    cors: z.array(z.string()).default(['http://localhost:3000']),
    webBaseUrl: z.string().default('http://localhost:3000'),
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
    model: z.string().default('anthropic/claude-sonnet-4.5'),
  }),
  fix: z.object({
    maxTurns: z.number().int().positive().default(12),
    execTimeoutMs: z.number().int().positive().default(120_000),
  }),
})
export type WhiskersConfig = z.infer<typeof WhiskersConfigSchema>
