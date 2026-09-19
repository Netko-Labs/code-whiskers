import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const reviewTable = pgTable('review', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  owner: text('owner').notNull(),
  repo: text('repo').notNull(),
  prNumber: integer('pr_number').notNull(),
  headSha: text('head_sha').notNull(),
  status: text('status', { enum: ['pending', 'running', 'completed', 'failed'] })
    .notNull()
    .default('pending'),
  verdict: text('verdict', { enum: ['approve', 'request_changes', 'comment'] }),
  summary: text('summary'),
  model: text('model'),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  completedAt: timestamp('completed_at'),
})

export const findingTable = pgTable('finding', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  reviewId: uuid('review_id')
    .notNull()
    .references(() => reviewTable.id, { onDelete: 'cascade' }),
  file: text('file').notNull(),
  line: integer('line'),
  severity: text('severity', { enum: ['low', 'medium', 'high', 'critical'] }).notNull(),
  category: text('category').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  suggestion: text('suggestion'),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
})
