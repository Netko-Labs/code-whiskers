import { z } from 'zod'

export const API_KEY_NAME_MAX = 80

export const ApiKeyCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name it after where it will live')
    .max(API_KEY_NAME_MAX, `Keep it under ${API_KEY_NAME_MAX} characters`),
})
export type ApiKeyCreate = z.infer<typeof ApiKeyCreateSchema>
