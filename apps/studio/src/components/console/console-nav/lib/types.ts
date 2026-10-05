import type { Icon } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import type {
  ConsoleNavItem,
  ConsoleNotification,
  ConsoleOrg,
  ConsoleNavGroup as NavGroup,
  SectionView,
} from '../../shared/console-model'

export type ConsoleNavItemProps = {
  item: ConsoleNavItem
  count: string
}

export type ConsoleNavGroupProps = {
  group: NavGroup
  counts: Record<string, number>
  isCollapsed: boolean
  onToggle: () => void
  /** A small icon button on the header row, e.g. "new project". */
  action?: ReactNode
}

export type CollapsedGroups = {
  collapsed: ReadonlySet<string>
  toggle: (label: string) => void
}

export type NotificationsResult = {
  notes: ConsoleNotification[]
  unreadIds: Set<string>
}

export type OrgChoices = {
  choices: ConsoleOrg[]
  selected: ConsoleOrg
  shown: ConsoleOrg | undefined
  installUrl: string | null
}

export type UserMenuEntry = {
  label: string
  icon: Icon
  section: SectionView
}

export type ClassNameProps = {
  className?: string
}

export type WorkspaceAvatarProps = {
  org: ConsoleOrg
}

export type NavProjects = {
  items: ConsoleNavItem[]
  total: number
}

export type UserMenuProps = {
  /** The rail: the avatar alone, the menu opening to the side. */
  isCompact?: boolean
}
