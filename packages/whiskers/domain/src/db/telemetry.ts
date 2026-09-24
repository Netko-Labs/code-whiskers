import {
  bigserial,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { projectTable } from './tracker'

/**
 * Telemetry is append-only and read by time, so time is a BRIN index — a few pages for a
 * whole table, where a btree would grow with every row. Rows are deleted by age, never updated.
 */
export const logLineTable = pgTable(
  'log_line',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projectTable.id, { onDelete: 'cascade' }),
    service: text('service').notNull(),
    level: text('level').notNull(),
    severity: integer('severity').notNull().default(0),
    message: text('message').notNull(),
    attributes: jsonb('attributes').$type<Record<string, unknown>>().notNull().default({}),
    traceId: text('trace_id'),
    spanId: text('span_id'),
    timestamp: timestamp('timestamp').notNull(),
    receivedAt: timestamp('received_at').defaultNow().notNull(),
  },
  (t) => [
    index('log_line_timestamp_brin').using('brin', t.timestamp),
    index('log_line_service').on(t.service),
  ],
)

export const spanTable = pgTable(
  'span',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projectTable.id, { onDelete: 'cascade' }),
    traceId: text('trace_id').notNull(),
    spanId: text('span_id').notNull(),
    parentSpanId: text('parent_span_id'),
    service: text('service').notNull(),
    name: text('name').notNull(),
    kind: integer('kind').notNull().default(0),
    status: text('status', { enum: ['unset', 'ok', 'error'] })
      .notNull()
      .default('unset'),
    startTime: timestamp('start_time').notNull(),
    durationMs: doublePrecision('duration_ms').notNull(),
    attributes: jsonb('attributes').$type<Record<string, unknown>>().notNull().default({}),
  },
  (t) => [
    index('span_start_time_brin').using('brin', t.startTime),
    index('span_trace').on(t.traceId),
    index('span_service').on(t.service),
  ],
)

export type LogLine = typeof logLineTable.$inferSelect
export type Span = typeof spanTable.$inferSelect
