import { z } from 'zod'

export const ALERT_KINDS = ['new_issue', 'error_rate', 'review_failed', 'blocking_review'] as const

export const AlertRuleCreateSchema = z.object({
  installationId: z.coerce.number().int().positive(),
  name: z.string().trim().min(1).max(80),
  kind: z.enum(ALERT_KINDS),
  projectId: z.string().trim().max(40).nullable().default(null),
  threshold: z.coerce.number().int().min(1).max(1_000_000).default(1),
  windowMinutes: z.coerce.number().int().min(1).max(1_440).default(5),
})
export type AlertRuleCreate = z.infer<typeof AlertRuleCreateSchema>

export const AlertRuleUpdateSchema = z.object({ isMuted: z.boolean() })

export const AlertFireSchema = z.object({
  title: z.string().min(1).max(200),
  text: z.string().min(1).max(2_000),
  url: z.string().url().optional(),
})
export type AlertFire = z.infer<typeof AlertFireSchema>
