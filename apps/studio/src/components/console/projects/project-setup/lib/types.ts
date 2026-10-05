import type { SearchSchemaInput } from '@tanstack/react-router'
import type { WhiskersProject } from '@/integrations/whiskers'
import type { PlatformId } from '../../../shared/project-setup'
import type { SETUP_STEPS } from './constants'

export type SetupStepId = (typeof SETUP_STEPS)[number]['id']

export type SetupSearch = {
  step: SetupStepId
  platform: PlatformId
  project?: string
}

export type SetupSearchInput = {
  step?: string
  platform?: string
  project?: string
} & SearchSchemaInput

export type SetupNavigation = {
  project: WhiskersProject | undefined
  isMissing: boolean
  go: (patch: Partial<SetupSearch>) => void
}

export type ProjectDraft = {
  name: string
  repository: string
  options: { value: string; label: string }[]
  error: string | null
  isPending: boolean
  setName: (name: string) => void
  setRepository: (repository: string) => void
  create: () => void
}

export type ProjectSetupPageProps = {
  search: SetupSearch
}

export type SetupRailProps = {
  step: SetupStepId
  hasProject: boolean
  onStep: (step: SetupStepId) => void
}

export type SetupPlatformStepProps = {
  platform: PlatformId
  project: WhiskersProject | undefined
  onPlatform: (platform: PlatformId) => void
  onCreated: (projectId: string) => void
  onContinue: () => void
}

export type SetupInstallStepProps = {
  platform: PlatformId
  dsn: string
  onNext: () => void
}

export type SetupVerifyStepProps = {
  project: WhiskersProject
}

export type SkipLinkProps = {
  projectId: string | undefined
}
