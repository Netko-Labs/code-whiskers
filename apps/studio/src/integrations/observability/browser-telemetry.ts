import { HYDRATION_WAIT_MS, MONITOR_PATH } from './constants'
import type { BrowserTelemetry } from './types'
import { isReportableQueryError } from './utils'

let telemetry: Promise<BrowserTelemetry | undefined> | undefined

// Unset at build, the import is dead code: the SDK ships zero bytes. A blocked chunk is ignored.
function loadTelemetry(): Promise<BrowserTelemetry | undefined> | undefined {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (import.meta.env.SSR || !dsn) return undefined
  telemetry ??= import('@code-whiskers/observability/client')
    .then((module) => {
      module.initBrowserTelemetry({
        dsn,
        tunnel: MONITOR_PATH,
        release: import.meta.env.VITE_RELEASE,
        environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
      })
      return module
    })
    .catch(() => undefined)
  return telemetry
}

/**
 * Resolves once the SDK's global handlers are in, so hydration errors are caught — or after
 * `HYDRATION_WAIT_MS`, so a slow or blocked chunk never holds the page back for long.
 */
export function startBrowserTelemetry(): Promise<void> {
  const loading = loadTelemetry()
  if (!loading) return Promise.resolve()
  let timer: ReturnType<typeof setTimeout> | undefined
  const deadline = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, HYDRATION_WAIT_MS)
  })
  return Promise.race([loading.then(() => undefined), deadline]).finally(() => clearTimeout(timer))
}

export function reportClientError(error: unknown): void {
  void loadTelemetry()?.then((module) => module?.captureBrowserError(error))
}

export function reportQueryError(error: unknown): void {
  if (isReportableQueryError(error)) reportClientError(error)
}
