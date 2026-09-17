import {
  IconBellCog,
  IconBook,
  IconCommand,
  IconKeyboard,
  IconLogout,
  IconUser,
  IconUserPlus,
} from '@tabler/icons-react'
import type { SectionView } from '../../shared/console-model'

export type UserMenuEntry = {
  label: string
  icon: typeof IconUser
  kbd: string
  danger?: boolean
  section?: SectionView
}

export const USER_MENU: UserMenuEntry[] = [
  { label: 'Account settings', icon: IconUser, kbd: 'G A', section: 'members' },
  { label: 'Notification rules', icon: IconBellCog, kbd: '', section: 'alert-rules' },
  { label: 'Command menu', icon: IconCommand, kbd: '⌘K' },
  { label: 'Keyboard shortcuts', icon: IconKeyboard, kbd: '⌘/' },
  { label: 'Invite teammates', icon: IconUserPlus, kbd: '' },
  { label: 'Docs and API keys', icon: IconBook, kbd: '', section: 'api-keys' },
  { label: 'Log out', icon: IconLogout, kbd: '', danger: true },
]

export const THEME_OPTIONS = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
] as const
