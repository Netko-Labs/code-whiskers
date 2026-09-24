import { IdParamSchema, IntegrationCreateSchema } from '@code-whiskers/studio-domain'
import {
  createIntegration,
  deleteIntegration,
  getIntegrationsForUser,
  testIntegration,
} from '@code-whiskers/studio-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'

export const integrationRoutes = new Elysia({ name: 'integrations', prefix: '/integrations' })
  .use(authPlugin)
  // (っ˘ω˘ς) where alerts go — the URL is never read back, only its host
  .get('', { auth: true }, ({ user }) => getIntegrationsForUser(user.id))
  .post('', { auth: true, body: IntegrationCreateSchema }, async ({ body, user, status }) => {
    const created = await createIntegration(user.id, body).catch((error: Error) => {
      if (error.message.includes('private address')) return 'private' as const
      throw error
    })
    if (created === 'private') {
      return status(422, 'That webhook host points inside the network — use a public URL')
    }
    if (!created) return status(403, 'Forbidden')
    return created
  })
  .post('/:id/test', { auth: true, params: IdParamSchema }, async ({ params, user, status }) => {
    const result = await testIntegration(user.id, params.id)
    if (!result) return status(404, 'Not found')
    return result
  })
  .delete('/:id', { auth: true, params: IdParamSchema }, async ({ params, user, status }) => {
    if (!(await deleteIntegration(user.id, params.id))) return status(404, 'Not found')
    return { ok: true }
  })
