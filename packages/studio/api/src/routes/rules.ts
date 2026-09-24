import {
  IdParamSchema,
  ReviewRuleCreateSchema,
  ReviewRuleUpdateSchema,
} from '@code-whiskers/studio-domain'
import {
  createReviewRule,
  deleteReviewRule,
  getRulesForUser,
  updateReviewRule,
} from '@code-whiskers/studio-service'
import { Elysia } from 'elysia'
import { authPlugin } from '../setup'

export const ruleRoutes = new Elysia({ name: 'rules', prefix: '/rules' })
  .use(authPlugin)
  // (｀・ω・´) what the team told the reviewer
  .get('', { auth: true }, ({ user }) => getRulesForUser(user.id))
  .post('', { auth: true, body: ReviewRuleCreateSchema }, async ({ body, user, status }) => {
    const created = await createReviewRule(user.id, body)
    if (!created) return status(403, 'Forbidden')
    return created
  })
  .patch(
    '/:id',
    { auth: true, params: IdParamSchema, body: ReviewRuleUpdateSchema },
    async ({ params, body, user, status }) => {
      if (!(await updateReviewRule(user.id, params.id, body))) return status(403, 'Forbidden')
      return { ok: true }
    },
  )
  .delete('/:id', { auth: true, params: IdParamSchema }, async ({ params, user, status }) => {
    if (!(await deleteReviewRule(user.id, params.id))) return status(403, 'Forbidden')
    return { ok: true }
  })
