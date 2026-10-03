import { closeDb } from '@code-whiskers/studio-repository'
import { definePlugin } from 'nitro'
import { CLOSE_GOING_AWAY, closeAllPeers } from '../realtime'

/**
 * Registered before srvx's own SIGTERM handler, so sockets close with 1001 (browsers reconnect to
 * the next container) while HTTP drains. Nitro fires `close` once srvx is done; only then may the
 * pool go.
 */
export default definePlugin((nitroApp) => {
  const drain = () => closeAllPeers(CLOSE_GOING_AWAY, 'server shutting down')
  process.once('SIGTERM', drain)
  process.once('SIGINT', drain)
  nitroApp.hooks.hook('close', closeDb)
})
