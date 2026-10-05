import { user } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { eq } from 'drizzle-orm'

export const setGithubLogin = async (userId: string, login: string): Promise<void> => {
  await db.update(user).set({ githubLogin: login }).where(eq(user.id, userId))
}
