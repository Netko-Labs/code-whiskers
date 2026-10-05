import type { z } from 'zod'
import type {
  ALERT_FIRING_STATUSES,
  ALERT_LEVELS,
  ALERT_TRIGGERS,
  alertDeliverySchema,
  alertFiringSchema,
  alertPreviewSchema,
  alertRuleSchema,
} from './schemas'

export type AlertTrigger = (typeof ALERT_TRIGGERS)[number]
export type AlertLevel = (typeof ALERT_LEVELS)[number]
export type AlertFiringStatus = (typeof ALERT_FIRING_STATUSES)[number]
export type AlertRule = z.infer<typeof alertRuleSchema>
export type AlertFiring = z.infer<typeof alertFiringSchema>
export type AlertDelivery = z.infer<typeof alertDeliverySchema>
export type AlertPreview = z.infer<typeof alertPreviewSchema>

/** What the editor sends; studio fills nothing in on an edit. */
export type AlertRuleInput = {
  installationId: number
  name: string
  triggers: AlertTrigger[]
  projectIds: string[]
  environment: string | null
  minLevel: AlertLevel | null
  release: string | null
  threshold: number
  windowMinutes: number
  notifyAll: boolean
  destinationIds: string[]
  actionIntervalMinutes: number
}

export type AlertRulePatch = Partial<Omit<AlertRuleInput, 'installationId'>> & {
  isMuted?: boolean
}
