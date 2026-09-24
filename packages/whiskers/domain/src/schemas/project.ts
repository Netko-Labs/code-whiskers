import { z } from 'zod'

const RepositorySlugSchema = z
  .string()
  .trim()
  .regex(/^[\w.-]+\/[\w.-]+$/, 'owner/name')
  .max(200)

export const ProjectCreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  repository: RepositorySlugSchema.nullable().optional(),
})

export const ProjectRepositorySchema = z.object({ repository: RepositorySlugSchema.nullable() })

/** Comma-separated project ids: a repository scope can span more than one project. */
export const ProjectScopeSchema = z.object({ projectId: z.string().max(400).optional() })

export const LogQuerySchema = ProjectScopeSchema.extend({
  service: z.string().max(200).optional(),
  level: z.enum(['error', 'warn']).optional(),
  q: z.string().max(200).optional(),
  before: z.coerce.number().int().positive().optional(),
})

export const TraceQuerySchema = ProjectScopeSchema.extend({
  service: z.string().max(200).optional(),
})

export const ReviewRerunSchema = z.object({
  owner: z.string().min(1).max(100),
  repo: z.string().min(1).max(100),
  prNumber: z.coerce.number().int().positive(),
})
