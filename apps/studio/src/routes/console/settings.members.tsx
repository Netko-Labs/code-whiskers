import { createFileRoute } from '@tanstack/react-router'
import { SettingsMembers } from '@/components/console'

export const Route = createFileRoute('/console/settings/members')({
  component: SettingsMembers,
})
