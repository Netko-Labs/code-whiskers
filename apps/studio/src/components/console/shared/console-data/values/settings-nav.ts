import {
  IconBell,
  IconBox,
  IconBrandGithub,
  IconKey,
  IconSettings,
  IconUserCircle,
  IconUsers,
} from '@tabler/icons-react'
import type { SettingsNavGroup } from '../../console-model'

/** The settings rail; entries marked `isElsewhere` leave the settings layout. */
export const SETTINGS_NAV: SettingsNavGroup[] = [
  {
    label: 'Instance',
    entries: [
      { label: 'General', icon: IconSettings, to: '/console/settings/general' },
      { label: 'Members', icon: IconUsers, to: '/console/settings/members' },
      { label: 'API keys', icon: IconKey, to: '/console/settings/api-keys' },
      { label: 'GitHub', icon: IconBrandGithub, to: '/console/settings/github' },
      { label: 'Projects', icon: IconBox, to: '/console/projects', isElsewhere: true },
      { label: 'Notifications', icon: IconBell, to: '/console/integrations', isElsewhere: true },
    ],
  },
  {
    label: 'You',
    entries: [{ label: 'Account', icon: IconUserCircle, to: '/console/settings/account' }],
  },
]
