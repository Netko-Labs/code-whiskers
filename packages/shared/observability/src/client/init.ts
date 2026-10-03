import * as Sentry from '@sentry/browser'
import type { BrowserTelemetryConfig } from '../types'
import { DROPPED_INTEGRATIONS } from './constants'

/** Errors only: no tracing integration, and sessions, logs, metrics and client reports stay home. */
export function initBrowserTelemetry({
  dsn,
  release,
  environment,
  tunnel,
}: BrowserTelemetryConfig): void {
  Sentry.init({
    dsn,
    release,
    environment,
    tunnel,
    sendClientReports: false,
    beforeSendLog: () => null,
    beforeSendMetric: () => null,
    integrations: (defaults) => defaults.filter(({ name }) => !DROPPED_INTEGRATIONS.has(name)),
  })
}

export function captureBrowserError(error: unknown): void {
  if (Sentry.getClient()) Sentry.captureException(error)
}
