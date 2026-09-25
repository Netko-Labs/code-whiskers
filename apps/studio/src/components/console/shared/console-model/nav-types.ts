import type { Icon } from '@tabler/icons-react'
import type { SectionView } from './section-types'
import type { TriageBucket } from './types'

export type ConsoleNavItem = {
  label: string
  icon: Icon
  to: string
  params?: { bucket: TriageBucket } | { section: SectionView }
}

export type ConsoleNavGroupKind = 'primary' | 'explore' | 'settings'

export type ConsoleNavGroup = {
  kind: ConsoleNavGroupKind
  label: string
  items: ConsoleNavItem[]
}
