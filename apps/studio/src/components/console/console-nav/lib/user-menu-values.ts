import { IconKey, IconSettings, IconUserCircle } from '@tabler/icons-react'
import type { UserMenuEntry } from './types'

export const USER_MENU: UserMenuEntry[] = [
  { label: 'Account', icon: IconUserCircle, to: '/console/settings/account' },
  { label: 'API keys', icon: IconKey, to: '/console/settings/api-keys' },
  { label: 'Settings', icon: IconSettings, to: '/console/settings/general' },
]

export const THEME_OPTIONS = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
] as const
