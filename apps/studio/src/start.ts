import { logger } from '@code-whiskers/logger'
import { reportError } from '@code-whiskers/observability/server'
import { isNotFound, isRedirect } from '@tanstack/react-router'
import { createMiddleware, createStart } from '@tanstack/react-start'

const isControlFlow = (error: unknown) => isRedirect(error) || isNotFound(error)

// Server routes and throws that escape SSR; Elysia's /api/* answers its own errors and reports them
// in its error hook. Forwarded and tunnel paths are dropped in beforeSend.
const errorReportMiddleware = createMiddleware().server(async ({ next, request }) => {
  try {
    return await next()
  } catch (error) {
    if (!isControlFlow(error)) {
      const path = new URL(request.url).pathname
      reportError(error, { path, tags: { method: request.method, transport: 'server-route' } })
    }
    throw error
  }
})

const serverFnErrorMiddleware = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  try {
    return await next()
  } catch (error) {
    if (!isControlFlow(error)) reportError(error, { tags: { transport: 'server-fn' } })
    throw error
  }
})

/**
 * ✧･ﾟ: *✧･ﾟ:* REQUEST LOGGER MIDDLEWARE *:･ﾟ✧*:･ﾟ✧
 *
 * Logs all incoming requests and outgoing responses with kawaii energy!
 * Because even server logs deserve to be cute (◕‿◕✿)
 *
 * Note: API routes (/api) are excluded as they have their own logging middleware
 */
const requestLoggerMiddleware = createMiddleware().server(async ({ next, request }) => {
  const url = new URL(request.url)
  const path = url.pathname

  // Skip logging for API routes - they have their own logging middleware
  if (path.startsWith('/api')) {
    return next()
  }

  const startTime = Date.now()
  const { method } = request

  // Query values can be credentials (OAuth codes, share tokens): log the keys only ✨
  const queryKeys = [...url.searchParams.keys()]
  logger.info({ method, path, queryKeys: queryKeys.length ? queryKeys : undefined }, '→ incoming')

  try {
    const nextResponse = await next()
    const duration = Date.now() - startTime
    const status = nextResponse.response.status

    // Log successful response ヨシ!
    logger.info({ method, path, status, duration }, '← completed')

    return nextResponse
  } catch (error) {
    const duration = Date.now() - startTime

    // Log error with appropriate drama ダメ!
    logger.error(
      {
        method,
        path,
        duration,
        err: error instanceof Error ? error.message : String(error),
      },
      '✗ failed',
    )

    throw error
  }
})

/**
 * TanStack Start instance with global middleware
 * All requests flow through our kawaii logger! ψ(｀∇´)ψ
 */
export const startInstance = createStart(() => ({
  requestMiddleware: [errorReportMiddleware, requestLoggerMiddleware],
  functionMiddleware: [serverFnErrorMiddleware],
}))
