import { z } from 'zod'
import {
  DEFAULT_ISSUE_PAGE,
  HISTOGRAM_PERIODS,
  ISSUE_LIST_STATUSES,
  ISSUE_SORTS,
  ISSUE_STATUSES,
  ISSUE_TRANSITIONS,
  MAX_ISSUE_PAGE,
  MAX_LIFECYCLE_ISSUES,
  RESOLVE_MODES,
} from '../values'
import { ProjectScopeSchema } from './project'

export const IssueStatusSchema = z.enum(ISSUE_STATUSES)
export type IssueStatus = z.infer<typeof IssueStatusSchema>

export const ResolveSchema = z.object({ mode: z.enum(RESOLVE_MODES) })
export type Resolve = z.infer<typeof ResolveSchema>

export const ArchiveSchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('forever') }),
  z.object({ mode: z.literal('until'), until: z.coerce.date() }),
  z.object({ mode: z.literal('events'), count: z.number().int().positive() }),
  z.object({ mode: z.literal('users'), count: z.number().int().positive() }),
])
export type Archive = z.infer<typeof ArchiveSchema>

/** Studio → whiskers: a human's lifecycle decision, mirrored so ingest can act on it. */
export const IssueLifecycleBodySchema = z.object({
  issueIds: z.array(z.guid()).min(1).max(MAX_LIFECYCLE_ISSUES),
  status: IssueStatusSchema,
  resolve: ResolveSchema.optional(),
  archive: ArchiveSchema.optional(),
})
export type IssueLifecycleBody = z.infer<typeof IssueLifecycleBodySchema>

const PageLimitSchema = z.coerce
  .number()
  .int()
  .min(1)
  .max(MAX_ISSUE_PAGE)
  .default(DEFAULT_ISSUE_PAGE)

export const IssueListQuerySchema = ProjectScopeSchema.extend({
  status: z.enum(ISSUE_LIST_STATUSES).default('unresolved'),
  environment: z.string().max(200).optional(),
  release: z.string().max(200).optional(),
  q: z.string().max(200).optional(),
  sort: z.enum(ISSUE_SORTS).default('last_seen'),
  ids: z.string().max(4_000).optional(),
  cursor: z.string().max(400).optional(),
  limit: PageLimitSchema,
})
export type IssueListQuery = z.infer<typeof IssueListQuerySchema>

export const HistogramPeriodSchema = z.enum(HISTOGRAM_PERIODS)
export type HistogramPeriod = z.infer<typeof HistogramPeriodSchema>

export const IssueDetailQuerySchema = z.object({ period: HistogramPeriodSchema.default('14d') })

export const IssueEventsQuerySchema = z.object({
  cursor: z.string().max(400).optional(),
  limit: PageLimitSchema,
})

export const IssueTransitionSchema = z.enum(ISSUE_TRANSITIONS)
export type IssueTransition = z.infer<typeof IssueTransitionSchema>

/** `[sortValue, id]`: a date sort carries an ISO string, a count sort a number. */
export const CursorSchema = z.tuple([z.union([z.string(), z.number()]), z.guid()])

// Parsed apart from the event so an odd `user` never drops the event itself.
export const SentryUserSchema = z.looseObject({
  id: z.union([z.string(), z.number()]).nullish(),
  email: z.string().nullish(),
  ip_address: z.string().nullish(),
})
