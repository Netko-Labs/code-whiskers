import { z } from 'zod'

export const INTEGRATION_KINDS = ['slack', 'discord', 'webhook'] as const

export const IntegrationCreateSchema = z.object({
  installationId: z.coerce.number().int().positive(),
  kind: z.enum(INTEGRATION_KINDS),
  name: z.string().trim().min(1).max(80),
  url: z
    .string()
    .trim()
    .url()
    .refine((url) => url.startsWith('https://'), 'The webhook URL must use https'),
})
export type IntegrationCreate = z.infer<typeof IntegrationCreateSchema>
