import { studioEnvConfig } from '@code-whiskers/studio-config'
import { Elysia } from 'elysia'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
// Cross-site by design: browser Sentry SDKs on other origins, and whiskers calling in with a token.
const OPEN_PATHS = /^\/api\/(\d+\/(envelope|store)|internal\/)/

let allowedOrigins: Set<string> | undefined

// Built on first use, not at import. URL.canParse keeps a malformed TRUSTED_ORIGINS entry from
// crashing anything; it just never matches.
function trustedOrigins(): Set<string> {
  allowedOrigins ??= new Set(
    [
      studioEnvConfig.app.baseUrl,
      ...studioEnvConfig.auth.trustedOrigins,
      // PORTLESS=0 dev serves plain localhost while BASE_URL keeps the portless host.
      ...(studioEnvConfig.app.dev ? [`http://localhost:${studioEnvConfig.app.port}`] : []),
    ]
      .filter((origin) => URL.canParse(origin))
      .map((origin) => new URL(origin).origin),
  )
  return allowedOrigins
}

export const isTrustedOrigin = (origin: string): boolean => trustedOrigins().has(origin)

/**
 * Cookie-authenticated writes only from our own pages. A request with no Origin carries no
 * ambient browser cookie worth forging, so it passes to the route's own auth.
 */
export const originGuard = new Elysia({ name: 'origin-guard' }).request(({ request, status }) => {
  if (SAFE_METHODS.has(request.method)) return
  const origin = request.headers.get('origin')
  if (!origin || isTrustedOrigin(origin)) return
  if (OPEN_PATHS.test(new URL(request.url).pathname)) return
  return status(403, 'Forbidden origin')
})
