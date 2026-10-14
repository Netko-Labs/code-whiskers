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

export const ModelCatalogQuerySchema = z.object({ provider: z.enum(REVIEWER_PROVIDERS) })

const PriceSchema = z.number().nonnegative().optional().catch(undefined)

/** One models.dev entry, read leniently: anything malformed reads as unknown, never as a failure. */
export const ModelsDevModelSchema = z.object({
  id: z.string().min(1),
  name: z.string().catch(''),
  release_date: z.string().optional().catch(undefined),
  status: z.string().optional().catch(undefined),
  reasoning: z.boolean().catch(false),
  tool_call: z.boolean().catch(false),
  structured_output: z.boolean().optional().catch(undefined),
  limit: z.object({ context: z.number().optional().catch(undefined) }).catch({}),
  cost: z
    .object({
      input: PriceSchema,
      output: PriceSchema,
      context_over_200k: z
        .object({ input: PriceSchema, output: PriceSchema })
        .optional()
        .catch(undefined),
      tiers: z
        .array(
          z.object({
            input: PriceSchema,
            output: PriceSchema,
            tier: z.object({ type: z.string(), size: z.number() }),
          }),
        )
        .optional()
        .catch(undefined),
    })
    .catch({}),
})
export type ModelsDevModel = z.infer<typeof ModelsDevModelSchema>

/** Prices in USD per million tokens; `tier` is the dearer rate past a context size. */
export const CatalogModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  releaseDate: z.string().nullable(),
  context: z.number().nullable(),
  inputCost: z.number().nullable(),
  outputCost: z.number().nullable(),
  tier: z
    .object({
      contextOver: z.number(),
      inputCost: z.number().nullable(),
      outputCost: z.number().nullable(),
    })
    .nullable(),
  isReasoning: z.boolean(),
  hasTools: z.boolean(),
  isDeprecated: z.boolean(),
})
export type CatalogModel = z.infer<typeof CatalogModelSchema>
