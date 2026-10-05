import type { ReactNode } from 'react'
import type { SavedQuery } from '@/integrations/studio-api'
import type { LogSearch } from '../../logs-explorer'
import type { TraceSearch } from '../../traces'

export type SavedDestination =
  | { section: 'live-logs'; search: LogSearch }
  | { section: 'traces'; search: TraceSearch }
  | { section: 'issues'; search: { tab: number; q?: string; service?: string } }

export type SavedQueryActions = {
  rename: (saved: SavedQuery, name: string) => Promise<boolean>
  remove: (saved: SavedQuery) => void
}

export type SavedQueryRowProps = {
  saved: SavedQuery
  onRename: (saved: SavedQuery) => void
  onDelete: (saved: SavedQuery) => void
}

export type SavedQueryLinkProps = {
  saved: SavedQuery
  className?: string
  children: ReactNode
}

export type RenameDialogProps = {
  saved: SavedQuery | null
  onClose: () => void
  onRename: (saved: SavedQuery, name: string) => Promise<boolean>
}
