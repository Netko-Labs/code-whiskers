import { z } from 'zod'
import { REVIEW_EFFORTS, REVIEW_PROVIDERS } from '../values/reviewer'

export const ReviewProviderSchema = z.enum(REVIEW_PROVIDERS)
export type ReviewProviderId = z.infer<typeof ReviewProviderSchema>

export const ReviewEffortSchema = z.enum(REVIEW_EFFORTS)

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

const InheritedModelSchema = z.string().trim().min(1).nullable().catch(null)

/** Studio's `/api/internal/reviewer`: null or a value this worker cannot use inherits from env. */
export const StudioReviewerSchema = z.object({
  settings: z.object({
    provider: ReviewProviderSchema.nullable().catch(null),
    model: InheritedModelSchema,
    verifyModel: InheritedModelSchema,
    mentionModel: InheritedModelSchema,
    effort: ReviewEffortSchema.nullable().catch(null),
    maxTurns: z.number().int().positive().nullable().catch(null),
    maxBudgetUsd: z.number().positive().nullable().catch(null),
  }),
  credentials: z.record(z.string(), z.string()).catch({}),
})
export type StudioReviewer = z.infer<typeof StudioReviewerSchema>
