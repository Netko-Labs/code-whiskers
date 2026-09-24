import { IdParamSchema, SavedQueryCreateSchema } from '@code-whiskers/studio-domain'
import { createSavedQuery, deleteSavedQuery, getSavedQueries } from '@code-whiskers/studio-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'

export const savedQueryRoutes = new Elysia({ name: 'saved-queries', prefix: '/saved-queries' })
  .use(authPlugin)
  // (￣▽￣)b views worth coming back to
  .get('', { auth: true }, ({ user }) => getSavedQueries(user.id))
  .post('', { auth: true, body: SavedQueryCreateSchema }, ({ body, user }) =>
    createSavedQuery(user.id, body),
  )
  .delete('/:id', { auth: true, params: IdParamSchema }, async ({ params, user, status }) => {
    if (!(await deleteSavedQuery(user.id, params.id))) return status(404, 'Not found')
    return { ok: true }
  })
