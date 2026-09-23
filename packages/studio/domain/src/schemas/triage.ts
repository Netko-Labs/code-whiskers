import { z } from 'zod'

export const TRIAGE_ITEM_KINDS = ['issue', 'review', 'log', 'finding'] as const
export const TRIAGE_STATUSES = [
  'open',
  'resolved',
  'snoozed',
  'tracked',
  'approved',
  'dismissed',
] as const

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

export const TriageAssignSchema = TriageItemSchema.extend({
  assigneeUserId: z.string().min(1).nullable(),
})
export type TriageAssignBody = z.infer<typeof TriageAssignSchema>

export const TriageCommentSchema = TriageItemSchema.extend({
  body: z.string().trim().min(1).max(4_000),
})
export type TriageCommentBody = z.infer<typeof TriageCommentSchema>
