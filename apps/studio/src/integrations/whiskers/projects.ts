import { queryOptions } from '@tanstack/react-query'
import { fetchWhiskers, postWhiskers, sendWhiskers } from './client'
import {
  type ProjectKeyPatch,
  type ProjectPatch,
  WHISKERS_QUERY_KEY,
  whiskersDeletedSchema,
  whiskersIssuePageSchema,
  whiskersProjectKeySchema,
  whiskersProjectListSchema,
  whiskersProjectSchema,
  whiskersTestEventSchema,
} from './lib'

const projectPath = (projectId: string) => `/projects/${encodeURIComponent(projectId)}`
const keyPath = (projectId: string, keyId: string) =>
  `${projectPath(projectId)}/keys/${encodeURIComponent(keyId)}`

export const whiskersProjectsQuery = () =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'projects'],
    queryFn: () => fetchWhiskers('/projects', whiskersProjectListSchema),
  })

export const whiskersProjectQuery = (projectId: string) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'project', projectId],
    queryFn: () => fetchWhiskers(projectPath(projectId), whiskersProjectSchema),
  })

/** The project's most recently seen issue, any status: what the setup listener waits for. */
export const whiskersLatestIssueQuery = (projectId: string) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'latest-issue', projectId],
    queryFn: async () => {
      const search = new URLSearchParams({
        projectId,
        status: 'all',
        sort: 'last_seen',
        limit: '1',
      })
      const page = await fetchWhiskers(`/issues?${search}`, whiskersIssuePageSchema)
      return page.issues[0] ?? null
    },
  })

export const createWhiskersProject = (name: string, repository: string | null) =>
  postWhiskers('/projects', { name, repository }, whiskersProjectSchema)

export const setWhiskersProjectRepository = (projectId: string, repository: string | null) =>
  postWhiskers(`${projectPath(projectId)}/repository`, { repository }, whiskersProjectSchema)

export const updateWhiskersProject = (projectId: string, patch: ProjectPatch) =>
  sendWhiskers('PATCH', projectPath(projectId), patch, whiskersProjectSchema)

export const deleteWhiskersProject = (projectId: string) =>
  sendWhiskers('DELETE', projectPath(projectId), undefined, whiskersDeletedSchema)

export const sendWhiskersTestEvent = (projectId: string) =>
  postWhiskers(`${projectPath(projectId)}/test-event`, undefined, whiskersTestEventSchema)

export const createWhiskersProjectKey = (projectId: string, label: string) =>
  postWhiskers(`${projectPath(projectId)}/keys`, { label }, whiskersProjectKeySchema)

export const updateWhiskersProjectKey = (
  projectId: string,
  keyId: string,
  patch: ProjectKeyPatch,
) => sendWhiskers('PATCH', keyPath(projectId, keyId), patch, whiskersProjectKeySchema)

export const deleteWhiskersProjectKey = (projectId: string, keyId: string) =>
  sendWhiskers('DELETE', keyPath(projectId, keyId), undefined, whiskersDeletedSchema)
