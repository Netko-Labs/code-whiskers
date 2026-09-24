import {
  type ReviewRuleCreate,
  type ReviewRuleUpdate,
  reviewRule,
} from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { eq } from 'drizzle-orm'
import { isInstallationMember } from '../../queries/github'

export const createReviewRule = async (
  userId: string,
  input: ReviewRuleCreate,
): Promise<{ id: string } | null> => {
  if (!(await isInstallationMember(userId, input.installationId))) return null
  const [row] = await db
    .insert(reviewRule)
    .values({ ...input, authorUserId: userId })
    .returning({ id: reviewRule.id })
  return row ?? null
}

async function ruleInstallation(id: string): Promise<number | null> {
  const [row] = await db
    .select({ installationId: reviewRule.installationId })
    .from(reviewRule)
    .where(eq(reviewRule.id, id))
    .limit(1)
  return row?.installationId ?? null
}

/** Anyone on the installation may edit its rules — they are the team's, not the author's. */
async function canEdit(userId: string, id: string): Promise<boolean> {
  const installationId = await ruleInstallation(id)
  return installationId !== null && (await isInstallationMember(userId, installationId))
}

export const updateReviewRule = async (
  userId: string,
  id: string,
  patch: ReviewRuleUpdate,
): Promise<boolean> => {
  if (!(await canEdit(userId, id))) return false
  await db.update(reviewRule).set(patch).where(eq(reviewRule.id, id))
  return true
}

export const deleteReviewRule = async (userId: string, id: string): Promise<boolean> => {
  if (!(await canEdit(userId, id))) return false
  await db.delete(reviewRule).where(eq(reviewRule.id, id))
  return true
}
