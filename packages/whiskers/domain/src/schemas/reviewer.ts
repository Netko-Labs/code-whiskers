import { z } from 'zod'
import { REVIEW_EFFORTS, REVIEW_PROVIDERS, REVIEW_SANDBOX_MODES } from '../values/reviewer'

export const ReviewProviderSchema = z.enum(REVIEW_PROVIDERS)
export type ReviewProviderId = z.infer<typeof ReviewProviderSchema>

export const ReviewEffortSchema = z.enum(REVIEW_EFFORTS)

export const ReviewSandboxModeSchema = z.enum(REVIEW_SANDBOX_MODES)

/** Presence only: a credential's value never leaves the worker. */
export const ReviewerCredentialSchema = z.object({
  name: z.string(),
  isSet: z.boolean(),
})

export const ReviewerExecutableSchema = z.object({
  name: z.string(),
  path: z.string().nullable(),
  source: z.enum(['env', 'bundled', 'path', 'sdk', 'missing']),
})

export const ReviewerStatusSchema = z.object({
  provider: ReviewProviderSchema,
  model: z.string(),
  isAgentic: z.boolean(),
  credentials: z.array(ReviewerCredentialSchema),
  executable: ReviewerExecutableSchema.nullable(),
  sandbox: z.enum(['docker', 'host']).nullable(),
  problems: z.array(z.string()),
})
export type ReviewerStatus = z.infer<typeof ReviewerStatusSchema>

export const ReviewerTestResultSchema = z.object({
  provider: ReviewProviderSchema,
  model: z.string(),
  isOk: z.boolean(),
  latencyMs: z.number(),
  error: z.string().nullable(),
})
export type ReviewerTestResult = z.infer<typeof ReviewerTestResultSchema>
