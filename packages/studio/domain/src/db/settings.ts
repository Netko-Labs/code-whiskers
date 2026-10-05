import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from './auth'

/** One row per operator knob; a missing row means the default. */
export const setting = pgTable('setting', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedBy: text('updated_by').references(() => user.id, { onDelete: 'set null' }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
