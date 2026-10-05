import { createFileRoute } from '@tanstack/react-router'
import { SettingsGeneral } from '@/components/console'

export const Route = createFileRoute('/console/settings/general')({
  component: SettingsGeneral,
})
