import { z } from 'zod'
import {
  ALERT_ACTION_INTERVALS,
  ALERT_ISSUE_EVENT_TRIGGERS,
  ALERT_LEVELS,
  ALERT_SUBJECT_KINDS,
  ALERT_TRIGGERS,
  DEFAULT_ACTION_INTERVAL,
  MAX_RULE_DESTINATIONS,
  MAX_RULE_PROJECTS,
} from '../values'

export type AlertTrigger = (typeof ALERT_TRIGGERS)[number]
export type AlertLevel = (typeof ALERT_LEVELS)[number]
export type AlertSubjectKind = (typeof ALERT_SUBJECT_KINDS)[number]

const ISSUE_EVENTS: readonly string[] = ALERT_ISSUE_EVENT_TRIGGERS

/** New and regressed may share a rule; a rate or review trigger stands alone. */
export function isValidTriggerSet(triggers: readonly string[]): boolean {
  if (triggers.length === 0 || new Set(triggers).size !== triggers.length) return false
  return triggers.length === 1 || triggers.every((trigger) => ISSUE_EVENTS.includes(trigger))
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => value || null)

const TriggersSchema = z
  .array(z.enum(ALERT_TRIGGERS))
  .min(1)
  .max(ALERT_ISSUE_EVENT_TRIGGERS.length)
  .refine(isValidTriggerSet, 'Only "new issue" and "regressed" can share a rule')

const ActionIntervalSchema = z.coerce
  .number()
  .int()
  .refine((value) => (ALERT_ACTION_INTERVALS as readonly number[]).includes(value), {
    message: `One of ${ALERT_ACTION_INTERVALS.join(', ')} minutes`,
  })

const RuleFields = {
  name: z.string().trim().min(1).max(80),
  triggers: TriggersSchema,
  projectIds: z.array(z.string().trim().min(1).max(40)).max(MAX_RULE_PROJECTS),
  environment: optionalText(64),
  minLevel: z
    .enum(ALERT_LEVELS)
    .nullish()
    .transform((value) => value ?? null),
  release: optionalText(200),
  threshold: z.coerce.number().int().min(1).max(1_000_000),
  windowMinutes: z.coerce.number().int().min(1).max(1_440),
  notifyAll: z.boolean(),
  destinationIds: z.array(z.guid()).max(MAX_RULE_DESTINATIONS),
  actionIntervalMinutes: ActionIntervalSchema,
}

export const AlertRuleCreateSchema = z.object({
  ...RuleFields,
  installationId: z.coerce.number().int().positive(),
  projectIds: RuleFields.projectIds.default([]),
  threshold: RuleFields.threshold.default(1),
  windowMinutes: RuleFields.windowMinutes.default(5),
  notifyAll: RuleFields.notifyAll.default(true),
  destinationIds: RuleFields.destinationIds.default([]),
  actionIntervalMinutes: ActionIntervalSchema.default(DEFAULT_ACTION_INTERVAL),
})
export type AlertRuleCreate = z.infer<typeof AlertRuleCreateSchema>

/** Any subset of the rule, or just `isMuted` for the list toggle. */
export const AlertRuleUpdateSchema = z
  .object(RuleFields)
  .partial()
  .extend({ isMuted: z.boolean().optional() })
export type AlertRuleUpdate = z.infer<typeof AlertRuleUpdateSchema>

export const AlertPreviewSchema = AlertRuleCreateSchema.extend({
  name: z.string().trim().max(80).default(''),
})
export type AlertPreview = z.infer<typeof AlertPreviewSchema>

export const AlertPreviewResultSchema = z.object({
  count: z.number().int().min(0),
  days: z.array(z.number().int().min(0)),
  isCapped: z.boolean(),
})
export type AlertPreviewResult = z.infer<typeof AlertPreviewResultSchema>

export const AlertSubjectSchema = z.object({
  kind: z.enum(ALERT_SUBJECT_KINDS),
  ref: z.string().min(1).max(200),
})
export type AlertSubject = z.infer<typeof AlertSubjectSchema>

/** Whiskers → studio: a condition held. Older workers send only title, text and url. */
export const AlertFireSchema = z.object({
  title: z.string().min(1).max(200),
  text: z.string().min(1).max(2_000),
  url: z.string().url().optional(),
  trigger: z.enum(ALERT_TRIGGERS).optional(),
  subject: AlertSubjectSchema.optional(),
  projectId: z.string().max(200).nullish(),
})
export type AlertFire = z.infer<typeof AlertFireSchema>

export const AlertsEvaluatedSchema = z.object({
  ids: z.array(z.guid()).max(1_000),
  at: z.coerce.date(),
})
export type AlertsEvaluated = z.infer<typeof AlertsEvaluatedSchema>

export const AlertFiringsQuerySchema = z.object({
  ruleId: z.guid().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
})
export type AlertFiringsQuery = z.infer<typeof AlertFiringsQuerySchema>

/** Whiskers → studio: a project was created; studio gives it a default alert rule. */
export const ProjectCreatedBodySchema = z.object({
  projectId: z.string().min(1).max(200),
  name: z.string().min(1).max(200),
  repository: z.string().max(200).nullish(),
})
export type ProjectCreatedBody = z.infer<typeof ProjectCreatedBodySchema>

/** Studio → whiskers: the condition of a draft rule, scoped to the installation's login. */
export type WhiskersAlertPreviewBody = Pick<
  AlertPreview,
  | 'triggers'
  | 'projectIds'
  | 'environment'
  | 'minLevel'
  | 'release'
  | 'threshold'
  | 'windowMinutes'
  | 'actionIntervalMinutes'
> & { owner: string }

export type AlertDeliveryRecord = {
  integrationId: string
  name: string
  kind: string
  isDelivered: boolean
  error: string | null
}
