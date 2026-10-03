/** The browser SDK posts here, on the app's own origin; the route forwards to code-whiskers. */
export const MONITOR_PATH = '/api/monitor'

/**
 * Handed to whiskers byte-for-byte or to the tunnel: an event about them would ride the same path
 * back, so an outage there would report itself in a loop. The ingest paths are always dropped.
 */
export const UNREPORTED_PATHS: readonly RegExp[] = [/^\/api\/monitor$/, /^\/webhooks\//, /^\/v1\//]
export const HYDRATION_WAIT_MS = 1_000
