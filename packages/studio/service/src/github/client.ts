import { account } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, eq } from 'drizzle-orm'
import { Octokit } from 'octokit'
import { auth } from '../auth'

/**
 * A user-to-server Octokit. better-auth encrypts the stored token, so it has to
 * come back through its API rather than off the account row.
 *
 * `getAccessToken` takes an `accountId`, and the account table has both an `id`
 * and a provider-side `accountId` column — the naming does not say which. Try
 * the row id, fall back to the provider id.
 */
export async function octokitForUser(userId: string): Promise<Octokit | null> {
  const row = await db
    .select({ id: account.id, providerAccountId: account.accountId })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, 'github')))
    .limit(1)
    .then(([r]) => r)
  if (!row) return null

  for (const accountId of [row.id, row.providerAccountId]) {
    const token = await auth.api.getAccessToken({ body: { accountId, userId } }).catch(() => null)
    if (token?.accessToken) return new Octokit({ auth: token.accessToken })
  }
  return null
}
