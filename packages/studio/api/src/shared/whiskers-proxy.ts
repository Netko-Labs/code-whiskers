import { studioEnvConfig } from '@code-whiskers/studio-config'
import { auth, verifyApiKey } from '@code-whiskers/studio-service'

const HOP_BY_HOP = ['host', 'connection', 'content-length', 'transfer-encoding']

/**
 * Studio owns the public hostname; whiskers is a worker on the internal
 * network. Requests are handed over byte-for-byte so whiskers can still verify
 * GitHub's HMAC and Sentry's auth header against the original body.
 */
export async function forwardToWhiskers(request: Request): Promise<Response> {
  const incoming = new URL(request.url)
  const target = new URL(incoming.pathname + incoming.search, studioEnvConfig.whiskers.url)
  const headers = new Headers(request.headers)
  for (const name of HOP_BY_HOP) headers.delete(name)
  headers.set('x-forwarded-host', incoming.host)
  headers.set('x-forwarded-proto', incoming.protocol.replace(':', ''))

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD'
  return fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    redirect: 'manual',
  })
}

async function isAllowed(request: Request): Promise<boolean> {
  const bearer = request.headers.get('authorization')?.match(/^Bearer (cw_\S+)$/)?.[1]
  if (bearer) return (await verifyApiKey(bearer)) !== null
  const signedIn = await auth.api.getSession({ headers: request.headers })
  return !!signedIn?.user
}

/**
 * `/v1` returns review findings (which quote private code) and error events, so it is never
 * forwarded anonymously: a browser session or a `cw_` API key. The worker has no public host;
 * this is its only door.
 */
export async function forwardSignedInToWhiskers(request: Request): Promise<Response> {
  if (!(await isAllowed(request))) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const headers = new Headers(request.headers)
  headers.delete('cookie')
  headers.delete('authorization')
  return forwardToWhiskers(new Request(request, { headers }))
}
