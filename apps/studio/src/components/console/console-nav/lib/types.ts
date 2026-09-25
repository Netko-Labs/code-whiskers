import type {
  ConsoleNavItem,
  ConsoleNotification,
  ConsoleOrg,
  ConsoleNavGroup as NavGroup,
} from '../../shared/console-model'

export type ConsoleNavItemProps = {
  item: ConsoleNavItem
  count: string
  isQuiet?: boolean
}

export type ConsoleNavSettingsProps = {
  group: NavGroup
}

export type ConsoleNavGroupProps = {
  group: NavGroup
  counts: Record<string, number>
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
