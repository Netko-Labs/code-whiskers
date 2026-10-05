import type { AlertRule } from '@/integrations/alerts-api'
import type { Integration } from '@/integrations/studio-api'

export type RuleListModel = {
  rules: AlertRule[]
  destinations: Integration[]
  hasInstallation: boolean
  isLoading: boolean
  isError: boolean
  retry: () => void
  setEnabled: (rule: AlertRule, isEnabled: boolean) => void
}

export type RuleRowProps = {
  rule: AlertRule
  destinations: Integration[]
  onEnabledChange: (isEnabled: boolean) => void
}

export type RuleTemplatesProps = {
  hasDestination: boolean
}
