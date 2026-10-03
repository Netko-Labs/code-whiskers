import { postToStudio } from '../review/studio-client'
import type { RealtimeTopic } from './types'

// A burst of ingest becomes one refetch per open console, not one per row.
const COALESCE_MS = 1_000

const pending = new Set<RealtimeTopic>()
let isScheduled = false

function flush(): void {
  isScheduled = false
  const topics = [...pending]
  pending.clear()
  void postToStudio('events', { topics })
}

/** Tells open consoles that `topic` changed. Fire-and-forget: a missed hint costs one stale view. */
export function announce(topic: RealtimeTopic): void {
  pending.add(topic)
  if (isScheduled) return
  isScheduled = true
  setTimeout(flush, COALESCE_MS)
}
