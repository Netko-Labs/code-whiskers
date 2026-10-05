import { create } from 'zustand'
import type { ConsoleStore } from './lib'
import { NAV_COLLAPSED_STORAGE_KEY } from './lib'

function rememberNav(isCollapsed: boolean): void {
  try {
    window.localStorage.setItem(NAV_COLLAPSED_STORAGE_KEY, isCollapsed ? '1' : '0')
  } catch {
    // Private windows can refuse storage; the toggle still works for this visit.
  }
}

/** UI coordination only — triage decisions, comments and people are server state. */
export const useConsoleStore = create<ConsoleStore>((set, get) => ({
  isNavCollapsed: false,
  orgLogin: null,
  readIds: {},
  drafts: {},
  isPaletteOpen: false,
  isShortcutsOpen: false,
  actionsSlot: null,
  toast: null,

  setNavCollapsed: (isNavCollapsed) => set({ isNavCollapsed }),
  toggleNav: () => {
    const isNavCollapsed = !get().isNavCollapsed
    rememberNav(isNavCollapsed)
    set({ isNavCollapsed })
  },

  pickOrg: (orgLogin) => set({ orgLogin }),
  markRead: (itemId) => set((state) => ({ readIds: { ...state.readIds, [itemId]: true } })),
  markAllRead: (itemIds) =>
    set((state) => ({
      readIds: { ...state.readIds, ...Object.fromEntries(itemIds.map((id) => [id, true])) },
    })),

  setDraft: (itemId, draft) => set((state) => ({ drafts: { ...state.drafts, [itemId]: draft } })),
  setPaletteOpen: (isPaletteOpen) => set({ isPaletteOpen, isShortcutsOpen: false }),
  setShortcutsOpen: (isShortcutsOpen) => set({ isShortcutsOpen, isPaletteOpen: false }),
  setActionsSlot: (actionsSlot) => set({ actionsSlot }),

  flash: (message, onUndo) => set({ toast: { message, onUndo } }),
  clearToast: () => set({ toast: null }),
}))
