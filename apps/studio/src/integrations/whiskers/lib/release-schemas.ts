import { z } from 'zod'
import { whiskersIssueSchema } from './schemas'

export const COMMIT_STATUSES = [
  'synced',
  'pending',
  'failed',
  'no-repository',
  'no-commit',
] as const

export const whiskersDeploySchema = z.object({
  id: z.string(),
  releaseId: z.string(),
  environment: z.string(),
  deployedAt: z.coerce.date(),
  url: z.string().nullable(),
  name: z.string().nullable(),
})

export const whiskersReleaseSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  release: z.string(),
  environment: z.string().nullable(),
  environments: z
    .array(
      z.object({
        name: z.string(),
        isCurrent: z.boolean(),
        deployedAt: z.coerce.date().nullable(),
      }),
    )
    .default([]),
  firstSeen: z.coerce.date(),
  lastSeen: z.coerce.date(),
  events: z.number(),
  issues: z.number(),
  newIssues: z.number(),
  newErrors: z.number().default(0),
  trend: z.array(z.number()).default([]),
  commitCount: z.number().default(0),
  lastDeploy: whiskersDeploySchema.nullable().default(null),
  repository: z.string().nullable().default(null),
  commitSha: z.string().nullable().default(null),
})
export const whiskersReleaseListSchema = z.array(whiskersReleaseSchema)

export const whiskersReviewVerdictSchema = z.object({
  id: z.string(),
  status: z.string(),
  verdict: z.string().nullable(),
})

const commitFields = {
  sha: z.string(),
  message: z.string(),
  authorName: z.string(),
  authorLogin: z.string().nullable(),
  authorAvatar: z.string().nullable(),
  committedAt: z.coerce.date(),
  prNumber: z.number().nullable(),
  files: z.array(z.string()).default([]),
  review: whiskersReviewVerdictSchema.nullable().default(null),
}

export const whiskersReleaseCommitSchema = z.object({
  ...commitFields,
  suspectIssueIds: z.array(z.string()).default([]),
})

export const whiskersSuspectCommitSchema = z.object({
  ...commitFields,
  matchedFiles: z.array(z.string()).default([]),
})

export const whiskersDeployEntrySchema = whiskersDeploySchema.extend({
  version: z.string(),
  isActive: z.boolean(),
  isThisRelease: z.boolean(),
})

export const whiskersReleaseDetailSchema = z.object({
  release: z.object({
    id: z.string(),
    projectId: z.string(),
    version: z.string(),
    repository: z.string().nullable(),
    commitSha: z.string().nullable(),
    firstSeen: z.coerce.date(),
    lastSeen: z.coerce.date(),
    createdAt: z.coerce.date(),
    commitsSyncedAt: z.coerce.date().nullable(),
  }),
  repository: z.string().nullable(),
  previousVersion: z.string().nullable(),
  commitStatus: z.enum(COMMIT_STATUSES),
  stats: z.object({
    events: z.number(),
    issues: z.number(),
    users: z.number(),
    newIssues: z.number(),
  }),
  environments: z.array(z.object({ name: z.string(), count: z.number() })).default([]),
  histogram: z.array(z.object({ bucket: z.coerce.date(), count: z.number() })).default([]),
  newIssues: z.array(whiskersIssueSchema).default([]),
  regressedIssues: z.array(whiskersIssueSchema).default([]),
  resolvedIssues: z.array(whiskersIssueSchema).default([]),
  commits: z.array(whiskersReleaseCommitSchema).default([]),
  deploys: z.array(whiskersDeployEntrySchema).default([]),
})

export const whiskersSuspectCommitsSchema = z.object({
  version: z.string().nullable(),
  repository: z.string().nullable().default(null),
  commitStatus: z.enum(COMMIT_STATUSES).nullable(),
  commits: z.array(whiskersSuspectCommitSchema).default([]),
})
