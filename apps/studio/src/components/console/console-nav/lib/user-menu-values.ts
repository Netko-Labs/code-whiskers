import { IconBellCog, IconKey, IconUsers } from '@tabler/icons-react'
import type { UserMenuEntry } from './types'

export const USER_MENU: UserMenuEntry[] = [
  { label: 'Members', icon: IconUsers, section: 'members' },
  { label: 'Alert rules', icon: IconBellCog, section: 'alert-rules' },
  { label: 'API keys', icon: IconKey, section: 'api-keys' },
]

export const THEME_OPTIONS = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
] as const
