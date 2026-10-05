import {
  IconAlertTriangle,
  IconArrowsExchange,
  IconDatabase,
  IconPoint,
  IconPointer,
  IconRoute,
  IconTerminal2,
  IconUser,
  IconWorld,
} from '@tabler/icons-react'
import type { IssuePeriod } from '@/integrations/whiskers'
import type { CrumbView } from './types'

export const PERIODS: { value: IssuePeriod; label: string }[] = [
  { value: '24h', label: '24h' },
  { value: '14d', label: '14d' },
]

export const CRUMB_KINDS: Record<string, Pick<CrumbView, 'icon' | 'label'>> = {
  http: { icon: IconWorld, label: 'HTTP' },
  navigation: { icon: IconRoute, label: 'Navigation' },
  ui: { icon: IconPointer, label: 'UI' },
  query: { icon: IconDatabase, label: 'Query' },
  error: { icon: IconAlertTriangle, label: 'Error' },
  console: { icon: IconTerminal2, label: 'Console' },
  user: { icon: IconUser, label: 'User' },
  transaction: { icon: IconArrowsExchange, label: 'Transaction' },
}

export const DEFAULT_CRUMB_KIND: Pick<CrumbView, 'icon' | 'label'> = {
  icon: IconPoint,
  label: 'Event',
}

export const SYSTEM_ACTOR = 'CodeWhiskers'
export const FORMER_MEMBER = 'Former member'
export const MISSING_ISSUE = 'That issue is gone — it may have been deleted or moved.'
export const EMPTY_STACK = 'This event carried no stack trace.'
export const EMPTY_CRUMBS = 'No breadcrumbs on this event.'
export const EMPTY_LOGS = 'No log lines share this event’s trace.'
