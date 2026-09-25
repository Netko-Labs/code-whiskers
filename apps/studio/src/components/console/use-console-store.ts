import { create } from 'zustand'
import type { ConsoleStore } from './lib'
import { NAV_COLLAPSE_WIDTH } from './lib'

/** UI coordination only — triage decisions, comments and people are server state. */
export const useConsoleStore = create<ConsoleStore>((set, get) => ({
  navOpen: false,
  navPinned: false,
  orgLogin: null,
  readIds: {},
  fixItemId: null,
  drafts: {},
  isSearchOpen: false,
  toast: null,

  openNav: () => set({ navOpen: true, navPinned: true }),
  closeNav: () => set({ navOpen: false, navPinned: false }),
  collapseNavOnNarrow: () => {
    const { navOpen, navPinned } = get()
    if (navOpen && !navPinned && window.innerWidth < NAV_COLLAPSE_WIDTH) set({ navOpen: false })
  },

  pickOrg: (orgLogin) => set({ orgLogin }),
  markRead: (itemId) => set((state) => ({ readIds: { ...state.readIds, [itemId]: true } })),
  markAllRead: (itemIds) =>
    set((state) => ({
      readIds: { ...state.readIds, ...Object.fromEntries(itemIds.map((id) => [id, true])) },
    })),

  openFix: (fixItemId) => set({ fixItemId }),
  closeFix: () => set({ fixItemId: null }),

  setDraft: (itemId, draft) => set((state) => ({ drafts: { ...state.drafts, [itemId]: draft } })),
  setSearchOpen: (isSearchOpen) => set({ isSearchOpen }),

  flash: (message, onUndo) => set({ toast: { message, onUndo } }),
  clearToast: () => set({ toast: null }),
}))
