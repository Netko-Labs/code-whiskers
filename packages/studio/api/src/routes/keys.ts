import { ApiKeyCreateSchema, IdParamSchema } from '@code-whiskers/studio-domain'
import { createApiKey, getApiKeysForUser, revokeApiKey } from '@code-whiskers/studio-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'

export const keyRoutes = new Elysia({ name: 'keys', prefix: '/keys' })
  .use(authPlugin)
  // (￣^￣)ゞ read keys for /v1 — the key itself is only ever in this response
  .get('', { auth: true }, ({ user }) => getApiKeysForUser(user.id))
  .post('', { auth: true, body: ApiKeyCreateSchema }, ({ body, user }) =>
    createApiKey(user.id, body),
  )
  .delete('/:id', { auth: true, params: IdParamSchema }, async ({ params, user, status }) => {
    if (!(await revokeApiKey(user.id, params.id))) return status(404, 'Not found')
    return { ok: true }
  })
