import { IconBellCog, IconKey, IconLogout, IconUsers } from '@tabler/icons-react'
import type { SectionView } from '../../shared/console-model'

export type UserMenuEntry = {
  label: string
  icon: typeof IconUsers
  danger?: boolean
  section?: SectionView
}

export const USER_MENU: UserMenuEntry[] = [
  { label: 'Members', icon: IconUsers, section: 'members' },
  { label: 'Alert rules', icon: IconBellCog, section: 'alert-rules' },
  { label: 'API keys', icon: IconKey, section: 'api-keys' },
  { label: 'Sign out', icon: IconLogout, danger: true },
]

export const THEME_OPTIONS = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
] as const
