import * as Sentry from '@sentry/node'
import type { ServerTelemetryConfig } from '../types'
import { DROPPED_INTEGRATIONS, FLUSH_TIMEOUT_MS } from './constants'
import { isFeedbackLoop, markVendorFrames } from './utils'

/**
 * Errors only. An explicit zero rate overrides SENTRY_TRACES_SAMPLE_RATE, and with no propagation
 * targets no outgoing request (GitHub, OpenRouter, whiskers) is stamped with trace headers.
 */
export function initServerTelemetry(config: ServerTelemetryConfig): void {
  if (!config.dsn) return
  const { dsn, release, environment, serviceName, ignoredPaths = [] } = config
  Sentry.init({
    dsn,
    release,
    environment,
    initialScope: { tags: { service: serviceName } },
    sendClientReports: false,
    beforeSendLog: () => null,
    beforeSendMetric: () => null,
    tracesSampleRate: 0,
    tracePropagationTargets: [],
    defaultIntegrations: Sentry.getDefaultIntegrationsWithoutPerformance().filter(
      ({ name }) => !DROPPED_INTEGRATIONS.has(name),
    ),
    beforeSend: (event) => (isFeedbackLoop(event, ignoredPaths) ? null : markVendorFrames(event)),
  })
}

/** Sends what is queued, bounded so an unreachable sink cannot stall shutdown. */
export async function shutdownTelemetry(timeoutMs = FLUSH_TIMEOUT_MS): Promise<void> {
  if (!Sentry.getClient()) return
  let timer: ReturnType<typeof setTimeout> | undefined
  const deadline = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, timeoutMs)
  })
  await Promise.race([Sentry.flush(timeoutMs).catch(() => false), deadline])
  clearTimeout(timer)
}
