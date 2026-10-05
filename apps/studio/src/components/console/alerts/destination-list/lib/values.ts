import type { DestinationKindOption } from './types'

export const DESTINATION_KINDS: DestinationKindOption[] = [
  {
    value: 'slack',
    label: 'Slack',
    placeholder: 'https://hooks.slack.com/services/…',
    hint: 'An incoming webhook URL from a Slack app.',
  },
  {
    value: 'discord',
    label: 'Discord',
    placeholder: 'https://discord.com/api/webhooks/…',
    hint: 'Channel settings → Integrations → Webhooks.',
  },
  {
    value: 'webhook',
    label: 'Webhook',
    placeholder: 'https://example.com/hooks/codewhiskers',
    hint: 'Any HTTPS endpoint; it receives the alert as JSON.',
  },
]
