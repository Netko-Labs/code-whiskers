import type { RealtimeCaller } from '@code-whiskers/studio-api'

export type RealtimeContext = { caller: RealtimeCaller }

export type TrackedPeer = {
  close(code?: number, reason?: string): void
  release(): void
}
