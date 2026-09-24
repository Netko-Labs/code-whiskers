import { z } from 'zod'

export const ApiKeyCreateSchema = z.object({ name: z.string().trim().min(1).max(80) })
export type ApiKeyCreate = z.infer<typeof ApiKeyCreateSchema>
