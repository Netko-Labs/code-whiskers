import type { organization, repository } from '@code-whiskers/studio-domain'
import type { db } from '@code-whiskers/studio-repository'

export type OrganizationInput = typeof organization.$inferInsert
export type RepositoryInput = typeof repository.$inferInsert

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

export interface GithubSnapshot {
  organizations: OrganizationInput[]
  repositories: RepositoryInput[]
  /** Installations whose repository listing came back whole — only these can be pruned. */
  listedInstallationIds: number[]
}
