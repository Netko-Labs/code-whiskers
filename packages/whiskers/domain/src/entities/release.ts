import { createSelectSchema } from 'drizzle-zod'
import type { z } from 'zod'
import { deployTable, releaseCommitTable, releaseTable } from '../db'

export const ReleaseSchema = createSelectSchema(releaseTable)
export type Release = z.infer<typeof ReleaseSchema>

export const DeploySchema = createSelectSchema(deployTable)
export type Deploy = z.infer<typeof DeploySchema>

export const ReleaseCommitSchema = createSelectSchema(releaseCommitTable)
export type ReleaseCommit = z.infer<typeof ReleaseCommitSchema>
