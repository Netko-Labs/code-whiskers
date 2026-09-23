import { timingSafeEqual } from 'node:crypto'
import { studioEnvConfig } from '@code-whiskers/studio-config'
import { getSuppressions } from '@code-whiskers/studio-service'
import { Elysia } from 'elysia'

/**
 * The whiskers → studio direction. Studio fronts the public hostname, so this
 * surface is reachable from the internet and needs real auth rather than
 * network trust. A shared token rather than the JWT used the other way: whiskers
 * has no keypair studio could verify against, and minting one for a
 * single-operator tool is ceremony without a threat it answers.
 *
 * An unset token leaves the surface closed rather than open.
 */
function authorized(header: string | undefined): boolean {
  const expected = studioEnvConfig.whiskers.internalToken
  if (!expected) return false
  const provided = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : ''
  if (provided.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
}

export const internalRoutes = new Elysia({ name: 'internal', prefix: '/internal' })
  // ʕ·ᴥ·ʔ what has a human already argued with on this repo?
  .get('/suppressions', async ({ headers, query, set, status }) => {
    if (!authorized(headers.authorization)) return status(401, 'Unauthorized')
    const scope = typeof query.scope === 'string' ? query.scope : ''
    if (!scope) return status(400, 'scope is required')
    const { suppressions, isTruncated } = await getSuppressions(scope)
    // A header, not a wrapper object, so a whiskers still reading a bare array keeps working.
    if (isTruncated) set.headers['x-suppressions-truncated'] = 'true'
    return suppressions
  })
