import type { Icon } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import type { WhiskersProject, WhiskersTestEvent } from '@/integrations/whiskers'
import type { PLATFORM_GROUPS, PLATFORM_IDS } from './constants'

export type PlatformId = (typeof PLATFORM_IDS)[number]
export type PlatformGroup = (typeof PLATFORM_GROUPS)[number]

export type CodeSnippet = {
  label: string
  code: string
}

export type Platform = {
  id: PlatformId
  label: string
  group: PlatformGroup
  /** Tabler has no mark for some; those show `badge` as text. */
  icon: Icon | null
  badge: string
  keywords: string
  /** Null where the SDK reads no DSN variable (OTLP takes its own). */
  envName: string | null
  install: CodeSnippet | null
}

export type InstallSnippets = {
  install: CodeSnippet | null
  env: CodeSnippet
  init: CodeSnippet | null
  verify: CodeSnippet | null
  note: string | null
}

export type DsnParts = {
  origin: string
  publicKey: string
  projectId: string
}

export type ReceivedIssue = {
  id: string
  title: string
}

export type ListenerState =
  | { status: 'listening'; hasFailed: boolean }
  | { status: 'received'; issue: ReceivedIssue }

export type ListenerEvent =
  | { type: 'polled'; issue: ReceivedIssue | null }
  | { type: 'failed' }
  | { type: 'test-sent'; issue: ReceivedIssue }

export type FirstEventListener = {
  state: ListenerState
  onTestSent: (result: WhiskersTestEvent) => void
}

export type TestEventSender = {
  send: () => void
  isPending: boolean
}

export type DsnChipProps = {
  dsn: string
  className?: string
}

export type CodeBlockProps = {
  snippet: CodeSnippet
}

export type InstallGuideProps = {
  platform: PlatformId
  dsn: string
}

export type FirstEventBarProps = {
  projectId: string
  variant: 'footer' | 'inline'
  /** Extra controls on the waiting side, e.g. the wizard's skip link. */
  aside?: ReactNode
}

export type PlatformGridProps = {
  value: PlatformId | null
  onChange: (platform: PlatformId) => void
}

export type PlatformMarkProps = {
  platform: Platform
}

export type ProjectInstallPanelProps = {
  project: WhiskersProject
}
