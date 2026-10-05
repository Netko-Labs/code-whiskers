import {
  ProjectCreateSchema,
  ProjectKeyCreateSchema,
  ProjectKeyParamsSchema,
  ProjectKeyUpdateSchema,
  ProjectRepositorySchema,
  ProjectUpdateSchema,
} from '@code-whiskers/whiskers-domain'
import {
  createProject,
  createProjectKey,
  deleteProject,
  deleteProjectKey,
  getProject,
  getProjectSummary,
  getProjects,
  sendTestEvent,
  setProjectRepository,
  updateProject,
  updateProjectKey,
} from '@code-whiskers/whiskers-service'
import { Elysia } from 'elysia'

const NO_PROJECT = { error: 'no such project' }

/** Projects and their client keys. Studio forwards writes only for a signed-in person. */
export const projectRoutes = new Elysia({ name: 'projects', prefix: '/v1/projects' })
  // (ノ°▽°)ノ where error events come from, and the keys each one takes
  .get('', () => getProjects())
  .post('', { body: ProjectCreateSchema }, ({ body }) =>
    createProject(body.name, body.repository ?? null),
  )
  .get('/:projectId', async ({ params, status }) => {
    const project = await getProjectSummary(params.projectId)
    return project ?? status(404, NO_PROJECT)
  })
  .patch('/:projectId', { body: ProjectUpdateSchema }, async ({ params, body, status }) => {
    const project = await updateProject(params.projectId, body)
    return (project && (await getProjectSummary(project.id))) ?? status(404, NO_PROJECT)
  })
  .post(
    '/:projectId/repository',
    { body: ProjectRepositorySchema },
    async ({ params, body, status }) => {
      const project = await setProjectRepository(params.projectId, body.repository)
      return (project && (await getProjectSummary(project.id))) ?? status(404, NO_PROJECT)
    },
  )
  // (╯°□°)╯ the project, its keys and everything it sent
  .delete('/:projectId', async ({ params, status }) =>
    (await deleteProject(params.projectId)) ? { deleted: true } : status(404, NO_PROJECT),
  )
  // (・ω・)ノ a synthetic error through the real ingest path — proof without an SDK
  .post('/:projectId/test-event', async ({ params, status }) => {
    const result = await sendTestEvent(params.projectId)
    return result ?? status(404, NO_PROJECT)
  })
  .post('/:projectId/keys', { body: ProjectKeyCreateSchema }, async ({ params, body, status }) => {
    if (!(await getProject(params.projectId))) return status(404, NO_PROJECT)
    const key = await createProjectKey(params.projectId, body.label)
    return key ?? status(409, { error: 'this project has as many keys as it can hold' })
  })
  .patch(
    '/:projectId/keys/:keyId',
    { params: ProjectKeyParamsSchema, body: ProjectKeyUpdateSchema },
    async ({ params, body, status }) => {
      const key = await updateProjectKey(params.projectId, params.keyId, body)
      return key ?? status(404, { error: 'no such key' })
    },
  )
  .delete(
    '/:projectId/keys/:keyId',
    { params: ProjectKeyParamsSchema },
    async ({ params, status }) => {
      const outcome = await deleteProjectKey(params.projectId, params.keyId)
      if (outcome === 'missing') return status(404, { error: 'no such key' })
      if (outcome === 'last-enabled') {
        return status(409, {
          error: 'the last enabled key cannot be deleted; add or enable another',
        })
      }
      return { deleted: true }
    },
  )
