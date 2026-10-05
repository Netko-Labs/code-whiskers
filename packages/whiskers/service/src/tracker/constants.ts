export const NEWLINE = 0x0a
export const MIB = 1024 * 1024
export const MAX_COMPRESSED_BODY_BYTES = 1 * MIB
export const MAX_DECOMPRESSED_BODY_BYTES = 20 * MIB
/** Sentry's "infer the IP server-side" placeholder: every browser sends it, so it names nobody. */
export const AUTO_IP_ADDRESS = '{{auto}}'
/** `last_used_at` is a hint for a human, so ingest writes it at most once a minute per key. */
export const KEY_TOUCH_INTERVAL_MS = 60_000
