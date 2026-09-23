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
