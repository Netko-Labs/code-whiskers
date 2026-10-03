import { z } from 'zod'

export const REALTIME_TOPICS = ['reviews', 'issues', 'logs', 'traces'] as const

export const RealtimeTopicSchema = z.enum(REALTIME_TOPICS)
export type RealtimeTopic = z.infer<typeof RealtimeTopicSchema>

/** Whiskers → studio: what changed. A hint to refetch, never the data itself. */
export const RealtimeEventsSchema = z.object({
  topics: z.array(RealtimeTopicSchema).min(1).max(REALTIME_TOPICS.length),
})
export type RealtimeEventsBody = z.infer<typeof RealtimeEventsSchema>

export type RealtimeServerMessage =
  | { type: 'ready' }
  | { type: 'invalidate'; topics: RealtimeTopic[] }
  | { type: 'ping' }

export const RealtimeClientMessageSchema = z.object({ type: z.literal('pong') })
