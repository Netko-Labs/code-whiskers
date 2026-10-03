import { auth, hasInstanceAccess } from '@code-whiskers/studio-service'
import type { RealtimeCaller } from './types'

/** The socket's caller, held to the same bar as `/v1`: a session on this instance. */
export async function realtimeCallerOf(headers: Headers): Promise<RealtimeCaller | null> {
  const signedIn = await auth.api.getSession({ headers })
  if (!signedIn?.user || !(await hasInstanceAccess(signedIn.user.id))) return null
  return { userId: signedIn.user.id, expiresAt: new Date(signedIn.session.expiresAt) }
}
