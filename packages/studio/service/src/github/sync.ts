import { createLogger } from '@code-whiskers/logger'
import type { Octokit } from 'octokit'
import { saveGithubSnapshot, setGithubLogin } from '../mutations'
import { octokitForUser } from './client'
import { fetchGithubSnapshot } from './snapshot'
import { fetchSnapshotViaWhiskers, isOauthAppRefusal } from './via-whiskers'

const logger = createLogger('studio-github-sync')

export interface SyncResult {
  organizations: number
  repositories: number
  skipped?: 'no-github-account'
}

/** Members show their GitHub handle; a failure here must never fail the sync. */
async function recordGithubLogin(userId: string, octokit: Octokit): Promise<void> {
  try {
    const { data } = await octokit.request('GET /user')
    await setGithubLogin(userId, data.login)
  } catch (error) {
    logger.warn({ userId, err: String(error) }, 'could not record the github login')
  }
}

export async function syncGithubInstallations(userId: string): Promise<SyncResult> {
  const octokit = await octokitForUser(userId)
  if (!octokit) return { organizations: 0, repositories: 0, skipped: 'no-github-account' }

  const [snapshot] = await Promise.all([
    fetchGithubSnapshot(octokit).catch((error) => {
      if (!isOauthAppRefusal(error)) throw error
      logger.info({ userId }, 'sign-in token cannot list installations — asking the worker')
      return fetchSnapshotViaWhiskers(octokit)
    }),
    recordGithubLogin(userId, octokit),
  ])
  await saveGithubSnapshot(userId, snapshot)

  const organizations = snapshot.organizations.length
  const repositories = snapshot.repositories.length
  logger.info({ userId, organizations, repositories }, 'github sync complete')
  return { organizations, repositories }
}
