export const REALTIME_ROUTE = '/realtime'
// Under Traefik's idle timeout, so a quiet socket is never cut by the proxy.
export const PING_INTERVAL_MS = 30_000
export const PONG_GRACE_MS = 5_000
export const CLOSE_SESSION_EXPIRED = 4001
export const CLOSE_GOING_AWAY = 1001
export const CLOSE_UNRESPONSIVE = 4002
export const CLOSE_TOO_BIG = 1009
// The only thing a client ever sends is a pong.
export const MAX_CLIENT_MESSAGE_CHARS = 256
