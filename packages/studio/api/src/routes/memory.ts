import {
  IdParamSchema,
  MemoryNoteCreateSchema,
  MemoryNoteUpdateSchema,
} from '@code-whiskers/studio-domain'
import {
  createMemoryNote,
  deleteMemoryNote,
  getMemoryActivity,
  getMemoryForUser,
  realtimeBus,
  undoMemoryActivity,
  updateMemoryNote,
} from '@code-whiskers/studio-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'

const changed = () => realtimeBus.publish(['memory'])

export const memoryRoutes = new Elysia({ name: 'memory', prefix: '/memory' })
  .use(authPlugin)
  // (｀・ω・´) what the reviewer knows about the team's code
  .get('', { auth: true }, ({ user }) => getMemoryForUser(user.id))
  .post('', { auth: true, body: MemoryNoteCreateSchema }, async ({ body, user, status }) => {
    const created = await createMemoryNote(user.id, body)
    if (!created) return status(403, 'Forbidden')
    changed()
    return created
  })
  .patch(
    '/:id',
    { auth: true, params: IdParamSchema, body: MemoryNoteUpdateSchema },
    async ({ params, body, user, status }) => {
      if (!(await updateMemoryNote(user.id, params.id, body))) return status(403, 'Forbidden')
      changed()
      return { ok: true }
    },
  )
  .delete('/:id', { auth: true, params: IdParamSchema }, async ({ params, user, status }) => {
    if (!(await deleteMemoryNote(user.id, params.id))) return status(403, 'Forbidden')
    changed()
    return { ok: true }
  })
  // (ㆆ_ㆆ) every change, human or learned, so any of it can be undone
  .get('/activity', { auth: true }, ({ user }) => getMemoryActivity(user.id))
  .post(
    '/activity/:id/undo',
    { auth: true, params: IdParamSchema },
    async ({ params, user, status }) => {
      if (!(await undoMemoryActivity(user.id, params.id))) return status(409, 'Already undone')
      changed()
      return { ok: true }
    },
  )
