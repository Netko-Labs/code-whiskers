import type { ALERT_LEVELS, ALERT_TRIGGERS } from '@code-whiskers/whiskers-domain'

export type AlertTrigger = (typeof ALERT_TRIGGERS)[number]
export type AlertLevel = (typeof ALERT_LEVELS)[number]

/** The part of a rule that decides whether it holds; a studio draft has the same shape. */
export interface AlertCondition {
  triggers: AlertTrigger[]
  projectIds: string[]
  environment: string | null
  minLevel: AlertLevel | null
  release: string | null
  threshold: number
  windowMinutes: number
  actionIntervalMinutes: number
  /** Lowercased installation login: with no project filter, only projects linked to its repos. */
  owner: string
}

/** As studio's `/api/internal/alert-rules` serves it (dates arrive as strings). */
export interface AlertRule extends AlertCondition {
  id: string
  name: string
  state: 'armed' | 'firing' | 'muted'
  lastFiredAt: string | null
  lastEvaluatedAt: string | null
}

export interface AlertFiring {
  title: string
  text: string
  path: string
  trigger: AlertTrigger
  subject: { kind: 'issue' | 'review' | 'project'; ref: string }
  projectId: string | null
}

export interface AlertEvaluation {
  firings: AlertFiring[]
  /** A rate condition holds right now: the rule shows as firing until it stops. */
  isActive: boolean
  /** Where event triggers resume next pass; earlier than now when a pass hit its cap. */
  cursor: Date
}

export interface AlertPreviewResult {
  count: number
  days: number[]
  isCapped: boolean
}

export interface RateBucket {
  key: string
  at: Date
}
