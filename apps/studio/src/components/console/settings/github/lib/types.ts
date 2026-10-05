import type { Instance, Organization, Repository } from '@/integrations/studio-api'

export type InstallationSummary = {
  org: Organization
  repositories: number
  watched: number
}

export type GithubConnection = {
  installations: InstallationSummary[]
  repositories: number
  watched: number
  lastSyncedAt: Date | null
  app: Instance['githubApp'] | undefined
  isLoading: boolean
  isError: boolean
  retry: () => void
}

export type GithubSyncNow = {
  sync: () => void
  isPending: boolean
}

export type GithubAppPanelProps = {
  connection: GithubConnection
}

export type InstallationRowProps = {
  installation: InstallationSummary
}

export type SummaryInput = {
  orgs: Organization[]
  repos: Repository[]
}
