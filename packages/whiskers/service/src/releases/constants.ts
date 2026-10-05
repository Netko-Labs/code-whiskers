/** `last_seen` is written at most this often per release; the first sighting is never delayed. */
export const RELEASE_TOUCH_INTERVAL_MS = 60_000
/** Past this many tracked releases the touch memo starts over rather than growing. */
export const MAX_TOUCHED_RELEASES = 10_000
/** Newest commits kept per release; each one is a GitHub call for its files. */
export const MAX_RELEASE_COMMITS = 50
export const COMMIT_FETCH_CONCURRENCY = 5
export const MAX_COMMIT_FILES = 100
/** Releases searched backwards for the one the commit range starts from. */
export const PREVIOUS_RELEASE_LOOKBACK = 10
/** A failed sync is retried by a later read only after this long. */
export const SYNC_RETRY_MS = 10 * 60_000
/** Trailing path segments a frame and a changed file must share to count as the same file. */
export const SUSPECT_MIN_SEGMENTS = 2
export const MAX_SUSPECT_COMMITS = 5
