import type { issueTable } from '@code-whiskers/whiskers-domain'

/** Back to unresolved: whatever resolve or archive condition held is spent. */
export const REOPENED = {
  status: 'unresolved',
  resolvedInRelease: null,
  resolvedAt: null,
  archivedUntil: null,
  archiveUntilEvents: null,
  archiveUntilUsers: null,
} as const satisfies Partial<typeof issueTable.$inferInsert>
