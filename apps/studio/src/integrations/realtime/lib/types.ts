import type { z } from 'zod'
import type { realtimeMessageSchema } from './schemas'

export type RealtimeMessage = z.infer<typeof realtimeMessageSchema>
export type RealtimeTopic = Extract<RealtimeMessage, { type: 'invalidate' }>['topics'][number]
