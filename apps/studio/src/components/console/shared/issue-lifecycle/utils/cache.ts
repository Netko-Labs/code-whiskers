import type { InfiniteData, QueryClient } from '@tanstack/react-query'
import { type IssueLifecycle, STUDIO_QUERY_KEY } from '@/integrations/studio-api'
import {
  WHISKERS_QUERY_KEY,
  type WhiskersIssue,
  type WhiskersIssueDetail,
  type WhiskersIssuePage,
} from '@/integrations/whiskers'
import type { IssueCacheSnapshot } from '../types'

const LIST_KEY = [WHISKERS_QUERY_KEY, 'issues', 'list']
const DETAIL_KEY = [WHISKERS_QUERY_KEY, 'issue']

/**
 * Rewrites the matching rows in every cached issue list and detail, and returns what was there so
 * a failed write can put it back.
 */
export function patchIssueCaches(
  queryClient: QueryClient,
  update: (issue: WhiskersIssue) => WhiskersIssue | undefined,
): IssueCacheSnapshot {
  void queryClient.cancelQueries({ queryKey: LIST_KEY })
  void queryClient.cancelQueries({ queryKey: DETAIL_KEY })
  const snapshot: IssueCacheSnapshot = [
    ...queryClient.getQueriesData<InfiniteData<WhiskersIssuePage>>({ queryKey: LIST_KEY }),
    ...queryClient.getQueriesData<WhiskersIssueDetail>({ queryKey: DETAIL_KEY }),
  ]
  const swap = (issue: WhiskersIssue) => update(issue) ?? issue
  queryClient.setQueriesData<InfiniteData<WhiskersIssuePage>>({ queryKey: LIST_KEY }, (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((page) => ({ ...page, issues: page.issues.map(swap) })),
        }
      : data,
  )
  queryClient.setQueriesData<WhiskersIssueDetail>({ queryKey: DETAIL_KEY }, (data) =>
    data ? { ...data, issue: swap(data.issue) } : data,
  )
  return snapshot
}

export function restoreIssueCaches(queryClient: QueryClient, snapshot: IssueCacheSnapshot): void {
  for (const [key, data] of snapshot) queryClient.setQueryData(key, data)
}

/** The rows the snapshot held for these ids, from whichever cache saw each first. */
export function snapshotRows(
  snapshot: IssueCacheSnapshot,
  ids: string[],
): Map<string, WhiskersIssue> {
  const wanted = new Set(ids)
  const rows = new Map<string, WhiskersIssue>()
  for (const [, data] of snapshot) {
    const issues = !data
      ? []
      : 'pages' in data
        ? data.pages.flatMap((page) => page.issues)
        : [data.issue]
    for (const issue of issues) {
      if (wanted.has(issue.id) && !rows.has(issue.id)) rows.set(issue.id, issue)
    }
  }
  return rows
}

/** Puts only these issues back as they were; the rest of the cache keeps what landed. */
export function rollbackIssues(
  queryClient: QueryClient,
  snapshot: IssueCacheSnapshot,
  ids: string[],
): void {
  const rows = snapshotRows(snapshot, ids)
  patchIssueCaches(queryClient, (issue) => rows.get(issue.id))
}

/** Whiskers' answer is the truth for the fields it computes, like the release a resolve waits on. */
export function mergeLifecycleRows(queryClient: QueryClient, rows: IssueLifecycle[]): void {
  if (rows.length === 0) return
  const byId = new Map(rows.map((row) => [row.id, row]))
  patchIssueCaches(queryClient, (issue) => {
    const row = byId.get(issue.id)
    return row ? { ...issue, ...row } : undefined
  })
}

export function invalidateIssueQueries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: [WHISKERS_QUERY_KEY, 'issues'] })
  void queryClient.invalidateQueries({ queryKey: DETAIL_KEY })
  void queryClient.invalidateQueries({ queryKey: [STUDIO_QUERY_KEY, 'triage-activity'] })
}
