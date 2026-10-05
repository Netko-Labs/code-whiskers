import type { Tone } from '@/components/shared/status'
import type { Organization, ReviewRule, ReviewRuleEffect } from '@/integrations/studio-api'

export type RuleTab = 'all' | 'active' | 'muted'

/** `id` set means editing that rule; the installation is fixed once a rule exists. */
export type RuleDraft = {
  id?: string
  body: string
  scope: string
  effect: ReviewRuleEffect
  installationId: string
}

export type EffectMeta = {
  label: string
  hint: string
  tone: Tone
}

export type ReviewRulesState = {
  rules: ReviewRule[]
  organizations: Organization[]
  counts: Record<RuleTab, number>
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

export type RuleActions = {
  save: (draft: RuleDraft) => Promise<void>
  toggleMute: (rule: ReviewRule) => void
  remove: (rule: ReviewRule) => void
}

export type RuleFormState = {
  draft: RuleDraft
  error: string | null
  isSaving: boolean
  update: (patch: Partial<RuleDraft>) => void
  submit: () => Promise<boolean>
}

export type ReviewRulesBodyProps = {
  state: ReviewRulesState
  tab: RuleTab
  onEdit: (draft: RuleDraft) => void
}

export type ReviewRuleRowProps = {
  rule: ReviewRule
  onEdit: () => void
}

export type ReviewRuleDialogProps = {
  draft: RuleDraft | null
  organizations: Organization[]
  onClose: () => void
}

export type RuleFormProps = {
  initial: RuleDraft
  organizations: Organization[]
  onDone: () => void
}

export type RulesEmptyProps = {
  hasOrganizations: boolean
  onWrite: (draft: RuleDraft) => void
  organizations: Organization[]
}
