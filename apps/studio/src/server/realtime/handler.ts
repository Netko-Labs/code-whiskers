import { isTrustedOrigin, realtimeCallerOf } from '@code-whiskers/studio-api'
import {
  RealtimeClientMessageSchema,
  type RealtimeServerMessage,
} from '@code-whiskers/studio-domain'
import { realtimeBus } from '@code-whiskers/studio-service'
import { defineWebSocketHandler } from 'nitro'
import {
  CLOSE_SESSION_EXPIRED,
  CLOSE_TOO_BIG,
  CLOSE_UNRESPONSIVE,
  MAX_CLIENT_MESSAGE_CHARS,
  PING_INTERVAL_MS,
  PONG_GRACE_MS,
} from './constants'
import { releasePeer, trackPeer } from './peers'
import type { RealtimeContext } from './types'

const lastPong = new Map<string, number>()

function isPong(text: string): boolean {
  try {
    return RealtimeClientMessageSchema.safeParse(JSON.parse(text)).success
  } catch {
    return false
  }
}

export default defineWebSocketHandler({
  // Browsers attach cookies to cross-site upgrades and sockets skip CORS, so the Origin check is
  // the only thing keeping another site from riding the session.
  async upgrade(request) {
    const origin = request.headers.get('origin')
    if (origin && !isTrustedOrigin(origin)) throw new Response('Forbidden', { status: 403 })
    const caller = await realtimeCallerOf(request.headers)
    if (!caller) throw new Response('Unauthorized', { status: 401 })
    return { context: { caller } satisfies RealtimeContext }
  },

  open(peer) {
    const { caller } = peer.context as RealtimeContext
    const send = (message: RealtimeServerMessage) => peer.send(JSON.stringify(message))
    const unsubscribe = realtimeBus.subscribe((topics) => send({ type: 'invalidate', topics }))
    const expiry = setTimeout(
      () => peer.close(CLOSE_SESSION_EXPIRED, 'session expired'),
      Math.max(0, caller.expiresAt.getTime() - Date.now()),
    )
    lastPong.set(peer.id, Date.now())
    const keepalive = setInterval(() => {
      const silentFor = Date.now() - (lastPong.get(peer.id) ?? 0)
      if (silentFor > PING_INTERVAL_MS + PONG_GRACE_MS) peer.close(CLOSE_UNRESPONSIVE, 'no pong')
      else send({ type: 'ping' })
    }, PING_INTERVAL_MS)
    trackPeer(peer.id, {
      close: (code, reason) => peer.close(code, reason),
      release: () => {
        unsubscribe()
        clearTimeout(expiry)
        clearInterval(keepalive)
        lastPong.delete(peer.id)
      },
    })
    send({ type: 'ready' })
  },

  message(peer, message) {
    const text = message.text()
    if (text.length > MAX_CLIENT_MESSAGE_CHARS) return peer.close(CLOSE_TOO_BIG, 'message too big')
    if (isPong(text)) lastPong.set(peer.id, Date.now())
  },

  close(peer) {
    releasePeer(peer.id)
  },
})
