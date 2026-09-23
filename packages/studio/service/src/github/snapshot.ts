import { createLogger } from '@code-whiskers/logger'
import type { Octokit } from 'octokit'
import type { GithubSnapshot, OrganizationInput, RepositoryInput } from '../mutations'

const logger = createLogger('studio-github-sync')

/**
 * Every installation this user can see and every repository under it, all pages.
 * Installations rather than orgs on purpose: an org CodeWhiskers is not installed
 * on has no repositories to review, so listing it would only ever be an empty shell.
 */
export async function fetchGithubSnapshot(octokit: Octokit): Promise<GithubSnapshot> {
  const installations = await octokit.paginate('GET /user/installations', { per_page: 100 })
  const organizations: OrganizationInput[] = []
  const repositories: RepositoryInput[] = []
  const listedInstallationIds: number[] = []

  for (const installation of installations) {
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
      .paginate('GET /user/installations/{installation_id}/repositories', {
        installation_id: installation.id,
        per_page: 100,
      })
      .catch((error) => {
        logger.warn(
          { installationId: installation.id, err: String(error) },
          'could not list repositories for installation',
        )
        return null
      })
    if (!repos) continue
    listedInstallationIds.push(installation.id)

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

  return { organizations, repositories, listedInstallationIds }
}
