import type { SectionView, TriageBucket } from '../shared/console-model'

export type ConsoleToast = {
  message: string
  /** Present only when the action can genuinely be reversed; the button is hidden otherwise. */
  onUndo?: () => void
}

export type ConsoleStore = {
  isNavCollapsed: boolean
  /** `null` shows every installation the viewer can see. */
  orgLogin: string | null
  readIds: Record<string, boolean>
  drafts: Record<string, string>
  isPaletteOpen: boolean
  isShortcutsOpen: boolean
  /** Where `TopbarActions` portals page actions; registered by the top bar on mount. */
  actionsSlot: HTMLElement | null
  toast: ConsoleToast | null
  setNavCollapsed: (isCollapsed: boolean) => void
  toggleNav: () => void
  pickOrg: (login: string | null) => void
  markRead: (itemId: string) => void
  markAllRead: (itemIds: string[]) => void
  setDraft: (itemId: string, draft: string) => void
  setPaletteOpen: (isOpen: boolean) => void
  setShortcutsOpen: (isOpen: boolean) => void
  setActionsSlot: (slot: HTMLElement | null) => void
  flash: (message: string, onUndo?: () => void) => void
  clearToast: () => void
}

/** A `g` + key jump; the target is a console route the shortcut sheet also lists. */
export type GoTarget =
  | { key: string; label: string; bucket: TriageBucket }
  | { key: string; label: string; section: SectionView }
  | { key: string; label: string; path: '/console/projects/new' | '/console/overview' }

export type ShortcutEntry = {
  keys: string[]
  label: string
}

export type ShortcutGroup = {
  title: string
  entries: ShortcutEntry[]
}
