import { z } from 'zod'
import { ALERT_LEVELS, ALERT_TRIGGERS } from '../values/alert'

/** Studio → whiskers: a draft rule's condition, scoped to an installation's login. */
export const AlertPreviewBodySchema = z.object({
  triggers: z.array(z.enum(ALERT_TRIGGERS)).min(1).max(2),
  projectIds: z.array(z.string().min(1).max(200)).max(50),
  environment: z.string().max(200).nullable(),
  minLevel: z.enum(ALERT_LEVELS).nullable(),
  release: z.string().max(200).nullable(),
  threshold: z.number().int().min(1),
  windowMinutes: z.number().int().min(1).max(1_440),
  actionIntervalMinutes: z.number().int().min(1).max(1_440),
  owner: z.string().min(1).max(200),
})
export type AlertPreviewBody = z.infer<typeof AlertPreviewBodySchema>
