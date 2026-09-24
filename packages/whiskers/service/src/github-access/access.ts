import { createLogger } from '@code-whiskers/logger'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { App } from 'octokit'
import { mapWithConcurrency } from '../shared/llm'
import type { AccessOrganization, AccessRepository, AccessSnapshot } from './types'

const logger = createLogger('whiskers-github-access')
const CACHE_MS = 10 * 60_000
const PERMISSION_CONCURRENCY = 8
const NO_ACCESS = new Set(['none'])

const { appId, appPrivateKey } = whiskersEnvConfig.github
const app = appId && appPrivateKey ? new App({ appId, privateKey: appPrivateKey }) : null
const cache = new Map<string, { at: number; value: AccessSnapshot }>()

export const hasGithubApp = (): boolean => app !== null

/**
 * What a GitHub user can reach through this App, answered with the App's own credentials — for
 * sign-ins whose token cannot list installations (an OAuth App rather than the GitHub App's own
 * OAuth). A personal installation belongs to its owner; in an organization, each repository is
 * kept only if GitHub says the user has access to it.
 */
export async function githubAccessFor(login: string): Promise<AccessSnapshot | null> {
  if (!app) return null
  const key = login.toLowerCase()
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value

  const organizations: AccessOrganization[] = []
  const repositories: AccessRepository[] = []
  const listedInstallationIds: number[] = []
  const installations = await app.octokit.paginate('GET /app/installations', { per_page: 100 })

  for (const installation of installations) {
    const owner = installation.account
    if (!owner || !('login' in owner)) continue
    const isPersonal = owner.type !== 'Organization'
    if (isPersonal && owner.login.toLowerCase() !== key) continue

    const octokit = await app.getInstallationOctokit(installation.id)
    const repos = await octokit
      .paginate('GET /installation/repositories', { per_page: 100 })
      .catch((error) => {
        logger.warn(
          { installationId: installation.id, err: String(error) },
          'repositories unlisted',
        )
        return null
      })
    if (!repos) continue

    const reachable = isPersonal
      ? repos
      : (
          await mapWithConcurrency(
            repos,
            async (repo) => {
              const permission = await octokit
                .request('GET /repos/{owner}/{repo}/collaborators/{username}/permission', {
                  owner: repo.owner.login,
                  repo: repo.name,
                  username: login,
                })
                .then(({ data }) => data.permission)
                .catch(() => 'none')
              return NO_ACCESS.has(permission) ? null : repo
            },
            PERMISSION_CONCURRENCY,
          )
        ).filter((repo) => repo !== null)
    if (reachable.length === 0) continue

    listedInstallationIds.push(installation.id)
    organizations.push({
      installationId: installation.id,
      login: owner.login,
      name: 'name' in owner ? (owner.name ?? null) : null,
      avatarUrl: owner.avatar_url ?? null,
      accountType: isPersonal ? 'User' : 'Organization',
    })
    for (const repo of reachable) {
      repositories.push({
        id: Number(repo.id),
        installationId: installation.id,
        owner: repo.owner.login,
        name: repo.name,
        isPrivate: repo.private,
        language: repo.language ?? null,
        defaultBranch: repo.default_branch ?? null,
        pushedAt: repo.pushed_at ?? null,
      })
    }
  }

  const value = { organizations, repositories, listedInstallationIds }
  cache.set(key, { at: Date.now(), value })
  return value
}
