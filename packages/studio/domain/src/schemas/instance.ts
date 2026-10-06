import { z } from 'zod'

export const INSTANCE_NAME_MAX = 60

export const InstanceSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Give the instance a name')
    .max(INSTANCE_NAME_MAX, `Keep it under ${INSTANCE_NAME_MAX} characters`),
})
export type InstanceSettings = z.infer<typeof InstanceSettingsSchema>

/** What whiskers' `/health` answers; anything else counts as unreachable. */
export const WhiskersHealthBodySchema = z.object({
  status: z.string(),
  release: z.string().nullish(),
  environment: z.string().nullish(),
})

/** What whiskers' `/internal/reviewer` answers: credentials are presence flags, never values. */
export const WhiskersReviewerSchema = z.object({
  provider: z.string(),
  model: z.string(),
  isAgentic: z.boolean(),
  credentials: z.array(z.object({ name: z.string(), isSet: z.boolean() })),
  executable: z
    .object({ name: z.string(), path: z.string().nullable(), source: z.string() })
    .nullable(),
  problems: z.array(z.string()),
})
export type WhiskersReviewer = z.infer<typeof WhiskersReviewerSchema>

export const WhiskersReviewerTestSchema = z.object({
  provider: z.string(),
  model: z.string(),
  isOk: z.boolean(),
  latencyMs: z.number(),
  error: z.string().nullable(),
})
export type WhiskersReviewerTest = z.infer<typeof WhiskersReviewerTestSchema>
