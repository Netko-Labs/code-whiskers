import type { RealtimeTopic } from '@code-whiskers/studio-domain'
import type { RealtimeBus, RealtimeListener } from './types'

function createLocalBus(): RealtimeBus {
  const listeners = new Set<RealtimeListener>()
  return {
    publish(topics: RealtimeTopic[]) {
      for (const listener of listeners) listener(topics)
    },
    subscribe(listener: RealtimeListener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

// Dev loads the HTTP routes and the WebSocket handler as separate module graphs; the bus must be
// one instance across both. In-process only: studio runs a single replica.
const BUS_KEY = Symbol.for('code-whiskers.realtime-bus')
const registry = globalThis as typeof globalThis & { [BUS_KEY]?: RealtimeBus }

export const realtimeBus: RealtimeBus = registry[BUS_KEY] ?? createLocalBus()
registry[BUS_KEY] = realtimeBus
