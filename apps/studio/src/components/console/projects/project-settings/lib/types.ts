import type { ReactNode } from 'react'
import type { WhiskersProject, WhiskersProjectKey } from '@/integrations/whiskers'

export type ProjectSettingsPageProps = {
  projectId: string
}

export type ProjectSectionProps = {
  project: WhiskersProject
}

export type ProjectKeyRowProps = {
  projectId: string
  projectKey: WhiskersProjectKey
  isLastEnabled: boolean
  actions: KeyActions
}

export type ProjectGeneralForm = {
  name: string
  repository: string
  options: { value: string; label: string }[]
  isDirty: boolean
  isPending: boolean
  setName: (name: string) => void
  setRepository: (repository: string) => void
  save: () => void
}

export type KeyActions = {
  label: string
  isPending: boolean
  setLabel: (label: string) => void
  add: () => void
  setEnabled: (key: WhiskersProjectKey, isEnabled: boolean) => void
  remove: (key: WhiskersProjectKey) => void
}

export type ProjectDeletion = {
  confirmation: string
  canDelete: boolean
  isPending: boolean
  setConfirmation: (value: string) => void
  remove: () => void
}

export type KeyChange =
  | { kind: 'add'; label: string }
  | { kind: 'enable'; key: WhiskersProjectKey; isEnabled: boolean }
  | { kind: 'delete'; key: WhiskersProjectKey }

export type SettingsSectionProps = {
  title: string
  description: string
  tone?: 'danger'
  children: ReactNode
}
