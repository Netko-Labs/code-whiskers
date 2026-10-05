import { createFileRoute } from '@tanstack/react-router'
import { SettingsApiKeys } from '@/components/console'

export const Route = createFileRoute('/console/settings/api-keys')({
  component: SettingsApiKeys,
})
