import { z } from 'zod'

const topicSchema = z.enum(['reviews', 'issues', 'logs', 'traces'])

export const realtimeMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('ready') }),
  z.object({ type: z.literal('ping') }),
  z.object({ type: z.literal('invalidate'), topics: z.array(topicSchema) }),
])
