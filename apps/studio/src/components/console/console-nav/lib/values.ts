import type { ConsoleOrg } from '../../shared/console-model'

export const NAV_ROW =
  'focus-ring group/nav flex h-7 min-w-0 items-center gap-2 rounded-md px-2 text-ui transition-colors duration-fast'
export const NAV_ROW_IDLE =
  'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
export const NAV_ROW_ACTIVE = 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
export const NAV_ICON =
  'size-4 shrink-0 text-muted-foreground transition-colors group-hover/nav:text-foreground group-data-[status=active]/nav:text-foreground'
export const NAV_GROUP_HEADER =
  'focus-ring group/header flex h-7 w-full items-center gap-1.5 rounded-md px-2 text-left font-medium text-2xs text-muted-foreground transition-colors hover:text-foreground'
export const NAV_ICON_BUTTON =
  'focus-ring flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground'
export const RAIL_BUTTON =
  'focus-ring relative flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-foreground'
export const MENU_ROW =
  'focus-ring flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-ui transition-colors hover:bg-surface-hover'

export const NAV_COLLAPSED_KEY = 'codewhiskers.nav.collapsed'
export const NOTIFICATION_WINDOW_MS = 7 * 24 * 60 * 60 * 1000
export const MAX_NOTIFICATIONS = 10
export const MAX_NAV_PROJECTS = 6
export const PROJECTS_GROUP = 'Projects'

export const ALL_ORGANIZATIONS: ConsoleOrg = {
  login: '',
  isOrganization: true,
  name: 'All organizations',
  meta: '',
  mono: '∗',
  tint: '#e4e4e7',
}
