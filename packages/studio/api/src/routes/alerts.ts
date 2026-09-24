import {
  AlertRuleCreateSchema,
  AlertRuleUpdateSchema,
  IdParamSchema,
} from '@code-whiskers/studio-domain'
import {
  createAlertRule,
  deleteAlertRule,
  getAlertRulesForUser,
  setAlertRuleMuted,
} from '@code-whiskers/studio-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'

export const alertRoutes = new Elysia({ name: 'alerts', prefix: '/alerts' })
  .use(authPlugin)
  // (ﾟДﾟ;) conditions whiskers watches, delivered to the installation's webhooks
  .get('', { auth: true }, ({ user }) => getAlertRulesForUser(user.id))
  .post('', { auth: true, body: AlertRuleCreateSchema }, async ({ body, user, status }) => {
    const created = await createAlertRule(user.id, body)
    if (!created) return status(403, 'Forbidden')
    return created
  })
  .patch(
    '/:id',
    { auth: true, params: IdParamSchema, body: AlertRuleUpdateSchema },
    async ({ params, body, user, status }) => {
      if (!(await setAlertRuleMuted(user.id, params.id, body.isMuted))) {
        return status(404, 'Not found')
      }
      return { ok: true }
    },
  )
  .delete('/:id', { auth: true, params: IdParamSchema }, async ({ params, user, status }) => {
    if (!(await deleteAlertRule(user.id, params.id))) return status(404, 'Not found')
    return { ok: true }
  })
