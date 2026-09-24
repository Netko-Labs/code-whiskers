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

export const TRIAGE_STATUSES = [
  'open',
  'resolved',
  'snoozed',
  'tracked',
  'approved',
  'dismissed',
] as const
export const TRIAGE_ITEM_KINDS = ['issue', 'review', 'log', 'finding'] as const

export const viewerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullish(),
})

export const triageRecordSchema = z.object({
  scope: z.string(),
  itemKind: z.enum(TRIAGE_ITEM_KINDS),
  itemRef: z.string(),
  status: z.enum(TRIAGE_STATUSES),
  assigneeUserId: z.string().nullable(),
  snoozedUntil: z.coerce.date().nullable(),
  note: z.string().nullable(),
  updatedAt: z.coerce.date(),
})
export const triageRecordListSchema = z.array(triageRecordSchema)

export const memberSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  organizations: z.array(z.string()),
  lastSyncedAt: z.coerce.date(),
})
export const memberListSchema = z.array(memberSchema)

export const triageCommentSchema = z.object({
  id: z.string(),
  body: z.string(),
  createdAt: z.coerce.date(),
  authorUserId: z.string().nullable(),
  authorName: z.string().nullable(),
  authorImage: z.string().nullable(),
})
export const triageCommentListSchema = z.array(triageCommentSchema)

export const okSchema = z.object({ ok: z.boolean() })
export const createdSchema = z.object({ id: z.string() })

export const instanceSchema = z.object({
  githubApp: z.object({ slug: z.string(), url: z.string(), installUrl: z.string() }),
})

export const studioStorageSchema = z.object({
  databaseBytes: z.number(),
  stores: z.array(
    z.object({
      table: z.string(),
      bytes: z.number(),
      rows: z.number(),
      oldest: z.coerce.date().nullable(),
    }),
  ),
})

export const REVIEW_RULE_EFFECTS = ['blocker', 'suggestion', 'filter', 'tone'] as const

export const reviewRuleSchema = z.object({
  id: z.string(),
  installationId: z.number(),
  organization: z.string(),
  body: z.string(),
  scope: z.string(),
  effect: z.enum(REVIEW_RULE_EFFECTS),
  isMuted: z.boolean(),
  authorName: z.string().nullable(),
  createdAt: z.coerce.date(),
})
export const reviewRuleListSchema = z.array(reviewRuleSchema)

export const apiKeySchema = z.object({
  id: z.string(),
  name: z.string(),
  prefix: z.string(),
  lastUsedAt: z.coerce.date().nullable(),
  revokedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
})
export const apiKeyListSchema = z.array(apiKeySchema)
export const createdKeySchema = z.object({ id: z.string(), key: z.string() })

export const INTEGRATION_KINDS = ['slack', 'discord', 'webhook'] as const

export const integrationSchema = z.object({
  id: z.string(),
  installationId: z.number(),
  organization: z.string(),
  kind: z.enum(INTEGRATION_KINDS),
  name: z.string(),
  urlHost: z.string(),
  lastDeliveredAt: z.coerce.date().nullable(),
  lastError: z.string().nullable(),
  createdAt: z.coerce.date(),
})
export const integrationListSchema = z.array(integrationSchema)
export const deliverySchema = z.object({ delivered: z.number(), failed: z.number() })

export const ALERT_KINDS = ['new_issue', 'error_rate', 'review_failed', 'blocking_review'] as const

export const alertRuleSchema = z.object({
  id: z.string(),
  installationId: z.number(),
  organization: z.string(),
  name: z.string(),
  kind: z.enum(ALERT_KINDS),
  projectId: z.string().nullable(),
  threshold: z.number(),
  windowMinutes: z.number(),
  state: z.enum(['armed', 'firing', 'muted']),
  lastFiredAt: z.coerce.date().nullable(),
  lastEvaluatedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
})
export const alertRuleListSchema = z.array(alertRuleSchema)
