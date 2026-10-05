import type {
  ALERT_FIRING_STATUSES,
  ALERT_RULE_STATES,
  AlertDeliveryRecord,
  AlertLevel,
  AlertSubjectKind,
  AlertTrigger,
} from '@code-whiskers/studio-domain'

export type FiringStatus = (typeof ALERT_FIRING_STATUSES)[number]
export type AlertRuleState = (typeof ALERT_RULE_STATES)[number]

export interface AlertRuleRecord {
  id: string
  installationId: number
  organization: string
  name: string
  triggers: AlertTrigger[]
  projectIds: string[]
  environment: string | null
  minLevel: AlertLevel | null
  release: string | null
  threshold: number
  windowMinutes: number
  notifyAll: boolean
  destinationIds: string[]
  actionIntervalMinutes: number
  defaultFor: string | null
  state: AlertRuleState
  lastFiredAt: Date | null
  lastEvaluatedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/** What whiskers evaluates: the condition and the installation's login, never where it goes. */
export interface EvaluableRule {
  id: string
  name: string
  triggers: AlertTrigger[]
  projectIds: string[]
  environment: string | null
  minLevel: AlertLevel | null
  release: string | null
  threshold: number
  windowMinutes: number
  actionIntervalMinutes: number
  state: AlertRuleState
  lastFiredAt: Date | null
  lastEvaluatedAt: Date | null
  /** Lowercased installation login: with no project filter, only projects linked to its repos. */
  owner: string
}

export interface AlertFiringRecord {
  id: string
  ruleId: string
  ruleName: string
  installationId: number
  trigger: AlertTrigger | null
  subjectKind: AlertSubjectKind | null
  subjectRef: string | null
  projectId: string | null
  title: string
  text: string
  url: string | null
  status: FiringStatus
  deliveries: AlertDeliveryRecord[]
  createdAt: Date
}

export interface FireOutcome {
  delivered: number
  failed: number
  isThrottled: boolean
}

export interface RuleFilters {
  projectIds: string[]
  environment: string | null
  minLevel: AlertLevel | null
  release: string | null
  login: string
}

export interface IssueSignal {
  projectId: string
  repository: string | null | undefined
  environment: string | null | undefined
  release: string | null | undefined
  level: string | null | undefined
}
