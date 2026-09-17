import { create } from 'zustand'
import type { ConsoleStore } from './lib'
import { NAV_COLLAPSE_WIDTH } from './lib'
import { DEFAULT_ASSIGNEES, SEED_COMMENTS } from './shared/console-data'

const INITIAL = {
  fixOpen: false,
  resolved: {} as Record<string, boolean>,
  approved: {} as Record<string, boolean>,
  tracked: {} as Record<string, boolean>,
  dismissed: {} as Record<string, boolean>,
  assignee: DEFAULT_ASSIGNEES,
  comments: SEED_COMMENTS,
  draft: '',
  toast: null,
}

export const useConsoleStore = create<ConsoleStore>((set, get) => ({
  navOpen: false,
  navPinned: false,
  orgIndex: 0,
  readAll: false,
  ...INITIAL,

  openNav: () => set({ navOpen: true, navPinned: true }),
  closeNav: () => set({ navOpen: false, navPinned: false }),
  collapseNavOnNarrow: () => {
    const { navOpen, navPinned } = get()
    if (navOpen && !navPinned && window.innerWidth < NAV_COLLAPSE_WIDTH) set({ navOpen: false })
  },

  pickOrg: (orgIndex) => set({ orgIndex }),
  markAllRead: () => set({ readAll: true }),
  setFixOpen: (fixOpen) => set({ fixOpen }),

  toggleResolved: (id) => {
    const next = !get().resolved[id]
    set((state) => ({ resolved: { ...state.resolved, [id]: next } }))
    return next
  },
  toggleApproved: (id) => {
    const next = !get().approved[id]
    set((state) => ({ approved: { ...state.approved, [id]: next } }))
    return next
  },
  setTracked: (id) => set((state) => ({ tracked: { ...state.tracked, [id]: true } })),
  setDismissed: (id) => set((state) => ({ dismissed: { ...state.dismissed, [id]: true } })),
  assign: (id, name) => set((state) => ({ assignee: { ...state.assignee, [id]: name } })),

  setDraft: (draft) => set({ draft }),
  postComment: (initials, who) => {
    const body = get().draft.trim()
    if (!body) return false
    set((state) => ({
      comments: [...state.comments, { initials, who, when: 'just now', body, self: true }],
      draft: '',
    }))
    return true
  },

  flash: (message, undoable = false) => set({ toast: { message, undoable } }),
  clearToast: () => set({ toast: null }),
  reset: () => set({ ...INITIAL }),
}))
