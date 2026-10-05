import { createFileRoute } from '@tanstack/react-router'
import { SettingsGithub } from '@/components/console'

export const Route = createFileRoute('/console/settings/github')({
  component: SettingsGithub,
})
