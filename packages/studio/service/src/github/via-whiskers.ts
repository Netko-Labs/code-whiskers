import { studioEnvConfig } from '@code-whiskers/studio-config'
import type { Octokit } from 'octokit'
import type { GithubSnapshot } from '../mutations'

type WireSnapshot = Omit<GithubSnapshot, 'repositories'> & {
  repositories: (Omit<GithubSnapshot['repositories'][number], 'pushedAt'> & {
    pushedAt: string | null
  })[]
}

/** GitHub refuses /user/installations to OAuth App tokens with exactly this. */
export function isOauthAppRefusal(error: unknown): boolean {
  const { status, message } = error as { status?: number; message?: string }
  return status === 403 && /authorized to a GitHub App/i.test(message ?? '')
}

/**
 * The sign-in token belongs to an OAuth App, which cannot list App installations. The worker holds
 * the App's own credentials, so it answers for the user by GitHub login instead.
 */
export async function fetchSnapshotViaWhiskers(octokit: Octokit): Promise<GithubSnapshot> {
  const { data: me } = await octokit.request('GET /user')
  const token = studioEnvConfig.whiskers.internalToken
  if (!token) throw new Error('INTERNAL_TOKEN is not set — the worker cannot answer for GitHub')

  const url = new URL('/internal/github/access', studioEnvConfig.whiskers.url)
  url.searchParams.set('login', me.login)
  const response = await fetch(url, {
    headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
    signal: AbortSignal.timeout(60_000),
  })
  if (!response.ok) throw new Error(`worker answered ${response.status} for GitHub access`)
  const wire = (await response.json()) as WireSnapshot
  return {
    ...wire,
    repositories: wire.repositories.map((repo) => ({
      ...repo,
      pushedAt: repo.pushedAt ? new Date(repo.pushedAt) : null,
    })),
  }
}
