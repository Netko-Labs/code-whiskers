import { createLogger } from '@code-whiskers/logger'
import { saveGithubSnapshot } from '../mutations'
import { octokitForUser } from './client'
import { fetchGithubSnapshot } from './snapshot'
import { fetchSnapshotViaWhiskers, isOauthAppRefusal } from './via-whiskers'

const logger = createLogger('studio-github-sync')

export interface SyncResult {
  organizations: number
  repositories: number
  skipped?: 'no-github-account'
}

export async function syncGithubInstallations(userId: string): Promise<SyncResult> {
  const octokit = await octokitForUser(userId)
  if (!octokit) return { organizations: 0, repositories: 0, skipped: 'no-github-account' }

  const snapshot = await fetchGithubSnapshot(octokit).catch((error) => {
    if (!isOauthAppRefusal(error)) throw error
    logger.info({ userId }, 'sign-in token cannot list installations — asking the worker')
    return fetchSnapshotViaWhiskers(octokit)
  })
  await saveGithubSnapshot(userId, snapshot)

  const organizations = snapshot.organizations.length
  const repositories = snapshot.repositories.length
  logger.info({ userId, organizations, repositories }, 'github sync complete')
  return { organizations, repositories }
}
