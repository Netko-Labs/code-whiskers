export interface Suppression {
  itemKind: string
  itemRef: string
  status: string
  note: string | null
}

export interface SuppressionPage {
  suppressions: Suppression[]
  isTruncated: boolean
}

export interface AuthorizedScope {
  scope: string
  installationId: number | null
}

export interface TriageRecord {
  scope: string
  itemKind: string
  itemRef: string
  status: string
  assigneeUserId: string | null
  snoozedUntil: Date | null
  resolveMode: string | null
  archiveMode: string | null
  archiveValue: string | null
  note: string | null
  updatedAt: Date
}

export interface TriageCommentRecord {
  id: string
  body: string
  createdAt: Date
  authorUserId: string | null
  authorName: string | null
  authorImage: string | null
}

export interface TriageActivityEntry {
  id: string
  /** An activity kind; a comment reads as `commented` and carries its `body`. */
  kind: string
  actorUserId: string | null
  actorName: string | null
  actorImage: string | null
  data: Record<string, unknown> | null
  body: string | null
  createdAt: Date
}
