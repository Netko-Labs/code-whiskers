export interface AlertRule {
  id: string
  name: string
  kind: 'new_issue' | 'error_rate' | 'review_failed' | 'blocking_review'
  projectId: string | null
  threshold: number
  windowMinutes: number
  state: 'armed' | 'firing' | 'muted'
  lastFiredAt: string | null
}

export interface AlertVerdict {
  isFiring: boolean
  title: string
  text: string
  path: string
}
