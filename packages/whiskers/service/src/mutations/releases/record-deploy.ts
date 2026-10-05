import {
  type DeployBody,
  deployTable,
  type Project,
  releaseTable,
} from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { sql } from 'drizzle-orm'
import { announce } from '../../realtime'
import { syncReleaseCommits } from '../../releases'
import type { DeployOutcome } from './types'

const isOtherRepository = (linked: string | null, named: string | undefined) =>
  !!linked && !!named && linked.toLowerCase() !== named.toLowerCase()

/**
 * A deploy names its release, creating it when no event has yet. A new sha or repository drops
 * the release's commits so they are read again for the new range.
 */
export const recordDeploy = async (project: Project, body: DeployBody): Promise<DeployOutcome> => {
  // Client keys ship in browser bundles: a deploy may not point the GitHub App at another repo.
  if (isOtherRepository(project.repository, body.repository)) {
    return { ok: false, error: `repository must be ${project.repository}, the project's own` }
  }
  const deployedAt = body.deployedAt ?? new Date()
  const commitSha = body.commitSha?.toLowerCase() ?? null
  const repository = body.repository ?? null

  const { release, deploy } = await db.transaction(async (tx) => {
    const [release] = await tx
      .insert(releaseTable)
      .values({
        projectId: project.id,
        version: body.version,
        repository,
        commitSha,
        firstSeen: deployedAt,
        lastSeen: deployedAt,
      })
      .onConflictDoUpdate({
        target: [releaseTable.projectId, releaseTable.version],
        set: {
          repository: sql`coalesce(excluded.repository, ${releaseTable.repository})`,
          commitSha: sql`coalesce(excluded.commit_sha, ${releaseTable.commitSha})`,
          firstSeen: sql`least(${releaseTable.firstSeen}, excluded.first_seen)`,
          commitsSyncedAt: sql`case
            when excluded.commit_sha is not null and excluded.commit_sha is distinct from ${releaseTable.commitSha} then null
            when excluded.repository is not null and excluded.repository is distinct from ${releaseTable.repository} then null
            else ${releaseTable.commitsSyncedAt} end`,
        },
      })
      .returning()
    if (!release) throw new Error('release upsert returned nothing')
    const [deploy] = await tx
      .insert(deployTable)
      .values({
        releaseId: release.id,
        environment: body.environment,
        deployedAt,
        url: body.url ?? null,
        name: body.name ?? null,
      })
      .returning({ id: deployTable.id })
    if (!deploy) throw new Error('deploy insert returned nothing')
    return { release, deploy }
  })

  if (!release.commitsSyncedAt) void syncReleaseCommits(release.id)
  announce('issues')
  return {
    ok: true,
    releaseId: release.id,
    deployId: deploy.id,
    version: release.version,
    environment: body.environment,
  }
}
