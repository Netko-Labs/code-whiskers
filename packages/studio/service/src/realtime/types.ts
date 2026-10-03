import type { RealtimeTopic } from '@code-whiskers/studio-domain'

export type RealtimeListener = (topics: RealtimeTopic[]) => void

export interface RealtimeBus {
  publish(topics: RealtimeTopic[]): void
  subscribe(listener: RealtimeListener): () => void
}
