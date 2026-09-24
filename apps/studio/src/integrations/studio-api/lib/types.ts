import type { z } from 'zod'
import type {
  instanceSchema,
  memberSchema,
  organizationSchema,
  REVIEW_RULE_EFFECTS,
  repositorySchema,
  reviewRuleSchema,
  studioStorageSchema,
  syncResultSchema,
  TRIAGE_ITEM_KINDS,
  TRIAGE_STATUSES,
  triageCommentSchema,
  triageRecordSchema,
  viewerSchema,
} from './schemas'

export type Organization = z.infer<typeof organizationSchema>
export type Repository = z.infer<typeof repositorySchema>
export type SyncResult = z.infer<typeof syncResultSchema>
export type Viewer = z.infer<typeof viewerSchema>
export type Instance = z.infer<typeof instanceSchema>
export type TriageRecord = z.infer<typeof triageRecordSchema>
export type Member = z.infer<typeof memberSchema>
export type TriageComment = z.infer<typeof triageCommentSchema>
export type TriageStatusValue = (typeof TRIAGE_STATUSES)[number]
export type TriageItemKind = (typeof TRIAGE_ITEM_KINDS)[number]

export type TriageItemRef = {
  scope: string
  itemKind: TriageItemKind
  itemRef: string
}

export type TriageDecision = TriageItemRef & {
  status: TriageStatusValue
  note?: string
  snoozedUntil?: Date
}
export type StudioStorage = z.infer<typeof studioStorageSchema>
export type ReviewRule = z.infer<typeof reviewRuleSchema>
export type ReviewRuleEffect = (typeof REVIEW_RULE_EFFECTS)[number]
export type ReviewRuleInput = {
  installationId: number
  body: string
  scope: string
  effect: ReviewRuleEffect
}
