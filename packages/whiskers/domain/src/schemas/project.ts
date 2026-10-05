import { z } from 'zod'

export const RepositorySlugSchema = z
  .string()
  .trim()
  .regex(/^[\w.-]+\/[\w.-]+$/, 'owner/name')
  .max(200)

const ProjectNameSchema = z.string().trim().min(1).max(80)
const KeyLabelSchema = z.string().trim().min(1).max(60)

export const ProjectCreateSchema = z.object({
  name: ProjectNameSchema,
  repository: RepositorySlugSchema.nullable().optional(),
})

const hasAnyField = (patch: Record<string, unknown>) =>
  Object.values(patch).some((value) => value !== undefined)

export const ProjectUpdateSchema = z
  .object({
    name: ProjectNameSchema.optional(),
    repository: RepositorySlugSchema.nullable().optional(),
  })
  .refine(hasAnyField, 'nothing to change')
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>

export const ProjectKeyCreateSchema = z.object({ label: KeyLabelSchema })

export const ProjectKeyUpdateSchema = z
  .object({
    label: KeyLabelSchema.optional(),
    isEnabled: z.boolean().optional(),
  })
  .refine(hasAnyField, 'nothing to change')

export const ProjectKeyParamsSchema = z.object({
  projectId: z.string().min(1).max(200),
  keyId: z.guid(),
})
export type ProjectKeyUpdate = z.infer<typeof ProjectKeyUpdateSchema>

export const ProjectRepositorySchema = z.object({ repository: RepositorySlugSchema.nullable() })

/** Comma-separated project ids: a repository scope can span more than one project. */
export const ProjectScopeSchema = z.object({ projectId: z.string().max(400).optional() })

export const ReviewRerunSchema = z.object({
  owner: z.string().min(1).max(100),
  repo: z.string().min(1).max(100),
  prNumber: z.coerce.number().int().positive(),
})

export const ReviewIdParamSchema = z.object({ reviewId: z.string().uuid() })
