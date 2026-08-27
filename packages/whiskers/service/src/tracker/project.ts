import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { type Project, projectTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { getProject } from '../queries'

/**
 * DSN auth: the SDK's `sentry_key` must match the project's public key. In dev
 * an unknown project self-provisions with the presented key so SDKs can point
 * at a fresh instance without seeding.
 */
export async function resolveProject(
  projectId: string,
  sentryKey: string | undefined,
): Promise<Project | undefined> {
  const existing = await getProject(projectId)
  if (existing) {
    return sentryKey && existing.publicKey === sentryKey ? existing : undefined
  }
  if (!whiskersEnvConfig.app.dev || !sentryKey) return undefined
  return await db
    .insert(projectTable)
    .values({ id: projectId, name: `project-${projectId}`, publicKey: sentryKey })
    .onConflictDoNothing()
    .returning()
    .then(([r]) => r ?? getProject(projectId))
}
