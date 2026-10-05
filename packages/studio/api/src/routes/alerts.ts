import {
  AlertFiringsQuerySchema,
  AlertPreviewSchema,
  AlertRuleCreateSchema,
  AlertRuleUpdateSchema,
  IdParamSchema,
} from '@code-whiskers/studio-domain'
import {
  createAlertRule,
  deleteAlertRule,
  getAlertFiringsForUser,
  getAlertRuleForUser,
  getAlertRulesForUser,
  previewAlertRule,
  updateAlertRule,
} from '@code-whiskers/studio-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'

export const alertRoutes = new Elysia({ name: 'alerts', prefix: '/alerts' })
  .use(authPlugin)
  // (ﾟДﾟ;) WHEN → IF → THEN, evaluated by whiskers, delivered by studio
  .get('', { auth: true }, ({ user }) => getAlertRulesForUser(user.id))
  .post('', { auth: true, body: AlertRuleCreateSchema }, async ({ body, user, status }) => {
    const created = await createAlertRule(user.id, body)
    if (!created) return status(403, 'Forbidden')
    return created
  })
  // (・∀・) what fired, where it went, newest first
  .get('/firings', { auth: true, query: AlertFiringsQuerySchema }, ({ user, query }) =>
    getAlertFiringsForUser(user.id, query),
  )
  // (￣～￣) how often a draft would have fired over the last 7 days
  .post('/preview', { auth: true, body: AlertPreviewSchema }, async ({ body, user, status }) => {
    const result = await previewAlertRule(user.id, body)
    if (result === 'forbidden') return status(403, 'Forbidden')
    if (result === 'unavailable') return status(503, 'Whiskers is not answering')
    return result
  })
  .get('/:id', { auth: true, params: IdParamSchema }, async ({ params, user, status }) => {
    return (await getAlertRuleForUser(user.id, params.id)) ?? status(404, 'Not found')
  })
  .patch(
    '/:id',
    { auth: true, params: IdParamSchema, body: AlertRuleUpdateSchema },
    async ({ params, body, user, status }) => {
      if (!(await updateAlertRule(user.id, params.id, body))) return status(404, 'Not found')
      return { ok: true }
    },
  )
  .delete('/:id', { auth: true, params: IdParamSchema }, async ({ params, user, status }) => {
    if (!(await deleteAlertRule(user.id, params.id))) return status(404, 'Not found')
    return { ok: true }
  })
