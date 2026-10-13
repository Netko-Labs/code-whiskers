import { z } from 'zod'
import {
  REVIEWER_CREDENTIAL_MAX,
  REVIEWER_CREDENTIALS,
  REVIEWER_EFFORTS,
  REVIEWER_MAX_BUDGET_LIMIT_USD,
  REVIEWER_MAX_TURNS_LIMIT,
  REVIEWER_MODEL_MAX,
  REVIEWER_PROVIDERS,
} from '../values/reviewer'

const ModelSchema = z.string().trim().min(1).max(REVIEWER_MODEL_MAX).nullable()

/** Null inherits: the worker's env first, then the provider's default. `verifyModel: 'off'` skips the checker. */
export const ReviewerSettingsSchema = z.object({
  provider: z.enum(REVIEWER_PROVIDERS).nullable(),
  model: ModelSchema,
  verifyModel: ModelSchema,
  mentionModel: ModelSchema,
  effort: z.enum(REVIEWER_EFFORTS).nullable(),
  maxTurns: z.number().int().min(1).max(REVIEWER_MAX_TURNS_LIMIT).nullable(),
  maxBudgetUsd: z.number().positive().max(REVIEWER_MAX_BUDGET_LIMIT_USD).nullable(),
})
export type ReviewerSettings = z.infer<typeof ReviewerSettingsSchema>

export const ReviewerCredentialNameSchema = z.enum(REVIEWER_CREDENTIALS)
export type ReviewerCredentialName = z.infer<typeof ReviewerCredentialNameSchema>

/** Write-only: a value replaces the stored one, null removes it. */
export const ReviewerCredentialSchema = z.object({
  name: ReviewerCredentialNameSchema,
  value: z.string().trim().min(1).max(REVIEWER_CREDENTIAL_MAX).nullable(),
})
export type ReviewerCredentialInput = z.infer<typeof ReviewerCredentialSchema>
