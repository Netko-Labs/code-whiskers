import { z } from 'zod'

export const SavedQueryCreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  section: z.enum(['live-logs', 'traces', 'issues']),
  tab: z.coerce.number().int().min(0).max(10).default(0),
  query: z.string().trim().max(200).nullable().default(null),
  service: z.string().trim().max(200).nullable().default(null),
})
export type SavedQueryCreate = z.infer<typeof SavedQueryCreateSchema>
