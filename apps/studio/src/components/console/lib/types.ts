export type ConsoleToast = {
  message: string
  /** Present only when the action can genuinely be reversed; the button is hidden otherwise. */
  onUndo?: () => void
}

export type ConsoleStore = {
  navOpen: boolean
  navPinned: boolean
  /** `null` shows every installation the viewer can see. */
  orgLogin: string | null
  readIds: Record<string, boolean>
  /** The item the fix drawer was opened for; the drawer closes if the selection moves elsewhere. */
  fixItemId: string | null
  drafts: Record<string, string>
  isSearchOpen: boolean
  toast: ConsoleToast | null
  openNav: () => void
  closeNav: () => void
  collapseNavOnNarrow: () => void
  pickOrg: (login: string | null) => void
  markRead: (itemId: string) => void
  markAllRead: (itemIds: string[]) => void
  openFix: (itemId: string) => void
  closeFix: () => void
  setDraft: (itemId: string, draft: string) => void
  setSearchOpen: (isOpen: boolean) => void
  flash: (message: string, onUndo?: () => void) => void
  clearToast: () => void
}
