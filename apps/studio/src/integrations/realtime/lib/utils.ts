import type { QueryClient } from '@tanstack/react-query'
import { WHISKERS_QUERY_KEY } from '@/integrations/whiskers'
import { REALTIME_PATH, RECONNECT_BASE_MS, RECONNECT_MAX_MS, TOPIC_QUERY_KEYS } from './constants'
import { realtimeMessageSchema } from './schemas'
import type { RealtimeMessage, RealtimeTopic } from './types'

export function realtimeUrl(): string {
  const url = new URL(REALTIME_PATH, window.location.href)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  return url.toString()
}

/** Exponential with full jitter, so a restarted server isn't hit by every tab at once. */
export function reconnectDelayMs(attempt: number): number {
  return Math.random() * Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * 2 ** attempt)
}

export function parseRealtimeMessage(data: unknown): RealtimeMessage | null {
  if (typeof data !== 'string') return null
  try {
    const parsed = realtimeMessageSchema.safeParse(JSON.parse(data))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export function invalidateTopics(queryClient: QueryClient, topics: RealtimeTopic[]): void {
  const keys = new Set(topics.flatMap((topic) => TOPIC_QUERY_KEYS[topic]))
  for (const key of keys)
    void queryClient.invalidateQueries({ queryKey: [WHISKERS_QUERY_KEY, key] })
}
