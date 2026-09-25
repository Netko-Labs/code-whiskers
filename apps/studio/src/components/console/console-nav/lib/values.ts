import type { ConsoleOrg } from '../../shared/console-model'

export const NAV_ROW =
  'flex items-center gap-2.5 rounded-lg px-2.5 py-[6px] text-[13px] transition-colors'
export const NAV_ROW_IDLE = 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
export const NAV_ROW_ACTIVE = 'bg-zinc-900 font-medium text-zinc-50'
export const NAV_GROUP_LABEL =
  'px-2.5 pb-1 font-semibold text-[11px] uppercase tracking-[0.12em] text-zinc-600'
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
