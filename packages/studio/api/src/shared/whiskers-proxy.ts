import { studioEnvConfig } from '@code-whiskers/studio-config'

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
