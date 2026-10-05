import type { Icon } from '@tabler/icons-react'
import type { SectionView } from './section-types'
import type { TriageBucket } from './types'

export type ConsoleNavItem = {
  label: string
  icon: Icon
  to: string
  params?: { bucket: TriageBucket } | { section: SectionView } | { projectId: string }
}

export type ConsoleNavGroup = {
  label: string
  icon: Icon
  items: ConsoleNavItem[]
}

export type SettingsNavEntry = {
  label: string
  icon: Icon
  to: string
  /** Lives outside the settings layout; the rail row shows an arrow. */
  isElsewhere?: boolean
}

export type SettingsNavGroup = {
  label: string
  entries: SettingsNavEntry[]
}
