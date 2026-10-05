import { describe, expect, test } from 'bun:test'
import { type InfiniteData, QueryClient } from '@tanstack/react-query'
import {
  WHISKERS_QUERY_KEY,
  type WhiskersIssue,
  type WhiskersIssueDetail,
  type WhiskersIssuePage,
} from '@/integrations/whiskers'
import { patchIssueCaches, rollbackIssues, snapshotRows } from './cache'
import { failedIssueIds } from './requests'

const LIST_KEY = [WHISKERS_QUERY_KEY, 'issues', 'list', { status: 'all' }]
const DETAIL_KEY = [WHISKERS_QUERY_KEY, 'issue', 'b']

function issue(id: string, status: WhiskersIssue['status'] = 'unresolved'): WhiskersIssue {
  return {
    id,
    projectId: id === 'b' ? 'p2' : 'p1',
    fingerprint: id,
    title: `Issue ${id}`,
    level: 'error',
    status,
    eventCount: 1,
    userCount: 1,
    firstSeen: new Date(0),
    lastSeen: new Date(0),
    firstRelease: null,
    lastRelease: null,
    resolvedInRelease: null,
    resolvedAt: null,
    regressedAt: null,
    archivedUntil: null,
    archiveUntilEvents: null,
    archiveUntilUsers: null,
    badges: [],
    trend: [],
    culprit: null,
  }
}

function seeded() {
  const queryClient = new QueryClient()
  queryClient.setQueryData<InfiniteData<WhiskersIssuePage>>(LIST_KEY, {
    pages: [{ issues: [issue('a'), issue('b')], nextCursor: null, total: 2 }],
    pageParams: [null],
  })
  queryClient.setQueryData<Partial<WhiskersIssueDetail>>(DETAIL_KEY, { issue: issue('b') })
  return queryClient
}

const statuses = (queryClient: QueryClient) => ({
  list: queryClient
    .getQueryData<InfiniteData<WhiskersIssuePage>>(LIST_KEY)
    ?.pages[0]?.issues.map((row) => row.status),
  detail: queryClient.getQueryData<WhiskersIssueDetail>(DETAIL_KEY)?.issue.status,
})

describe('partial lifecycle failure', () => {
  const requests = [
    { scope: 'project:p1', issueIds: ['a'], status: 'resolved' as const },
    { scope: 'project:p2', issueIds: ['b'], status: 'resolved' as const },
  ]

  test('the ids of every failed scope', () => {
    const results: PromiseSettledResult<unknown>[] = [
      { status: 'fulfilled', value: {} },
      { status: 'rejected', reason: new Error('503') },
    ]
    expect(failedIssueIds(requests, results)).toEqual(['b'])
  })

  test('failed issues go back at once; the ones that landed keep the change', () => {
    const queryClient = seeded()
    const snapshot = patchIssueCaches(queryClient, (row) => issue(row.id, 'resolved'))
    expect(statuses(queryClient)).toEqual({ list: ['resolved', 'resolved'], detail: 'resolved' })
    expect([...snapshotRows(snapshot, ['b']).keys()]).toEqual(['b'])

    rollbackIssues(queryClient, snapshot, ['b'])
    expect(statuses(queryClient)).toEqual({
      list: ['resolved', 'unresolved'],
      detail: 'unresolved',
    })
  })
})
