import { IconBrandDiscord, IconBrandSlack, IconWebhook } from '@tabler/icons-react'
import type { DestinationIconComponent } from './types'

export const DESTINATION_ICONS: Record<string, DestinationIconComponent> = {
  slack: IconBrandSlack,
  discord: IconBrandDiscord,
  webhook: IconWebhook,
}

export const DESTINATION_LABELS: Record<string, string> = {
  slack: 'Slack',
  discord: 'Discord',
  webhook: 'Webhook',
}
