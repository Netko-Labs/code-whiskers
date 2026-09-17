import type { ConsoleNavItem, ConsoleNavGroup as NavGroup } from '../../shared/console-model'

export type ConsoleNavItemProps = {
  item: ConsoleNavItem
}

export type ConsoleNavGroupProps = {
  group: NavGroup
}

export type ConsoleNavProps = {
  onSearch: () => void
}
