export interface ReviewRuleRecord {
  id: string
  installationId: number
  organization: string
  body: string
  scope: string
  effect: string
  isMuted: boolean
  authorName: string | null
  createdAt: Date
}

export interface RepositoryRule {
  body: string
  scope: string
  effect: string
}
