import { queryOptions } from '@tanstack/react-query'
import type { ZodType } from 'zod'
import { ResponseError } from '@/integrations/observability'
import {
  apiKeyListSchema,
  createdKeySchema,
  createdSchema,
  deliverySchema,
  githubLoginSchema,
  type InstanceSettingsInput,
  type IntegrationInput,
  type IssueLifecycleInput,
  instanceHealthSchema,
  instanceSchema,
  instanceSettingsSchema,
  integrationListSchema,
  issueLifecycleResultSchema,
  memberListSchema,
  okSchema,
  organizationListSchema,
  type ReviewRuleInput,
  recentTriageActivityListSchema,
  repositoryListSchema,
  reviewRuleListSchema,
  type SavedQueryInput,
  savedQueryListSchema,
  studioStorageSchema,
  syncResultSchema,
  type TriageDecision,
  type TriageItemRef,
  type TriageItemRefs,
  triageActivityListSchema,
  triageCommentListSchema,
  triageRecordListSchema,
  viewerSchema,
} from './lib'

export const STUDIO_QUERY_KEY = 'studio'

const STATUS_MESSAGE: Record<number, string> = {
  401: 'Your session ended — sign in again',
  403: 'You do not have access to that',
  404: 'That no longer exists',
}

/** Validation failures carry the field that failed; everything else gets a plain sentence. */
async function failureMessage(response: Response): Promise<string> {
  const known = STATUS_MESSAGE[response.status]
  if (known) return known
  const text = await response.text().catch(() => '')
  try {
    const body = JSON.parse(text) as { detail?: string; message?: string; summary?: string }
    return body.summary ?? body.detail ?? body.message ?? `Request failed (${response.status})`
  } catch {
    return text || `Request failed (${response.status})`
  }
}

/** Studio's own API is same-origin; these are browser-only like the whiskers ones. */
export async function fetchStudio<T>(
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
  if (!response.ok) throw new ResponseError(await failureMessage(response), response.status)
  return schema.parse(await response.json())
}

export const viewerQuery = () =>
  queryOptions({
    queryKey: [STUDIO_QUERY_KEY, 'me'],
    queryFn: () => fetchStudio('/me', viewerSchema),
    staleTime: Number.POSITIVE_INFINITY,
  })

export const githubLoginQuery = () =>
  queryOptions({
    queryKey: [STUDIO_QUERY_KEY, 'me', 'github'],
    queryFn: () => fetchStudio('/me/github', githubLoginSchema),
    staleTime: Number.POSITIVE_INFINITY,
  })

export const instanceQuery = () =>
  queryOptions({
    queryKey: [STUDIO_QUERY_KEY, 'instance'],
    queryFn: () => fetchStudio('/instance', instanceSchema),
    staleTime: Number.POSITIVE_INFINITY,
  })

export const instanceHealthQuery = () =>
  queryOptions({
    queryKey: [STUDIO_QUERY_KEY, 'instance', 'health'],
    queryFn: () => fetchStudio('/instance/health', instanceHealthSchema),
    refetchInterval: 30_000,
  })

export const updateInstanceSettings = (input: InstanceSettingsInput) =>
  fetchStudio('/instance', instanceSettingsSchema, 'PATCH', input)

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

/** Under `triage-activity`, so the realtime map that refreshes an item's timeline refreshes this. */
export const recentTriageActivityQuery = () =>
  queryOptions({
    queryKey: [STUDIO_QUERY_KEY, 'triage-activity', 'recent'],
    queryFn: () => fetchStudio('/triage/activity/recent', recentTriageActivityListSchema),
  })

export const triageActivityQuery = (item: TriageItemRef) =>
  queryOptions({
    queryKey: [STUDIO_QUERY_KEY, 'triage-activity', item.scope, item.itemKind, item.itemRef],
    queryFn: () =>
      fetchStudio(
        `/triage/activity?${new URLSearchParams({ scope: item.scope, itemKind: item.itemKind, itemRef: item.itemRef })}`,
        triageActivityListSchema,
      ),
  })

export const syncGithub = () => fetchStudio('/orgs/sync', syncResultSchema, 'POST')

/** Records the decision in studio so the reviewer sees it on the next push. */
export const recordTriage = (decision: TriageDecision) =>
  fetchStudio('/triage', okSchema, 'POST', decision)

export const assignTriage = (item: TriageItemRef, assigneeUserId: string | null) =>
  fetchStudio('/triage/assign', okSchema, 'POST', { ...item, assigneeUserId })

export const assignTriageMany = (items: TriageItemRefs, assigneeUserId: string | null) =>
  fetchStudio('/triage/assign', okSchema, 'POST', { ...items, assigneeUserId })

/** Studio records the decision, then mirrors it to whiskers so ingest can reopen or unarchive. */
export const setIssueLifecycle = (input: IssueLifecycleInput) =>
  fetchStudio('/triage/issues/lifecycle', issueLifecycleResultSchema, 'POST', input)

export const postTriageComment = (item: TriageItemRef, body: string) =>
  fetchStudio('/triage/comments', createdSchema, 'POST', { ...item, body })

export const rulesQuery = () =>
  queryOptions({
    queryKey: [STUDIO_QUERY_KEY, 'rules'],
    queryFn: () => fetchStudio('/rules', reviewRuleListSchema),
  })

export const createRule = (input: ReviewRuleInput) =>
  fetchStudio('/rules', createdSchema, 'POST', input)

export const updateRule = (id: string, patch: Partial<ReviewRuleInput> & { isMuted?: boolean }) =>
  fetchStudio(`/rules/${id}`, okSchema, 'PATCH', patch)

export const deleteRule = (id: string) => fetchStudio(`/rules/${id}`, okSchema, 'DELETE')

export const apiKeysQuery = () =>
  queryOptions({
    queryKey: [STUDIO_QUERY_KEY, 'keys'],
    queryFn: () => fetchStudio('/keys', apiKeyListSchema),
  })

export const createApiKey = (name: string) =>
  fetchStudio('/keys', createdKeySchema, 'POST', { name })

export const revokeApiKey = (id: string) => fetchStudio(`/keys/${id}`, okSchema, 'DELETE')

export const integrationsQuery = () =>
  queryOptions({
    queryKey: [STUDIO_QUERY_KEY, 'integrations'],
    queryFn: () => fetchStudio('/integrations', integrationListSchema),
  })

export const createIntegration = (input: IntegrationInput) =>
  fetchStudio('/integrations', createdSchema, 'POST', input)

export const testIntegration = (id: string) =>
  fetchStudio(`/integrations/${id}/test`, deliverySchema, 'POST', {})

export const deleteIntegration = (id: string) =>
  fetchStudio(`/integrations/${id}`, okSchema, 'DELETE')

export const savedQueriesQuery = () =>
  queryOptions({
    queryKey: [STUDIO_QUERY_KEY, 'saved-queries'],
    queryFn: () => fetchStudio('/saved-queries', savedQueryListSchema),
  })

export const createSavedQuery = (input: SavedQueryInput) =>
  fetchStudio('/saved-queries', createdSchema, 'POST', input)

export const deleteSavedQuery = (id: string) =>
  fetchStudio(`/saved-queries/${id}`, okSchema, 'DELETE')

export const setRepositoryWatched = (id: number, isWatched: boolean) =>
  fetchStudio(`/repositories/${id}`, okSchema, 'PATCH', { isWatched })
