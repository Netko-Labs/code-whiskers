import type { SearchSchemaInput } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import type {
  AlertFiring,
  AlertLevel,
  AlertPreview,
  AlertRule,
  AlertTrigger,
} from '@/integrations/alerts-api'
import type { Integration, Organization } from '@/integrations/studio-api'
import type { WhiskersProject } from '@/integrations/whiskers'
import type { RuleTemplateKey } from '../../shared/rule-copy'

/** Text fields stay strings while typed; `inputFromDraft` turns them into the API shape. */
export type RuleDraft = {
  installationId: number | null
  name: string
  triggers: AlertTrigger[]
  projectIds: string[]
  environment: string
  minLevel: AlertLevel | null
  release: string
  threshold: number
  windowMinutes: number
  notifyAll: boolean
  destinationIds: string[]
  actionIntervalMinutes: number
}

export type DraftAction =
  | { kind: 'set'; patch: Partial<RuleDraft> }
  | { kind: 'toggle-trigger'; trigger: AlertTrigger }
  | { kind: 'toggle-project'; projectId: string }
  | { kind: 'toggle-destination'; destinationId: string }

export type RuleEditorPageProps = {
  ruleId?: string
  template?: RuleTemplateKey
}

export type RuleSource =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'error'; retry: () => void }
  | { status: 'ready'; initial: RuleDraft; rule: AlertRule | null }

export type RuleEditorProps = {
  initial: RuleDraft
  rule: AlertRule | null
}

export type RuleEditorModel = {
  draft: RuleDraft
  dispatch: (action: DraftAction) => void
  installations: Organization[]
  projects: WhiskersProject[]
  destinations: Integration[]
  problem: string | null
  isDirty: boolean
  isSaving: boolean
  save: () => void
  remove: () => void
}

export type PreviewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'unavailable' }
  | { status: 'ready'; preview: AlertPreview }

export type CardProps = {
  model: RuleEditorModel
}

export type EditorCardProps = {
  step: string
  title: string
  description?: ReactNode
  icon: ReactNode
  children: ReactNode
}

export type RuleSummaryProps = {
  model: RuleEditorModel
  preview: PreviewState
}

export type PreviewLineProps = {
  preview: PreviewState
}

export type RuleHistoryProps = {
  firings: AlertFiring[] | undefined
}

export type TriggerOptionProps = {
  trigger: AlertTrigger
  isChosen: boolean
  isCombinable: boolean
  onToggle: () => void
}

export type DestinationPickProps = {
  destination: Integration
  isChosen: boolean
  isTesting: boolean
  isPickable: boolean
  onToggle: () => void
  onTest: () => void
}

export type RuleEditorSearch = {
  template?: RuleTemplateKey
}

export type RuleEditorSearchInput = {
  template?: string
} & SearchSchemaInput
