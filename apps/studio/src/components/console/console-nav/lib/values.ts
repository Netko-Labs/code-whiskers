import type { ConsoleOrg } from '../../shared/console-model'

export const NAV_ROW =
  'flex items-center gap-2.5 rounded-[9px] px-2.5 py-[7px] text-[13px] transition-colors'
export const NAV_ROW_IDLE = 'text-zinc-400 hover:bg-zinc-900'
export const NAV_ROW_ACTIVE = 'bg-zinc-800 font-medium text-zinc-50'
export const NAV_GROUP_LABEL =
  'px-2.5 pt-0.5 pb-[5px] font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-400'
export const NAV_ICON_BUTTON =
  'flex size-[26px] shrink-0 items-center justify-center rounded-[7px] text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-50'
export const NAV_SEARCH_HINT = 'Search  ⌘K'
export const NOTIFICATION_WINDOW_MS = 7 * 24 * 60 * 60 * 1000
export const MAX_NOTIFICATIONS = 10

export const ALL_ORGANIZATIONS: ConsoleOrg = {
  login: '',
  isOrganization: true,
  name: 'All organizations',
  meta: '',
  mono: '∗',
  tint: '#e4e4e7',
}
