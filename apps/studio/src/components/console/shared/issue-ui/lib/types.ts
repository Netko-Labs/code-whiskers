import type { ReactElement } from 'react'
import type { ResolveMode } from '@/integrations/studio-api'
import type { WhiskersIssue } from '@/integrations/whiskers'
import type { ArchiveChoice } from '../../issue-lifecycle'

export type IssueBadgesProps = {
  issue: WhiskersIssue
  hasStatus?: boolean
  className?: string
}

export type TrendBarsProps = {
  values: number[]
  className?: string
  /** Hover text per bar, oldest first; omitted bars get none. */
  labels?: string[]
}

export type IssueMenuProps<T> = {
  trigger: ReactElement
  onSelect: (value: T) => void
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
  align?: 'start' | 'end'
}

export type IssueResolveMenuProps = IssueMenuProps<ResolveMode>
export type IssueArchiveMenuProps = IssueMenuProps<ArchiveChoice>

export type LevelRuleProps = {
  level: string
  isMuted?: boolean
  className?: string
}
