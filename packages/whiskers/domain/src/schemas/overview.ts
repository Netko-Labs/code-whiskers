import { z } from 'zod'
import { OVERVIEW_RANGES } from '../values'
import { ProjectScopeSchema } from './project'

export const OverviewRangeSchema = z.enum(OVERVIEW_RANGES)
export type OverviewRange = z.infer<typeof OverviewRangeSchema>

/** `repository` scopes reviews; a project scope without one counts no reviews. */
export const OverviewQuerySchema = ProjectScopeSchema.extend({
  range: OverviewRangeSchema.default('7d'),
  repository: z.string().max(200).optional(),
})
export type OverviewQuery = z.infer<typeof OverviewQuerySchema>
