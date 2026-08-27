import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import type { z } from 'zod'
import { findingTable, reviewTable } from '../db'

export const ReviewInsertSchema = createInsertSchema(reviewTable)
export type ReviewInsert = z.infer<typeof ReviewInsertSchema>

export const ReviewSchema = createSelectSchema(reviewTable)
export type Review = z.infer<typeof ReviewSchema>

export const FindingInsertSchema = createInsertSchema(findingTable)
export type FindingInsert = z.infer<typeof FindingInsertSchema>

export const FindingSchema = createSelectSchema(findingTable)
export type Finding = z.infer<typeof FindingSchema>
