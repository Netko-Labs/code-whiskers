import { createFileRoute } from '@tanstack/react-router'
import { SettingsAccount } from '@/components/console'

export const Route = createFileRoute('/console/settings/account')({
  component: SettingsAccount,
})
