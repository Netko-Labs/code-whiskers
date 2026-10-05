export const DEFAULT_RELEASE = 'dev'

/** code-whiskers' own ingest surface, test event included: an event about it would loop back in. */
export const INGEST_PATHS: readonly RegExp[] = [
  /^\/api\/[^/]+\/(envelope|store|deploys)\/?$/,
  /^\/otlp\//,
  /^\/v1\/projects\/[^/]+\/test-event\/?$/,
]
