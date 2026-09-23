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
