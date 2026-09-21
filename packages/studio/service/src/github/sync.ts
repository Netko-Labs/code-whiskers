import { createLogger } from '@code-whiskers/logger'
import type { OrganizationInput, RepositoryInput } from '../mutations'
import { upsertMemberships, upsertOrganizations, upsertRepositories } from '../mutations'
import { octokitForUser } from './client'

const logger = createLogger('studio-github-sync')

export interface SyncResult {
  organizations: number
  repositories: number
  skipped?: 'no-github-account'
}

/**
 * Mirrors the installations this user can see into studio. Installations rather
 * than orgs on purpose: an org CodeWhiskers is not installed on has no
 * repositories to review, so listing it would only ever be an empty shell.
 */
export async function syncGithubInstallations(userId: string): Promise<SyncResult> {
  const octokit = await octokitForUser(userId)
  if (!octokit) return { organizations: 0, repositories: 0, skipped: 'no-github-account' }

  const { data } = await octokit.request('GET /user/installations', { per_page: 100 })
  const organizations: OrganizationInput[] = []
  const repositories: RepositoryInput[] = []

  for (const installation of data.installations) {
    const owner = installation.account
    if (!owner || !('login' in owner)) continue

    organizations.push({
      installationId: installation.id,
      login: owner.login,
      name: 'name' in owner ? (owner.name ?? null) : null,
      avatarUrl: owner.avatar_url,
      accountType: owner.type === 'Organization' ? 'Organization' : 'User',
    })

    const repos = await octokit
      .request('GET /user/installations/{installation_id}/repositories', {
        installation_id: installation.id,
        per_page: 100,
      })
      .then((r) => r.data.repositories)
      .catch((error) => {
        logger.warn(
          { installationId: installation.id, err: String(error) },
          'could not list repositories for installation',
        )
        return []
      })

    for (const repo of repos) {
      repositories.push({
        // Octokit types repo ids as number | bigint; the column is bigint-as-number.
        id: Number(repo.id),
        installationId: installation.id,
        owner: repo.owner.login,
        name: repo.name,
        isPrivate: repo.private,
        language: repo.language ?? null,
        defaultBranch: repo.default_branch ?? null,
        pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
      })
    }
  }

  await upsertOrganizations(organizations)
  await upsertMemberships(
    userId,
    organizations.map((o) => o.installationId),
  )
  await upsertRepositories(repositories)

  logger.info(
    { userId, organizations: organizations.length, repositories: repositories.length },
    'github sync complete',
  )
  return { organizations: organizations.length, repositories: repositories.length }
}
