import type { SearchSchemaInput } from '@tanstack/react-router'
import type {
  WhiskersDeployEntry,
  WhiskersIssue,
  WhiskersProject,
  WhiskersReleaseDetail,
} from '@/integrations/whiskers'
import type { RELEASE_TABS } from './values'

export type ReleaseTab = (typeof RELEASE_TABS)[number]

export type ReleaseSearch = {
  project: string
  tab: ReleaseTab
}

export type ReleaseSearchInput = {
  project?: string
  tab?: string
} & SearchSchemaInput

export type ReleasePageProps = {
  version: string
  projectId: string
  tab: ReleaseTab
}

export type ReleaseDetailState = {
  detail: WhiskersReleaseDetail | undefined
  project: WhiskersProject | undefined
  isMissing: boolean
  isError: boolean
  retry: () => void
}

export type ReleaseSectionProps = {
  detail: WhiskersReleaseDetail
}

export type ReleaseDeploysProps = {
  detail: WhiskersReleaseDetail
  project: WhiskersProject | undefined
}

export type ReleaseIssueListProps = {
  title: string
  description: string
  issues: WhiskersIssue[]
  empty: string
}

export type ReleaseHeaderProps = {
  detail: WhiskersReleaseDetail
  projectName: string | null
  tab: ReleaseTab
  onTab: (tab: ReleaseTab) => void
}

export type DeployGroup = {
  environment: string
  deploys: WhiskersDeployEntry[]
}

export type DeployTimelineProps = {
  group: DeployGroup
}
