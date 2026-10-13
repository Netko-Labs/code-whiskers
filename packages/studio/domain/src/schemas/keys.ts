import { z } from 'zod'

export const API_KEY_NAME_MAX = 80

/** `read` reads /v1; `loop` also drives the review loop over MCP (replies, context notes). */
export const API_KEY_SCOPES = ['read', 'loop'] as const

export const ApiKeyCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name it after where it will live')
    .max(API_KEY_NAME_MAX, `Keep it under ${API_KEY_NAME_MAX} characters`),
  scope: z.enum(API_KEY_SCOPES).default('read'),
})
export type ApiKeyCreate = z.infer<typeof ApiKeyCreateSchema>
