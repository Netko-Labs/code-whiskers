import type { RepositoryTab } from './types'

/** Whiskers cannot see whether a PR merged; blockers count only on recently active ones. */
export const ACTIVE_WINDOW_MS = 14 * 24 * 60 * 60 * 1000

export const REPOSITORY_TABS: { key: RepositoryTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'watched', label: 'Watched' },
  { key: 'paused', label: 'Paused' },
]
