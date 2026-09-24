export const API_KEY_PREFIX = 'cw_'
export const API_KEY_BYTES = 24
/** Writing last_used_at on every request would turn each read into a write. */
export const LAST_USED_RESOLUTION_MS = 60_000
