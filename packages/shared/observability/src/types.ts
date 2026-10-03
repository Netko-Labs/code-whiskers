export type EnvRecord = Record<string, string | undefined>

/**
 * Off unless `dsn` is set. An event whose `path` tag matches an ingest path or `ignoredPaths` is
 * dropped.
 */
export interface ServerTelemetryConfig {
  serviceName: string
  release: string
  environment: string
  dsn?: string
  ignoredPaths?: readonly RegExp[]
}

export interface BrowserTelemetryConfig {
  dsn: string
  release: string
  environment: string
  tunnel?: string
}

export interface ErrorScope {
  path?: string
  tags?: Record<string, string>
  userId?: string
}

export interface TunnelOptions {
  allowedDsns: readonly string[]
  maxBytes?: number
}
