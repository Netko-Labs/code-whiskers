import { z } from 'zod'

export const TRIAGE_ITEM_KINDS = ['issue', 'review', 'log', 'finding'] as const
export const TRIAGE_STATUSES = [
  'open',
  'resolved',
  'archived',
  'snoozed',
  'tracked',
  'approved',
  'dismissed',
] as const
export const TRIAGE_ACTIVITY_KINDS = [
  'resolved',
  'unresolved',
  'archived',
  'regressed',
  'unarchived',
  'assigned',
  'commented',
] as const
export const ISSUE_STATUSES = ['unresolved', 'resolved', 'archived'] as const
export const ISSUE_TRANSITIONS = ['regressed', 'unarchived'] as const
export const MAX_BULK_TRIAGE = 100

export const TriageItemSchema = z.object({
  scope: z.string().min(1).max(200),
  itemKind: z.enum(TRIAGE_ITEM_KINDS),
  itemRef: z.string().min(1).max(500),
})
export type TriageItem = z.infer<typeof TriageItemSchema>

export const TriageDecisionSchema = TriageItemSchema.extend({
  status: z.enum(TRIAGE_STATUSES),
  note: z.string().max(500).optional(),
  snoozedUntil: z.coerce.date().optional(),
})
export type TriageDecisionBody = z.infer<typeof TriageDecisionSchema>

/** One item by `itemRef`, or a selection by `itemRefs`. */
export const TriageAssignSchema = TriageItemSchema.extend({
  itemRef: z.string().min(1).max(500).optional(),
  itemRefs: z.array(z.string().min(1).max(500)).min(1).max(MAX_BULK_TRIAGE).optional(),
  assigneeUserId: z.string().min(1).nullable(),
}).refine((body) => body.itemRef !== undefined || body.itemRefs !== undefined, {
  message: 'itemRef or itemRefs is required',
})
export type TriageAssignBody = z.infer<typeof TriageAssignSchema>

export const TriageCommentSchema = TriageItemSchema.extend({
  body: z.string().trim().min(1).max(4_000),
})
export type TriageCommentBody = z.infer<typeof TriageCommentSchema>

/** Whiskers relays an `@code-whiskers ignore` from a repo insider on one of its own threads. */
export const FindingDismissSchema = z.object({
  repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/),
  file: z.string().min(1).max(400),
  title: z.string().min(1).max(300),
  note: z.string().max(500),
})
export type FindingDismissBody = z.infer<typeof FindingDismissSchema>

export const IssueResolveSchema = z.object({ mode: z.enum(['now', 'next_release']) })
export type IssueResolve = z.infer<typeof IssueResolveSchema>

export const IssueArchiveSchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('forever') }),
  z.object({ mode: z.literal('until'), until: z.coerce.date() }),
  z.object({ mode: z.literal('events'), count: z.number().int().positive() }),
  z.object({ mode: z.literal('users'), count: z.number().int().positive() }),
])
export type IssueArchive = z.infer<typeof IssueArchiveSchema>

const IssueLifecycleChangeSchema = z.object({
  issueIds: z.array(z.guid()).min(1).max(MAX_BULK_TRIAGE),
  status: z.enum(ISSUE_STATUSES),
  resolve: IssueResolveSchema.optional(),
  archive: IssueArchiveSchema.optional(),
})

/** The body whiskers' `/internal/issues/lifecycle` takes: the project studio authorized. */
export const WhiskersLifecycleSchema = IssueLifecycleChangeSchema.extend({
  projectId: z.string().min(1).max(200),
})
export type WhiskersLifecycleBody = z.infer<typeof WhiskersLifecycleSchema>

/** Issues live in whiskers projects, so a lifecycle change is only ever scoped to one. */
export const IssueLifecycleRequestSchema = IssueLifecycleChangeSchema.extend({
  scope: z
    .string()
    .regex(/^project:.+$/)
    .max(200),
})
export type IssueLifecycleRequest = z.infer<typeof IssueLifecycleRequestSchema>

/** One issue's mirrored lifecycle as whiskers returns it. */
export const IssueLifecycleSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  status: z.enum(ISSUE_STATUSES),
  resolvedInRelease: z.string().nullable(),
  resolvedAt: z.coerce.date().nullable(),
  archivedUntil: z.coerce.date().nullable(),
  archiveUntilEvents: z.number().nullable(),
  archiveUntilUsers: z.number().nullable(),
  regressedAt: z.coerce.date().nullable(),
  eventCount: z.number(),
  userCount: z.number(),
  lastRelease: z.string().nullable(),
})
export type IssueLifecycle = z.infer<typeof IssueLifecycleSchema>

export const IssueLifecycleListSchema = z.object({ issues: z.array(IssueLifecycleSchema) })

/** Whiskers → studio: ingest reopened an issue a human had resolved or archived. */
export const IssueTransitionBodySchema = z.object({
  issueId: z.guid(),
  projectId: z.string().min(1).max(200),
  kind: z.enum(ISSUE_TRANSITIONS),
  eventId: z.string().max(200).nullish(),
  release: z.string().max(200).nullish(),
})
export type IssueTransitionBody = z.infer<typeof IssueTransitionBodySchema>
