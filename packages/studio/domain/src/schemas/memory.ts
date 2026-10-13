import { z } from 'zod'

export const MEMORY_KINDS = ['rule', 'preference', 'dont_flag', 'context', 'lesson'] as const
export const MEMORY_SOURCES = ['human', 'review', 'fix', 'agent'] as const
export const MEMORY_STATUSES = ['active', 'retired'] as const
export const MEMORY_ACTIONS = [
  'created',
  'edited',
  'retired',
  'restored',
  'deleted',
  'undone',
] as const

export const MEMORY_BODY_MAX = 600
export const MEMORY_PATHS_MAX = 10

const body = z.string().trim().min(3).max(MEMORY_BODY_MAX)
const paths = z.array(z.string().trim().min(1).max(200)).max(MEMORY_PATHS_MAX)

export const MemoryNoteCreateSchema = z.object({
  installationId: z.coerce.number().int().positive(),
  repositoryId: z.coerce.number().int().positive().nullable().default(null),
  kind: z.enum(MEMORY_KINDS),
  body,
  paths: paths.default([]),
})
export type MemoryNoteCreate = z.infer<typeof MemoryNoteCreateSchema>

export const MemoryNoteUpdateSchema = z.object({
  repositoryId: z.coerce.number().int().positive().nullable().optional(),
  kind: z.enum(MEMORY_KINDS).optional(),
  body: body.optional(),
  paths: paths.optional(),
  status: z.enum(MEMORY_STATUSES).optional(),
})
export type MemoryNoteUpdate = z.infer<typeof MemoryNoteUpdateSchema>

/** Whiskers reading what applies to one repository; `q` ranks the notes by full-text match. */
export const MemoryContextQuerySchema = z.object({
  repo: z.string().min(3),
  q: z.string().max(2_000).optional(),
})

/** Whiskers writing what it learned. Humans write through the session API instead. */
export const MemoryLearnSchema = z.object({
  repo: z.string().min(3),
  kind: z.enum(MEMORY_KINDS),
  body,
  paths: paths.default([]),
  source: z.enum(MEMORY_SOURCES).exclude(['human']),
  sourceUrl: z.string().url().max(500).optional(),
  actor: z.string().trim().min(1).max(100),
})
export type MemoryLearn = z.infer<typeof MemoryLearnSchema>

export const MemoryUsedSchema = z.object({ ids: z.array(z.string().uuid()).max(100) })
