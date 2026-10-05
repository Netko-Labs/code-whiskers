import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import type { AlertDeliveryRecord } from '../schemas/alerts'
import {
  ALERT_FIRING_STATUSES,
  ALERT_LEVELS,
  ALERT_RULE_STATES,
  ALERT_SUBJECT_KINDS,
  ALERT_TRIGGERS,
  DEFAULT_ACTION_INTERVAL,
} from '../values'
import { user } from './auth'
import { organization } from './github'

/**
 * WHEN `triggers`, IF the filters hold, THEN deliver to `destination_ids` (or every destination on
 * the installation). Whiskers evaluates the condition; studio keeps the rule and the secrets.
 */
export const alertRule = pgTable(
  'alert_rule',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    installationId: bigint('installation_id', { mode: 'number' })
      .notNull()
      .references(() => organization.installationId, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    triggers: text('triggers', { enum: ALERT_TRIGGERS }).array().notNull().default([]),
    projectIds: text('project_ids').array().notNull().default([]),
    environment: text('environment'),
    minLevel: text('min_level', { enum: ALERT_LEVELS }),
    release: text('release'),
    threshold: integer('threshold').notNull().default(1),
    windowMinutes: integer('window_minutes').notNull().default(5),
    notifyAll: boolean('notify_all').notNull().default(true),
    destinationIds: uuid('destination_ids').array().notNull().default([]),
    actionIntervalMinutes: integer('action_interval_minutes')
      .notNull()
      .default(DEFAULT_ACTION_INTERVAL),
    /** The project a rule was created for by default; one default per project per installation. */
    defaultFor: text('default_for'),
    state: text('state', { enum: ALERT_RULE_STATES }).notNull().default('armed'),
    lastFiredAt: timestamp('last_fired_at'),
    lastEvaluatedAt: timestamp('last_evaluated_at'),
    createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('alert_rule_installation').on(t.installationId),
    uniqueIndex('alert_rule_default_for').on(t.installationId, t.defaultFor),
  ],
)

/** One delivered (or attempted) alert. Throttled repeats are not recorded. */
export const alertFiring = pgTable(
  'alert_firing',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    ruleId: uuid('rule_id')
      .notNull()
      .references(() => alertRule.id, { onDelete: 'cascade' }),
    installationId: bigint('installation_id', { mode: 'number' })
      .notNull()
      .references(() => organization.installationId, { onDelete: 'cascade' }),
    trigger: text('trigger', { enum: ALERT_TRIGGERS }),
    subjectKind: text('subject_kind', { enum: ALERT_SUBJECT_KINDS }),
    subjectRef: text('subject_ref'),
    projectId: text('project_id'),
    title: text('title').notNull(),
    text: text('text').notNull(),
    url: text('url'),
    status: text('status', { enum: ALERT_FIRING_STATUSES }).notNull(),
    deliveries: jsonb('deliveries').$type<AlertDeliveryRecord[]>().notNull().default([]),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    index('alert_firing_rule_created').on(t.ruleId, t.createdAt),
    index('alert_firing_installation_created').on(t.installationId, t.createdAt),
    index('alert_firing_rule_subject').on(t.ruleId, t.subjectRef, t.createdAt),
  ],
)
