import type { TrackedPeer } from './types'

// One registry across dev's separate module graphs (the handler vs. Nitro plugins).
const PEERS_KEY = Symbol.for('code-whiskers.realtime-peers')
const registry = globalThis as typeof globalThis & { [PEERS_KEY]?: Map<string, TrackedPeer> }
const peers: Map<string, TrackedPeer> = registry[PEERS_KEY] ?? new Map()
registry[PEERS_KEY] = peers

export function trackPeer(id: string, peer: TrackedPeer): void {
  peers.set(id, peer)
}

export function releasePeer(id: string): void {
  peers.get(id)?.release()
  peers.delete(id)
}

/** Shutdown: tell every browser to reconnect now rather than wait out a dead socket. */
export function closeAllPeers(code: number, reason: string): void {
  for (const peer of peers.values()) peer.close(code, reason)
}
