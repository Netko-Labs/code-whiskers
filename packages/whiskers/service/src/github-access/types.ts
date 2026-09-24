export interface AccessOrganization {
  installationId: number
  login: string
  name: string | null
  avatarUrl: string | null
  accountType: 'Organization' | 'User'
}

export interface AccessRepository {
  id: number
  installationId: number
  owner: string
  name: string
  isPrivate: boolean
  language: string | null
  defaultBranch: string | null
  pushedAt: string | null
}

export interface AccessSnapshot {
  organizations: AccessOrganization[]
  repositories: AccessRepository[]
  listedInstallationIds: number[]
}
