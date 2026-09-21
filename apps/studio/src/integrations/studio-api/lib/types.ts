import type { z } from 'zod'
import type { organizationSchema, repositorySchema, syncResultSchema } from './schemas'

export type Organization = z.infer<typeof organizationSchema>
export type Repository = z.infer<typeof repositorySchema>
export type SyncResult = z.infer<typeof syncResultSchema>
