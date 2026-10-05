import type { AlertFiring } from '@/integrations/alerts-api'

export type FiringTarget =
  | { kind: 'issue'; issueId: string }
  | { kind: 'internal'; href: string }
  | { kind: 'external'; href: string }
  | { kind: 'none' }

export type FiringListProps = {
  firings: AlertFiring[]
  /** The global activity names the rule; a rule's own history does not. */
  isRuleShown?: boolean
}

export type FiringRowProps = {
  firing: AlertFiring
  isRuleShown: boolean
}
