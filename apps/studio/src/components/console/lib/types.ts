import type { ConsoleComment } from '../shared/console-model'

export type ConsoleToast = {
  message: string
  undoable: boolean
}

export type ConsoleStore = {
  navOpen: boolean
  navPinned: boolean
  orgIndex: number
  readAll: boolean
  fixOpen: boolean
  resolved: Record<string, boolean>
  approved: Record<string, boolean>
  tracked: Record<string, boolean>
  dismissed: Record<string, boolean>
  assignee: Record<string, string>
  comments: ConsoleComment[]
  draft: string
  toast: ConsoleToast | null
  openNav: () => void
  closeNav: () => void
  collapseNavOnNarrow: () => void
  pickOrg: (index: number) => void
  markAllRead: () => void
  setFixOpen: (open: boolean) => void
  toggleResolved: (id: string) => boolean
  toggleApproved: (id: string) => boolean
  setTracked: (id: string) => void
  setDismissed: (id: string) => void
  assign: (id: string, name: string) => void
  setDraft: (draft: string) => void
  postComment: (initials: string, who: string) => boolean
  flash: (message: string, undoable?: boolean) => void
  clearToast: () => void
  reset: () => void
}
