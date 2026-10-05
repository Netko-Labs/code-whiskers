import type { z } from 'zod'
import type {
  ALERT_KINDS,
  ARCHIVE_MODES,
  alertRuleSchema,
  apiKeySchema,
  INTEGRATION_KINDS,
  instanceSchema,
  integrationSchema,
  issueLifecycleResultSchema,
  issueLifecycleSchema,
  memberSchema,
  organizationSchema,
  RESOLVE_MODES,
  REVIEW_RULE_EFFECTS,
  recentTriageActivitySchema,
  repositorySchema,
  reviewRuleSchema,
  SAVED_QUERY_SECTIONS,
  savedQuerySchema,
  studioStorageSchema,
  syncResultSchema,
  TRIAGE_ACTIVITY_KINDS,
  TRIAGE_ITEM_KINDS,
  TRIAGE_STATUSES,
  triageActivitySchema,
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
export type ApiKey = z.infer<typeof apiKeySchema>
export type Integration = z.infer<typeof integrationSchema>
export type IntegrationKind = (typeof INTEGRATION_KINDS)[number]
export type IntegrationInput = {
  installationId: number
  kind: IntegrationKind
  name: string
  url: string
}
export type AlertRule = z.infer<typeof alertRuleSchema>
export type AlertKind = (typeof ALERT_KINDS)[number]
export type AlertRuleInput = {
  installationId: number
  name: string
  kind: AlertKind
  projectId: string | null
  threshold: number
  windowMinutes: number
}
export type SavedQuery = z.infer<typeof savedQuerySchema>
export type SavedQueryInput = {
  name: string
  section: (typeof SAVED_QUERY_SECTIONS)[number]
  tab: number
  query: string | null
  service: string | null
}
export type ResolveMode = (typeof RESOLVE_MODES)[number]
export type ArchiveMode = (typeof ARCHIVE_MODES)[number]
export type ArchiveSpec =
  | { mode: 'forever' }
  | { mode: 'until'; until: string }
  | { mode: 'events'; count: number }
  | { mode: 'users'; count: number }
/** One scope per request: the bulk endpoint authorizes a single project at a time. */
export type IssueLifecycleInput = {
  scope: string
  issueIds: string[]
  status: 'unresolved' | 'resolved' | 'archived'
  resolve?: { mode: ResolveMode }
  archive?: ArchiveSpec
}
export type IssueLifecycle = z.infer<typeof issueLifecycleSchema>
export type IssueLifecycleResult = z.infer<typeof issueLifecycleResultSchema>
export type TriageActivity = z.infer<typeof triageActivitySchema>
export type RecentTriageActivity = z.infer<typeof recentTriageActivitySchema>
export type TriageActivityKind = (typeof TRIAGE_ACTIVITY_KINDS)[number]
export type TriageItemRefs = Omit<TriageItemRef, 'itemRef'> & { itemRefs: string[] }
