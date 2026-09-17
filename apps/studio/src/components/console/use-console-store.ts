import { create } from 'zustand'
import type { ConsoleStore } from './lib'
import { NAV_COLLAPSE_WIDTH } from './lib'
import { DEFAULT_ASSIGNEES, SEED_COMMENTS } from './shared/console-data'

const INITIAL = {
  fixItemId: null,
  readIds: {} as Record<string, boolean>,
  resolved: {} as Record<string, boolean>,
  approved: {} as Record<string, boolean>,
  tracked: {} as Record<string, boolean>,
  dismissed: {} as Record<string, boolean>,
  assignee: DEFAULT_ASSIGNEES as Record<string, string | undefined>,
  comments: SEED_COMMENTS,
  draft: '',
  toast: null,
}

export const useConsoleStore = create<ConsoleStore>((set, get) => ({
  navOpen: false,
  navPinned: false,
  orgIndex: 0,
  ...INITIAL,

  openNav: () => set({ navOpen: true, navPinned: true }),
  closeNav: () => set({ navOpen: false, navPinned: false }),
  collapseNavOnNarrow: () => {
    const { navOpen, navPinned } = get()
    if (navOpen && !navPinned && window.innerWidth < NAV_COLLAPSE_WIDTH) set({ navOpen: false })
  },

  pickOrg: (orgIndex) => set({ orgIndex }),
  markRead: (itemId) => set((state) => ({ readIds: { ...state.readIds, [itemId]: true } })),
  markAllRead: (itemIds) =>
    set((state) => ({
      readIds: { ...state.readIds, ...Object.fromEntries(itemIds.map((id) => [id, true])) },
    })),

  openFix: (fixItemId) => set({ fixItemId }),
  closeFix: () => set({ fixItemId: null }),

  setResolved: (id, value) => set((state) => ({ resolved: { ...state.resolved, [id]: value } })),
  setApproved: (id, value) => set((state) => ({ approved: { ...state.approved, [id]: value } })),
  setTracked: (id, value) => set((state) => ({ tracked: { ...state.tracked, [id]: value } })),
  setDismissed: (id, value) => set((state) => ({ dismissed: { ...state.dismissed, [id]: value } })),
  assign: (id, name) => set((state) => ({ assignee: { ...state.assignee, [id]: name } })),

  setDraft: (draft) => set({ draft }),
  addComment: (comment) => set((state) => ({ comments: [...state.comments, comment], draft: '' })),
  removeLastComment: () => set((state) => ({ comments: state.comments.slice(0, -1) })),

  flash: (message, onUndo) => set({ toast: { message, onUndo } }),
  clearToast: () => set({ toast: null }),
  reset: () => set({ ...INITIAL }),
}))
