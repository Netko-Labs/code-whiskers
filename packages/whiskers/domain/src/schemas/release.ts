import { z } from 'zod'
import { COMMIT_SHA_PATTERN, MAX_ENVIRONMENT_LENGTH, MAX_VERSION_LENGTH } from '../values'
import { RepositorySlugSchema } from './project'

const VersionSchema = z.string().trim().min(1).max(MAX_VERSION_LENGTH)

/** CI or Coolify after a deploy: `POST /api/:projectId/deploys`, authenticated by a client key. */
export const DeployBodySchema = z.object({
  version: VersionSchema,
  environment: z.string().trim().min(1).max(MAX_ENVIRONMENT_LENGTH),
  url: z.url().max(500).optional(),
  name: z.string().trim().min(1).max(200).optional(),
  repository: RepositorySlugSchema.optional(),
  commitSha: z.string().trim().regex(COMMIT_SHA_PATTERN, 'a git sha').optional(),
  deployedAt: z.coerce.date().optional(),
})
export type DeployBody = z.infer<typeof DeployBodySchema>

export const ReleaseDetailQuerySchema = z.object({
  projectId: z.string().min(1).max(200),
  version: VersionSchema,
})
export type ReleaseDetailQuery = z.infer<typeof ReleaseDetailQuerySchema>
