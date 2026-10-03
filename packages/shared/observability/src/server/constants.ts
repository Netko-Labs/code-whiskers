/** Shutdown budget: studio drains first, and SERVER_SHUTDOWN_TIMEOUT is 10 s in total. */
export const FLUSH_TIMEOUT_MS = 2_000

/** handleTunnelRequest buffers the whole body, so the cap is ours to enforce. */
export const TUNNEL_MAX_BYTES = 1024 * 1024

/** code-whiskers keeps only `event` items; session envelopes are discarded on arrival. */
export const DROPPED_INTEGRATIONS: ReadonlySet<string> = new Set(['ProcessSession'])

/** Bundled dependencies (Nitro's `_libs/`) would otherwise count as app frames in code-whiskers. */
export const VENDOR_FRAME_MARKERS = ['/_libs/', '/node_modules/']
