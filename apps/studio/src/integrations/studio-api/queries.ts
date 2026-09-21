import { queryOptions } from '@tanstack/react-query'
import type { ZodType } from 'zod'
import { z } from 'zod'
import { organizationListSchema, repositoryListSchema, syncResultSchema } from './lib'

const okSchema = z.object({ ok: z.boolean() })

const STUDIO_QUERY_KEY = 'studio'

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

export const syncGithub = () => fetchStudio('/orgs/sync', syncResultSchema, 'POST')

export type TriageDecision = {
  scope: string
  itemKind: 'issue' | 'review' | 'log' | 'finding'
  itemRef: string
  status: 'open' | 'resolved' | 'snoozed' | 'tracked' | 'approved' | 'dismissed'
  note?: string
}

/** Records the decision in studio so the reviewer sees it on the next push. */
export const recordTriage = (decision: TriageDecision) =>
  fetchStudio('/triage', okSchema, 'POST', decision)
