import type {
  ConsoleNavItem,
  ConsoleNotification,
  ConsoleOrg,
  ConsoleNavGroup as NavGroup,
} from '../../shared/console-model'

export type ConsoleNavItemProps = {
  item: ConsoleNavItem
}

export type ConsoleNavGroupProps = {
  group: NavGroup
}

export type ConsoleNavProps = {
  onSearch: () => void
}

export type NotificationsResult = {
  notes: ConsoleNotification[]
  unreadIds: Set<string>
}

export type OrgChoices = {
  choices: ConsoleOrg[]
  selected: ConsoleOrg
  shown: ConsoleOrg | undefined
  sample: boolean
  installUrl: string | null
}
