import { z } from 'zod'

const MAX_PARAMS_CHARS = 4_000

export const SavedQueryCreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  section: z.enum(['live-logs', 'traces', 'issues']),
  tab: z.coerce.number().int().min(0).max(10).default(0),
  query: z.string().trim().max(200).nullable().default(null),
  service: z.string().trim().max(200).nullable().default(null),
  params: z
    .record(z.string().max(40), z.unknown())
    .refine((params) => JSON.stringify(params).length <= MAX_PARAMS_CHARS, 'view too large')
    .default({}),
})
export type SavedQueryCreate = z.infer<typeof SavedQueryCreateSchema>

export const SavedQueryRenameSchema = z.object({ name: z.string().trim().min(1).max(80) })
export type SavedQueryRename = z.infer<typeof SavedQueryRenameSchema>
