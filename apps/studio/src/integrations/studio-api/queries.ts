import { queryOptions } from '@tanstack/react-query'
import type { ZodType } from 'zod'
import {
  createdSchema,
  instanceSchema,
  memberListSchema,
  okSchema,
  organizationListSchema,
  repositoryListSchema,
  studioStorageSchema,
  syncResultSchema,
  type TriageDecision,
  type TriageItemRef,
  triageCommentListSchema,
  triageRecordListSchema,
  viewerSchema,
} from './lib'

export const STUDIO_QUERY_KEY = 'studio'

/** Studio's own API is same-origin; these are browser-only like the whiskers ones. */
async function fetchStudio<T>(
  path: string,
  schema: ZodType<T>,
  method = 'GET',
  body?: unknown,
): Promise<T> {
  if (typeof window === 'undefined') {
    throw new Error(`studio ${path} was requested on the server; these queries are client-only`)
  }
  const response = await fetch(`/api${path}`, {
    method,
    headers: body
      ? { accept: 'application/json', 'content-type': 'application/json' }
      : { accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!response.ok) throw new Error(`studio ${path} responded ${response.status}`)
  return schema.parse(await response.json())
}

export const viewerQuery = () =>
  queryOptions({
    queryKey: [STUDIO_QUERY_KEY, 'me'],
    queryFn: () => fetchStudio('/me', viewerSchema),
    staleTime: Number.POSITIVE_INFINITY,
  })

export const instanceQuery = () =>
  queryOptions({
    queryKey: [STUDIO_QUERY_KEY, 'instance'],
    queryFn: () => fetchStudio('/instance', instanceSchema),
    staleTime: Number.POSITIVE_INFINITY,
  })

export const studioStorageQuery = () =>
  queryOptions({
    queryKey: [STUDIO_QUERY_KEY, 'instance', 'storage'],
    queryFn: () => fetchStudio('/instance/storage', studioStorageSchema),
  })

export const organizationsQuery = () =>
  queryOptions({
    queryKey: [STUDIO_QUERY_KEY, 'orgs'],
    queryFn: () => fetchStudio('/orgs', organizationListSchema),
  })

export const repositoriesQuery = () =>
  queryOptions({
    queryKey: [STUDIO_QUERY_KEY, 'repositories'],
    queryFn: () => fetchStudio('/repositories', repositoryListSchema),
  })

export const membersQuery = () =>
  queryOptions({
    queryKey: [STUDIO_QUERY_KEY, 'members'],
    queryFn: () => fetchStudio('/members', memberListSchema),
  })

export const triageQuery = () =>
  queryOptions({
    queryKey: [STUDIO_QUERY_KEY, 'triage'],
    queryFn: () => fetchStudio('/triage', triageRecordListSchema),
  })

export const triageCommentsQuery = (item: TriageItemRef) =>
  queryOptions({
    queryKey: [STUDIO_QUERY_KEY, 'triage-comments', item.scope, item.itemKind, item.itemRef],
    queryFn: () =>
      fetchStudio(
        `/triage/comments?${new URLSearchParams({ scope: item.scope, itemKind: item.itemKind, itemRef: item.itemRef })}`,
        triageCommentListSchema,
      ),
  })

export const syncGithub = () => fetchStudio('/orgs/sync', syncResultSchema, 'POST')

/** Records the decision in studio so the reviewer sees it on the next push. */
export const recordTriage = (decision: TriageDecision) =>
  fetchStudio('/triage', okSchema, 'POST', decision)

export const assignTriage = (item: TriageItemRef, assigneeUserId: string | null) =>
  fetchStudio('/triage/assign', okSchema, 'POST', { ...item, assigneeUserId })

export const postTriageComment = (item: TriageItemRef, body: string) =>
  fetchStudio('/triage/comments', createdSchema, 'POST', { ...item, body })
