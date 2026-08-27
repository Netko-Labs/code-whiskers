import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import type { z } from 'zod'
import { eventTable, issueTable, projectTable } from '../db'

export const ProjectInsertSchema = createInsertSchema(projectTable)
export type ProjectInsert = z.infer<typeof ProjectInsertSchema>

export const ProjectSchema = createSelectSchema(projectTable)
export type Project = z.infer<typeof ProjectSchema>

export const IssueSchema = createSelectSchema(issueTable)
export type Issue = z.infer<typeof IssueSchema>

export const EventInsertSchema = createInsertSchema(eventTable)
export type EventInsert = z.infer<typeof EventInsertSchema>

export const EventSchema = createSelectSchema(eventTable)
export type Event = z.infer<typeof EventSchema>
