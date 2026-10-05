import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import type { Project } from '@code-whiskers/whiskers-domain'
import { insertProject } from '../mutations/tracker/create-project'
import { getProject, getProjectKeys } from '../queries'
import { touchKey } from './key-usage'
import { enabledKeyMatching } from './keys'

/**
 * DSN auth: the SDK's `sentry_key` must be one of the project's enabled keys. In dev an unknown
 * project self-provisions with the presented key so SDKs can point at a fresh instance.
 */
export async function resolveProject(
  projectId: string,
  sentryKey: string | undefined,
): Promise<Project | undefined> {
  const existing = await getProject(projectId)
  if (existing) {
    const key = enabledKeyMatching(await getProjectKeys(projectId), sentryKey)
    if (!key) return undefined
    touchKey(key.id)
    return existing
  }
  if (!whiskersEnvConfig.app.dev || !sentryKey) return undefined
  await insertProject({ id: projectId, name: `project-${projectId}`, publicKey: sentryKey })
  return getProject(projectId)
}
