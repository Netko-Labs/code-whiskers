import { z } from 'zod'

export const organizationSchema = z.object({
  installationId: z.number(),
  login: z.string(),
  name: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  accountType: z.enum(['User', 'Organization']),
  syncedAt: z.coerce.date(),
})

export const repositorySchema = z.object({
  id: z.number(),
  installationId: z.number(),
  owner: z.string(),
  name: z.string(),
  isPrivate: z.boolean(),
  isWatched: z.boolean(),
  language: z.string().nullable(),
  defaultBranch: z.string().nullable(),
  pushedAt: z.coerce.date().nullable(),
  syncedAt: z.coerce.date(),
})

export const organizationListSchema = z.array(organizationSchema)
export const repositoryListSchema = z.array(repositorySchema)

export const syncResultSchema = z.object({
  organizations: z.number(),
  repositories: z.number(),
  skipped: z.literal('no-github-account').optional(),
})
