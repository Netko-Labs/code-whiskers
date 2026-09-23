import { db } from '@code-whiskers/studio-repository'
import { pruneMemberships, pruneOrphanOrganizations, pruneRepositories } from './prune-github'
import type { GithubSnapshot } from './types'
import { upsertMemberships, upsertOrganizations, upsertRepositories } from './upsert-github'

/** Makes studio match what GitHub says this user can see — additions and removals alike. */
export const saveGithubSnapshot = async (userId: string, snapshot: GithubSnapshot) => {
  const installationIds = snapshot.organizations.map((o) => o.installationId)
  await db.transaction(async (tx) => {
    await upsertOrganizations(tx, snapshot.organizations)
    await upsertMemberships(tx, userId, installationIds)
    await upsertRepositories(tx, snapshot.repositories)

    const dropped = await pruneMemberships(tx, userId, installationIds)
    await pruneOrphanOrganizations(tx, dropped)
    await pruneRepositories(tx, snapshot)
  })
}
