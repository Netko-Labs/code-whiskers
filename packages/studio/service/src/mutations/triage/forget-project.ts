import { triageActivity, triageComment, triageState } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { eq } from 'drizzle-orm'
import { PROJECT_SCOPE_PREFIX } from '../../queries/triage'

/** The project's issues are gone in whiskers, so the decisions and talk about them go here too. */
export const forgetProject = async (projectId: string): Promise<void> => {
  const scope = `${PROJECT_SCOPE_PREFIX}${projectId}`
  await db.transaction(async (tx) => {
    await tx.delete(triageState).where(eq(triageState.scope, scope))
    await tx.delete(triageComment).where(eq(triageComment.scope, scope))
    await tx.delete(triageActivity).where(eq(triageActivity.scope, scope))
  })
}
