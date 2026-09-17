import type { ConsoleComment } from '../shared/console-model'

export type ConsoleToast = {
  message: string
  /** Present only when the action can genuinely be reversed; the button is hidden otherwise. */
  onUndo?: () => void
}

export type ConsoleStore = {
  navOpen: boolean
  navPinned: boolean
  orgIndex: number
  readIds: Record<string, boolean>
  /** The item the fix drawer was opened for; the drawer closes if the selection moves elsewhere. */
  fixItemId: string | null
  resolved: Record<string, boolean>
  approved: Record<string, boolean>
  tracked: Record<string, boolean>
  dismissed: Record<string, boolean>
  assignee: Record<string, string | undefined>
  comments: ConsoleComment[]
  draft: string
  toast: ConsoleToast | null
  openNav: () => void
  closeNav: () => void
  collapseNavOnNarrow: () => void
  pickOrg: (index: number) => void
  markRead: (itemId: string) => void
  markAllRead: (itemIds: string[]) => void
  openFix: (itemId: string) => void
  closeFix: () => void
  setResolved: (id: string, value: boolean) => void
  setApproved: (id: string, value: boolean) => void
  setTracked: (id: string, value: boolean) => void
  setDismissed: (id: string, value: boolean) => void
  assign: (id: string, name: string | undefined) => void
  setDraft: (draft: string) => void
  addComment: (comment: ConsoleComment) => void
  removeLastComment: () => void
  flash: (message: string, onUndo?: () => void) => void
  clearToast: () => void
  reset: () => void
}
