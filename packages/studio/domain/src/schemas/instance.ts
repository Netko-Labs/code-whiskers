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
