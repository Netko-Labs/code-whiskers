import { type FindingDismissBody, repository } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, eq, sql } from 'drizzle-orm'
import { setTriageState } from './set-triage-state'

/**
 * A dismissal made on GitHub rather than in the console. Whiskers has already checked the
 * commenter is a repo insider; studio only needs the repository to exist under an installation.
 */
export const dismissFinding = async (body: FindingDismissBody): Promise<boolean> => {
  const [owner, name] = body.repo.split('/')
  if (!owner || !name) return false
  const [repo] = await db
    .select({
      owner: repository.owner,
      name: repository.name,
      installationId: repository.installationId,
    })
    .from(repository)
    .where(
      and(
        eq(sql`lower(${repository.owner})`, owner.toLowerCase()),
        eq(sql`lower(${repository.name})`, name.toLowerCase()),
      ),
    )
    .limit(1)
  if (!repo) return false

  await setTriageState({
    scope: `${repo.owner}/${repo.name}`,
    itemKind: 'finding',
    itemRef: `${body.file}:${body.title}`,
    status: 'dismissed',
    note: body.note,
    installationId: repo.installationId,
    updatedBy: null,
  })
  return true
}
