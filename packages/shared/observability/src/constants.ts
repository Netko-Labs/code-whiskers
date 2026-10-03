export const DEFAULT_RELEASE = 'dev'

/** code-whiskers' own ingest surface: an event about it would be posted back into it. */
export const INGEST_PATHS: readonly RegExp[] = [/^\/api\/[^/]+\/(envelope|store)\/?$/, /^\/otlp\//]
