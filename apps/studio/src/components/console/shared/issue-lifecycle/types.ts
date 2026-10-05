import type { InfiniteData, QueryKey } from '@tanstack/react-query'
import type { IssueLifecycleInput, Member, ResolveMode } from '@/integrations/studio-api'
import type {
  IssueBadge,
  WhiskersIssue,
  WhiskersIssueDetail,
  WhiskersIssuePage,
} from '@/integrations/whiskers'
import type { PillTone } from '../console-model'

export type ArchiveChoice =
  | { kind: 'forever' }
  | { kind: 'for'; ms: number }
  | { kind: 'events'; count: number }
  | { kind: 'users'; count: number }

export type LifecycleAction =
  | { kind: 'resolve'; mode: ResolveMode }
  | { kind: 'archive'; choice: ArchiveChoice }
  | { kind: 'unresolve' }

export type LifecycleBody = Omit<IssueLifecycleInput, 'scope' | 'issueIds'>

export type ArchiveOption = {
  id: string
  label: string
  choice: ArchiveChoice
}

export type ArchiveGroup = {
  label: string
  options: ArchiveOption[]
}

export type ResolveOption = {
  mode: ResolveMode
  label: string
  shortcut: string
}

export type IssueBanner = {
  message: string
  meta: string
  tone: 'ok' | 'info' | 'warn'
}

export type IssueBadgeView = {
  key: IssueBadge | 'resolved' | 'archived'
  label: string
  tone: PillTone
}

export type IssueCacheSnapshot = [
  QueryKey,
  InfiniteData<WhiskersIssuePage> | WhiskersIssueDetail | undefined,
][]

export type IssueLifecycleApi = {
  apply: (issues: WhiskersIssue[], action: LifecycleAction) => void
  assign: (issues: WhiskersIssue[], member: Member | null) => void
}
