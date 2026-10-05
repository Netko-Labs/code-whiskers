import type { Tone } from '@/components/shared/status'
import type { AlertLevel, AlertTrigger } from '@/integrations/alerts-api'

export type TriggerGroup = {
  label: string
  /** Issue events combine; a rate or review trigger replaces the selection. */
  isCombinable: boolean
  triggers: AlertTrigger[]
}

export type TriggerCopy = {
  label: string
  description: string
  /** Mono shorthand for the rule list. */
  short: string
  /** What the action interval throttles: once per this. */
  subject: 'issue' | 'project' | 'review'
}

export type RuleTemplateKey = 'new-issues' | 'spike' | 'regressions'

export type RuleTemplate = {
  key: RuleTemplateKey
  title: string
  description: string
  name: string
  triggers: AlertTrigger[]
  threshold: number
  windowMinutes: number
  actionIntervalMinutes: number
  environment: string | null
}

/** The fields the copy reads; a saved rule and an editor draft both have them. */
export type RuleShape = {
  triggers: AlertTrigger[]
  projectIds: string[]
  environment: string | null
  minLevel: AlertLevel | null
  release: string | null
  threshold: number
  windowMinutes: number
  actionIntervalMinutes: number
}

export type StateCopy = {
  label: string
  tone: Tone
}
