import type { z } from 'zod'
import type {
  COMMIT_STATUSES,
  whiskersDeployEntrySchema,
  whiskersDeploySchema,
  whiskersReleaseCommitSchema,
  whiskersReleaseDetailSchema,
  whiskersReleaseSchema,
  whiskersReviewVerdictSchema,
  whiskersSuspectCommitSchema,
  whiskersSuspectCommitsSchema,
} from './release-schemas'

export type WhiskersRelease = z.infer<typeof whiskersReleaseSchema>
export type WhiskersReleaseEnvironment = WhiskersRelease['environments'][number]
export type WhiskersDeploy = z.infer<typeof whiskersDeploySchema>
export type WhiskersDeployEntry = z.infer<typeof whiskersDeployEntrySchema>
export type WhiskersReleaseDetail = z.infer<typeof whiskersReleaseDetailSchema>
export type WhiskersReleaseCommit = z.infer<typeof whiskersReleaseCommitSchema>
export type WhiskersSuspectCommit = z.infer<typeof whiskersSuspectCommitSchema>
export type WhiskersSuspectCommits = z.infer<typeof whiskersSuspectCommitsSchema>
export type WhiskersReviewVerdict = z.infer<typeof whiskersReviewVerdictSchema>
export type CommitStatus = (typeof COMMIT_STATUSES)[number]
