export interface AlertRuleRecord {
  id: string
  installationId: number
  organization: string
  name: string
  kind: string
  projectId: string | null
  threshold: number
  windowMinutes: number
  state: string
  lastFiredAt: Date | null
  lastEvaluatedAt: Date | null
  createdAt: Date
}

export interface EvaluableRule {
  id: string
  name: string
  kind: string
  projectId: string | null
  threshold: number
  windowMinutes: number
  state: string
  lastFiredAt: Date | null
}
