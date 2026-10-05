import { z } from 'zod'

export const ALERT_TRIGGERS = [
  'new_issue',
  'issue_regressed',
  'issue_frequency',
  'error_rate',
  'review_failed',
  'blocking_review',
] as const
export const ALERT_LEVELS = ['debug', 'info', 'warning', 'error', 'fatal'] as const
export const ALERT_ACTION_INTERVALS = [5, 30, 60, 180, 1440] as const
export const ALERT_RULE_STATES = ['armed', 'firing', 'muted'] as const
export const ALERT_FIRING_STATUSES = ['delivered', 'partial', 'failed', 'undelivered'] as const
export const ALERT_SUBJECT_KINDS = ['issue', 'review', 'project'] as const

export const alertRuleSchema = z.object({
  id: z.string(),
  installationId: z.number(),
  organization: z.string(),
  name: z.string(),
  triggers: z.array(z.enum(ALERT_TRIGGERS)),
  projectIds: z.array(z.string()),
  environment: z.string().nullable(),
  minLevel: z.enum(ALERT_LEVELS).nullable(),
  release: z.string().nullable(),
  threshold: z.number(),
  windowMinutes: z.number(),
  notifyAll: z.boolean(),
  destinationIds: z.array(z.string()),
  actionIntervalMinutes: z.number(),
  defaultFor: z.string().nullable(),
  state: z.enum(ALERT_RULE_STATES),
  lastFiredAt: z.coerce.date().nullable(),
  lastEvaluatedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export const alertRuleListSchema = z.array(alertRuleSchema)

export const alertDeliverySchema = z.object({
  integrationId: z.string(),
  name: z.string(),
  kind: z.string(),
  isDelivered: z.boolean(),
  error: z.string().nullable(),
})

export const alertFiringSchema = z.object({
  id: z.string(),
  ruleId: z.string(),
  ruleName: z.string(),
  installationId: z.number(),
  trigger: z.enum(ALERT_TRIGGERS).nullable(),
  subjectKind: z.enum(ALERT_SUBJECT_KINDS).nullable(),
  subjectRef: z.string().nullable(),
  projectId: z.string().nullable(),
  title: z.string(),
  text: z.string(),
  url: z.string().nullable(),
  status: z.enum(ALERT_FIRING_STATUSES),
  deliveries: z.array(alertDeliverySchema),
  createdAt: z.coerce.date(),
})
export const alertFiringListSchema = z.array(alertFiringSchema)

export const alertPreviewSchema = z.object({
  count: z.number(),
  days: z.array(z.number()),
  isCapped: z.boolean(),
})

export const alertCreatedSchema = z.object({ id: z.string() })
export const alertOkSchema = z.object({ ok: z.boolean() })
